package com.auction.cricket.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.auction.cricket.dto.AccessEntitlementResponse;
import com.auction.cricket.dto.GrantEntitlementRequest;
import com.auction.cricket.service.AccessEntitlementService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/entitlements")
public class AdminAccessController {

    private final AccessEntitlementService accessEntitlementService;

    public AdminAccessController(AccessEntitlementService accessEntitlementService) {
        this.accessEntitlementService = accessEntitlementService;
    }

    @PostMapping
    public ResponseEntity<AccessEntitlementResponse> grant(
            @Valid @RequestBody GrantEntitlementRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(accessEntitlementService.grantEntitlement(authentication.getName(), request));
    }

    @GetMapping
    public ResponseEntity<List<AccessEntitlementResponse>> list(
            @RequestParam(required = false) String username,
            Authentication authentication) {
        return ResponseEntity.ok(accessEntitlementService.getEntitlements(authentication.getName(), username));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> revoke(@PathVariable Long id, Authentication authentication) {
        accessEntitlementService.revokeEntitlement(authentication.getName(), id);
        return ResponseEntity.ok().build();
    }
}
