package com.auction.cricket.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.auction.cricket.dto.BidResponse;
import com.auction.cricket.service.BidService;

@RestController
@RequestMapping("/api/auctions/{auctionId}/bids")
public class AuctionBidController {

    private final BidService bidService;

    public AuctionBidController(BidService bidService) {
        this.bidService = bidService;
    }

    @GetMapping
    public ResponseEntity<List<BidResponse>> getBidsByAuction(@PathVariable Long auctionId) {
        return ResponseEntity.ok(bidService.getBidsByAuction(auctionId));
    }
}
