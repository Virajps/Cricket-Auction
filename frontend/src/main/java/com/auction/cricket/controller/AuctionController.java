package com.auction.cricket.controller;

import com.auction.cricket.dto.AuctionRequest;
import com.auction.cricket.dto.AuctionResponse;
import com.auction.cricket.service.AuctionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auctions")
public class AuctionController {

    private final AuctionService auctionService;

    public AuctionController(AuctionService auctionService) {
        this.auctionService = auctionService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuctionResponse> getAuctionById(@PathVariable Long id) {
        return ResponseEntity.ok(auctionService.getAuctionById(id));
    }

    @PostMapping
    public ResponseEntity<AuctionResponse> createAuction(
            @RequestBody AuctionRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(auctionService.createAuction(request, authentication.getName()));
    }

    @GetMapping("/my-auctions")
    public ResponseEntity<List<AuctionResponse>> getMyAuctions(Authentication authentication) {
        return ResponseEntity.ok(auctionService.getAuctionsByUser(authentication.getName()));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<AuctionResponse>> getUpcomingAuctions() {
        return ResponseEntity.ok(auctionService.getUpcomingAuctions());
    }

    @GetMapping("/recent")
    public ResponseEntity<List<AuctionResponse>> getRecentAuctions() {
        return ResponseEntity.ok(auctionService.getRecentAuctions());
    }

    @GetMapping("/past")
    public ResponseEntity<List<AuctionResponse>> getPastAuctions() {
        return ResponseEntity.ok(auctionService.getPastAuctions());
    }

    @GetMapping
    public ResponseEntity<List<AuctionResponse>> getAllAuctions() {
        return ResponseEntity.ok(auctionService.getAllAuctions());
    }

    @PutMapping("/{id}")
    public ResponseEntity<AuctionResponse> updateAuction(
            @PathVariable Long id,
            @RequestBody AuctionRequest request) {
        return ResponseEntity.ok(auctionService.updateAuction(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAuction(@PathVariable Long id) {
        auctionService.deleteAuction(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/toggle-registration")
    public ResponseEntity<AuctionResponse> togglePlayerRegistration(@PathVariable Long id) {
        return ResponseEntity.ok(auctionService.togglePlayerRegistration(id));
    }

    @PostMapping("/{id}/toggle-status")
    public ResponseEntity<AuctionResponse> toggleAuctionStatus(@PathVariable Long id) {
        return ResponseEntity.ok(auctionService.toggleAuctionStatus(id));
    }
} 