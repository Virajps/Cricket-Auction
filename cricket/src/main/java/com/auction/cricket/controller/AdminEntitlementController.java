package com.auction.cricket.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.auction.cricket.dto.AdminEntitlementRequest;
import com.auction.cricket.dto.AdminEntitlementResponse;
import com.auction.cricket.dto.UserLookupResponse;
import com.auction.cricket.entity.Role;
import com.auction.cricket.entity.User;
import com.auction.cricket.exception.ForbiddenException;
import com.auction.cricket.exception.ResourceNotFoundException;
import com.auction.cricket.repository.UserRepository;
import com.auction.cricket.service.AccessEntitlementService;

@RestController
@RequestMapping("/api/admin/entitlements")
public class AdminEntitlementController {
    private final AccessEntitlementService accessEntitlementService;
    private final UserRepository userRepository;

    public AdminEntitlementController(
            AccessEntitlementService accessEntitlementService,
            UserRepository userRepository) {
        this.accessEntitlementService = accessEntitlementService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<AdminEntitlementResponse>> list(
            @RequestParam(required = false) String username,
            Authentication authentication) {
        ensureAdmin(authentication);
        return ResponseEntity.ok(accessEntitlementService.listEntitlements(username));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserLookupResponse>> searchUsers(
            @RequestParam(required = false, defaultValue = "") String query,
            Authentication authentication) {
        ensureAdmin(authentication);
        return ResponseEntity.ok(accessEntitlementService.searchUsers(query));
    }

    @PostMapping
    public ResponseEntity<AdminEntitlementResponse> grant(
            @RequestBody AdminEntitlementRequest request,
            Authentication authentication) {
        ensureAdmin(authentication);
        return ResponseEntity.ok(accessEntitlementService.grant(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminEntitlementResponse> update(
            @PathVariable Long id,
            @RequestBody AdminEntitlementRequest request,
            Authentication authentication) {
        ensureAdmin(authentication);
        return ResponseEntity.ok(accessEntitlementService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> revoke(@PathVariable Long id, Authentication authentication) {
        ensureAdmin(authentication);
        accessEntitlementService.revoke(id);
        return ResponseEntity.ok().build();
    }

    private void ensureAdmin(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ForbiddenException("Only admin can access this endpoint.");
        }
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authentication.getName()));
        if (user.getRoles() == null || !user.getRoles().contains(Role.ADMIN)) {
            throw new ForbiddenException("Only admin can access this endpoint.");
        }
    }
}
