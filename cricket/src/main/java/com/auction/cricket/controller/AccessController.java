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
    public ResponseEntity<AccessStatusResponse> getStatus(
            @RequestParam(required = false) Long auctionId,
            Authentication authentication) {
        return ResponseEntity.ok(accessEntitlementService.getStatus(authentication.getName(), auctionId));
    }
}
