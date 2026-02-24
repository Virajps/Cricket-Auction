package com.auction.cricket.service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.auction.cricket.dto.AccessStatusResponse;
import com.auction.cricket.dto.AdminEntitlementRequest;
import com.auction.cricket.dto.AdminEntitlementResponse;
import com.auction.cricket.dto.UserLookupResponse;
import com.auction.cricket.entity.AccessEntitlement;
import com.auction.cricket.entity.AccessType;
import com.auction.cricket.entity.Auction;
import com.auction.cricket.entity.Role;
import com.auction.cricket.entity.User;
import com.auction.cricket.exception.ForbiddenException;
import com.auction.cricket.exception.ResourceNotFoundException;
import com.auction.cricket.repository.AccessEntitlementRepository;
import com.auction.cricket.repository.AuctionRepository;
import com.auction.cricket.repository.UserRepository;

@Service
public class AccessEntitlementService {
    private final AccessEntitlementRepository accessEntitlementRepository;
    private final UserRepository userRepository;
    private final AuctionRepository auctionRepository;

    public AccessEntitlementService(
            AccessEntitlementRepository accessEntitlementRepository,
            UserRepository userRepository,
            AuctionRepository auctionRepository) {
        this.accessEntitlementRepository = accessEntitlementRepository;
        this.userRepository = userRepository;
        this.auctionRepository = auctionRepository;
    }

    @Transactional(readOnly = true)
    public AccessStatusResponse getStatus(String username, Long auctionId) {
        AccessStatusResponse response = new AccessStatusResponse();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        boolean admin = user.getRoles() != null && user.getRoles().contains(Role.ADMIN);
        boolean fullAccess = hasActiveFullAccess(user.getId());
        boolean auctionAccess = auctionId != null && hasActiveAuctionAccess(user.getId(), auctionId);
        boolean premium = admin || fullAccess || auctionAccess;

        response.setAdmin(admin);
        response.setFullAccessActive(fullAccess);
        response.setAuctionAccessActive(auctionAccess);
        response.setPremiumAccessActive(premium);
        return response;
    }

    @Transactional(readOnly = true)
    public List<AdminEntitlementResponse> listEntitlements(String username) {
        List<AccessEntitlement> rows = (username == null || username.isBlank())
                ? accessEntitlementRepository.findAllWithRelations()
                : accessEntitlementRepository.findAllWithRelationsByUsername(username.trim());
        return rows.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public AdminEntitlementResponse grant(AdminEntitlementRequest request) {
        AccessEntitlement entitlement = new AccessEntitlement();
        applyRequest(entitlement, request, true);
        entitlement = accessEntitlementRepository.save(entitlement);
        return toResponse(entitlement);
    }

    @Transactional
    public AdminEntitlementResponse update(Long id, AdminEntitlementRequest request) {
        AccessEntitlement entitlement = accessEntitlementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Entitlement not found with id: " + id));
        applyRequest(entitlement, request, false);
        entitlement = accessEntitlementRepository.save(entitlement);
        return toResponse(entitlement);
    }

    @Transactional
    public void revoke(Long id) {
        if (!accessEntitlementRepository.existsById(id)) {
            throw new ResourceNotFoundException("Entitlement not found with id: " + id);
        }
        accessEntitlementRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<UserLookupResponse> searchUsers(String query) {
        String q = query == null ? "" : query.trim();
        return userRepository.findTop50ByUsernameContainingIgnoreCaseOrderByUsernameAsc(q).stream()
                .map(u -> new UserLookupResponse(u.getId(), u.getUsername()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean hasPremiumAccess(String username, Long auctionId) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return false;
        }
        if (user.getRoles() != null && user.getRoles().contains(Role.ADMIN)) {
            return true;
        }
        return hasActiveFullAccess(user.getId()) || (auctionId != null && hasActiveAuctionAccess(user.getId(), auctionId));
    }

    @Transactional(readOnly = true)
    public void requirePremiumAccess(String username, Long auctionId, String featureName) {
        if (!hasPremiumAccess(username, auctionId)) {
            throw new ForbiddenException(featureName + " is available only on paid access.");
        }
    }

    @Transactional(readOnly = true)
    public void enforceFreeTeamLimit(String username, Long auctionId, long currentTeamCount) {
        if (hasPremiumAccess(username, auctionId)) {
            return;
        }
        if (currentTeamCount >= 2) {
            throw new ForbiddenException("Free team limit reached. Free plan allows up to 2 teams per auction.");
        }
    }

    private void applyRequest(AccessEntitlement entitlement, AdminEntitlementRequest request, boolean isCreate) {
        if (request == null) {
            throw new IllegalArgumentException("Request is required.");
        }
        String username = request.getUsername() == null ? null : request.getUsername().trim();
        if (username == null || username.isEmpty()) {
            throw new IllegalArgumentException("Username is required.");
        }
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        if (request.getAccessType() == null) {
            throw new IllegalArgumentException("Access type is required.");
        }

        Auction auction = null;
        if (request.getAccessType() == AccessType.PER_AUCTION) {
            if (request.getAuctionId() == null) {
                throw new IllegalArgumentException("Auction ID is required for PER_AUCTION access.");
            }
            auction = auctionRepository.findById(request.getAuctionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + request.getAuctionId()));
        }

        LocalDateTime startsAt = parseDateTime(request.getStartsAt());
        LocalDateTime expiresAt = parseDateTime(request.getExpiresAt());
        if (startsAt == null) {
            startsAt = isCreate ? LocalDateTime.now() : entitlement.getStartsAt();
        }
        if (startsAt == null) {
            startsAt = LocalDateTime.now();
        }

        if (request.getAccessType() == AccessType.FULL_MONTHLY && expiresAt == null) {
            expiresAt = startsAt.plusMonths(1);
        } else if (request.getAccessType() == AccessType.FULL_YEARLY && expiresAt == null) {
            expiresAt = startsAt.plusYears(1);
        }

        if (expiresAt != null && expiresAt.isBefore(startsAt)) {
            throw new IllegalArgumentException("Expires At must be after Starts At.");
        }

        entitlement.setUser(user);
        entitlement.setAccessType(request.getAccessType());
        entitlement.setAuction(auction);
        entitlement.setStartsAt(startsAt);
        entitlement.setExpiresAt(expiresAt);
        entitlement.setNotes(request.getNotes() == null || request.getNotes().isBlank() ? null : request.getNotes().trim());
    }

    private LocalDateTime parseDateTime(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String v = value.trim();
        try {
            return LocalDateTime.parse(v);
        } catch (DateTimeParseException ignored) {
        }
        try {
            return OffsetDateTime.parse(v).atZoneSameInstant(ZoneId.systemDefault()).toLocalDateTime();
        } catch (DateTimeParseException ignored) {
        }
        try {
            return LocalDateTime.ofInstant(Instant.parse(v), ZoneId.systemDefault());
        } catch (DateTimeParseException ignored) {
        }
        throw new IllegalArgumentException("Invalid date-time format: " + value);
    }

    private boolean hasActiveFullAccess(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        return accessEntitlementRepository.findByUserIdWithAuction(userId).stream()
                .anyMatch(e -> e.getAccessType() != AccessType.PER_AUCTION && isActive(e, now));
    }

    private boolean hasActiveAuctionAccess(Long userId, Long auctionId) {
        LocalDateTime now = LocalDateTime.now();
        return accessEntitlementRepository.findByUserIdWithAuction(userId).stream()
                .anyMatch(e -> e.getAccessType() == AccessType.PER_AUCTION
                        && e.getAuction() != null
                        && auctionId.equals(e.getAuction().getId())
                        && isActive(e, now));
    }

    private boolean isActive(AccessEntitlement e, LocalDateTime now) {
        LocalDateTime starts = e.getStartsAt();
        LocalDateTime expires = e.getExpiresAt();
        boolean started = starts == null || !now.isBefore(starts);
        boolean notExpired = expires == null || !now.isAfter(expires);
        return started && notExpired;
    }

    private AdminEntitlementResponse toResponse(AccessEntitlement e) {
        LocalDateTime now = LocalDateTime.now();
        AdminEntitlementResponse response = new AdminEntitlementResponse();
        response.setId(e.getId());
        response.setUserId(e.getUser() != null ? e.getUser().getId() : null);
        response.setUsername(e.getUser() != null ? e.getUser().getUsername() : null);
        response.setAccessType(e.getAccessType());
        response.setAuctionId(e.getAuction() != null ? e.getAuction().getId() : null);
        response.setAuctionName(e.getAuction() != null ? e.getAuction().getName() : null);
        response.setStartsAt(e.getStartsAt());
        response.setExpiresAt(e.getExpiresAt());
        response.setActive(isActive(e, now));
        response.setNotes(e.getNotes());
        return response;
    }
}
