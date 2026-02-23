package com.auction.cricket.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.auction.cricket.dto.AccessEntitlementResponse;
import com.auction.cricket.dto.GrantEntitlementRequest;
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

    public AccessEntitlementService(AccessEntitlementRepository accessEntitlementRepository, UserRepository userRepository,
            AuctionRepository auctionRepository) {
        this.accessEntitlementRepository = accessEntitlementRepository;
        this.userRepository = userRepository;
        this.auctionRepository = auctionRepository;
    }

    @Transactional
    public AccessEntitlementResponse grantEntitlement(String grantedByUsername, GrantEntitlementRequest request) {
        User grantedBy = getUser(grantedByUsername);
        if (!grantedBy.getRoles().contains(Role.ADMIN)) {
            throw new ForbiddenException("Only ADMIN can manage entitlements.");
        }

        User user = getUser(request.getUsername());
        Auction auction = null;
        if (request.getAuctionId() != null) {
            auction = auctionRepository.findById(request.getAuctionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + request.getAuctionId()));
        }

        if (request.getAccessType() == AccessType.PER_AUCTION && auction == null) {
            throw new IllegalArgumentException("auctionId is required for PER_AUCTION access.");
        }
        if ((request.getAccessType() == AccessType.FULL_MONTHLY || request.getAccessType() == AccessType.FULL_YEARLY)
                && auction != null) {
            throw new IllegalArgumentException("auctionId is not allowed for full-access plans.");
        }

        LocalDateTime startsAt = request.getStartsAt() != null ? request.getStartsAt() : LocalDateTime.now();
        LocalDateTime expiresAt = resolveExpiry(request.getAccessType(), startsAt, request.getExpiresAt());
        if (!expiresAt.isAfter(startsAt)) {
            throw new IllegalArgumentException("expiresAt must be after startsAt.");
        }

        AccessEntitlement entitlement = new AccessEntitlement();
        entitlement.setUser(user);
        entitlement.setAccessType(request.getAccessType());
        entitlement.setAuction(auction);
        entitlement.setStartsAt(startsAt);
        entitlement.setExpiresAt(expiresAt);
        entitlement.setNotes(request.getNotes());
        entitlement.setGrantedBy(grantedBy);

        return mapToResponse(accessEntitlementRepository.save(entitlement));
    }

    @Transactional(readOnly = true)
    public List<AccessEntitlementResponse> getEntitlements(String actorUsername, String usernameFilter) {
        User actor = getUser(actorUsername);
        if (!actor.getRoles().contains(Role.ADMIN)) {
            throw new ForbiddenException("Only ADMIN can view entitlements.");
        }
        if (usernameFilter != null && !usernameFilter.isBlank()) {
            return accessEntitlementRepository.findByUserUsernameOrderByStartsAtDesc(usernameFilter.trim()).stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }
        return accessEntitlementRepository.findAll().stream()
                .sorted((a, b) -> b.getStartsAt().compareTo(a.getStartsAt()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void revokeEntitlement(String actorUsername, Long entitlementId) {
        User actor = getUser(actorUsername);
        if (!actor.getRoles().contains(Role.ADMIN)) {
            throw new ForbiddenException("Only ADMIN can revoke entitlements.");
        }
        AccessEntitlement entitlement = accessEntitlementRepository.findById(entitlementId)
                .orElseThrow(() -> new ResourceNotFoundException("Entitlement not found with id: " + entitlementId));
        accessEntitlementRepository.delete(entitlement);
    }

    @Transactional(readOnly = true)
    public boolean hasPremiumAccess(String username, Long auctionId) {
        User user = getUser(username);
        if (user.getRoles().contains(Role.ADMIN)) {
            return true;
        }
        return hasFullAccess(username) || hasPerAuctionAccess(username, auctionId);
    }

    @Transactional(readOnly = true)
    public boolean hasFullAccess(String username) {
        LocalDateTime now = LocalDateTime.now();
        List<AccessEntitlement> activeEntitlements = accessEntitlementRepository
                .findByUserUsernameAndExpiresAtGreaterThanEqualOrderByStartsAtDesc(username, now);
        return activeEntitlements.stream()
                .anyMatch(e -> (e.getAccessType() == AccessType.FULL_MONTHLY || e.getAccessType() == AccessType.FULL_YEARLY)
                        && (e.getStartsAt().isBefore(now) || e.getStartsAt().isEqual(now)));
    }

    @Transactional(readOnly = true)
    public boolean hasPerAuctionAccess(String username, Long auctionId) {
        if (auctionId == null) {
            return false;
        }
        LocalDateTime now = LocalDateTime.now();
        return accessEntitlementRepository
                .findByUserUsernameAndAuctionIdAndExpiresAtGreaterThanEqualOrderByStartsAtDesc(username, auctionId, now)
                .stream()
                .anyMatch(e -> e.getAccessType() == AccessType.PER_AUCTION
                        && (e.getStartsAt().isBefore(now) || e.getStartsAt().isEqual(now)));
    }

    @Transactional(readOnly = true)
    public void requirePremiumAccess(String username, Long auctionId, String featureName) {
        if (!hasPremiumAccess(username, auctionId)) {
            throw new ForbiddenException(featureName + " is available only on paid access.");
        }
    }

    @Transactional(readOnly = true)
    public void enforceFreeTeamLimit(String username, Long auctionId, long currentTeams) {
        if (hasPremiumAccess(username, auctionId)) {
            return;
        }
        if (currentTeams >= 2) {
            throw new ForbiddenException("Free plan allows only 2 teams per auction.");
        }
    }

    @Transactional(readOnly = true)
    public boolean isAdmin(String username) {
        User user = getUser(username);
        return user.getRoles().contains(Role.ADMIN);
    }

    @Transactional(readOnly = true)
    public AccessEntitlementResponse getActiveEntitlementsSummary(String username, Long auctionId) {
        AccessEntitlementResponse response = new AccessEntitlementResponse();
        response.setUsername(username);
        response.setActive(hasPremiumAccess(username, auctionId));
        return response;
    }

    private LocalDateTime resolveExpiry(AccessType accessType, LocalDateTime startsAt, LocalDateTime requestedExpiry) {
        if (requestedExpiry != null) {
            return requestedExpiry;
        }
        return switch (accessType) {
            case PER_AUCTION -> startsAt.plusDays(30);
            case FULL_MONTHLY -> startsAt.plusMonths(1);
            case FULL_YEARLY -> startsAt.plusYears(1);
        };
    }

    private AccessEntitlementResponse mapToResponse(AccessEntitlement entitlement) {
        AccessEntitlementResponse response = new AccessEntitlementResponse();
        response.setId(entitlement.getId());
        response.setUsername(entitlement.getUser().getUsername());
        response.setAccessType(entitlement.getAccessType());
        if (entitlement.getAuction() != null) {
            response.setAuctionId(entitlement.getAuction().getId());
            response.setAuctionName(entitlement.getAuction().getName());
        }
        response.setStartsAt(entitlement.getStartsAt());
        response.setExpiresAt(entitlement.getExpiresAt());
        response.setNotes(entitlement.getNotes());
        response.setGrantedBy(entitlement.getGrantedBy().getUsername());
        LocalDateTime now = LocalDateTime.now();
        response.setActive((entitlement.getStartsAt().isBefore(now) || entitlement.getStartsAt().isEqual(now))
                && (entitlement.getExpiresAt().isAfter(now) || entitlement.getExpiresAt().isEqual(now)));
        return response;
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }
}
