package com.auction.cricket.controller;

import com.auction.cricket.dto.BidRequest;
import com.auction.cricket.dto.BidResponse;
import com.auction.cricket.entity.User;
import com.auction.cricket.service.BidService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auctions/{auctionId}/players/{playerId}/bids")
public class BidController {

    @Autowired
    private BidService bidService;

    @PostMapping
    public ResponseEntity<BidResponse> placeBid(
            @Valid @RequestBody BidRequest request,
            @RequestParam Long teamId) {
        return ResponseEntity.ok(bidService.placeBid(request, teamId));
    }

    @GetMapping
    public ResponseEntity<List<BidResponse>> getBidsByPlayer(@PathVariable Long auctionId, @PathVariable Long playerId) {
        return ResponseEntity.ok(bidService.getBidsByPlayer(auctionId, playerId));
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<BidResponse>> getBidsByTeam(@PathVariable Long teamId) {
        return ResponseEntity.ok(bidService.getBidsByTeam(teamId));
    }
} 