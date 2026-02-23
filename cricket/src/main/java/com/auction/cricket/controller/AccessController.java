package com.auction.cricket.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.auction.cricket.dto.AccessStatusResponse;
import com.auction.cricket.service.AccessEntitlementService;

@RestController
@RequestMapping("/api/access")
public class AccessController {
    private final AccessEntitlementService accessEntitlementService;

    public AccessController(AccessEntitlementService accessEntitlementService) {
        this.accessEntitlementService = accessEntitlementService;
    }

    @GetMapping("/status")
    public ResponseEntity<AccessStatusResponse> status(
            @RequestParam(required = false) Long auctionId,
            Authentication authentication) {
        String username = authentication.getName();
        boolean isAdmin = accessEntitlementService.isAdmin(username);
        boolean fullAccess = accessEntitlementService.hasFullAccess(username);
        boolean auctionAccess = auctionId != null && accessEntitlementService.hasPremiumAccess(username, auctionId);
        return ResponseEntity.ok(new AccessStatusResponse(isAdmin, fullAccess, auctionAccess));
    }
}
