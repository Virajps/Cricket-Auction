package com.auction.cricket.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.auction.cricket.dto.BidRuleRequest;
import com.auction.cricket.dto.BidRuleResponse;
import com.auction.cricket.entity.Auction;
import com.auction.cricket.entity.BidRule;
import com.auction.cricket.exception.ResourceNotFoundException;
import com.auction.cricket.repository.AuctionRepository;
import com.auction.cricket.repository.BidRuleRepository;
import com.auction.cricket.service.AccessEntitlementService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auctions/{auctionId}/bid-rules")
public class BidRuleController {

    private final BidRuleRepository bidRuleRepository;
    private final AuctionRepository auctionRepository;
    private final AccessEntitlementService accessEntitlementService;

    public BidRuleController(BidRuleRepository bidRuleRepository, AuctionRepository auctionRepository,
            AccessEntitlementService accessEntitlementService) {
        this.bidRuleRepository = bidRuleRepository;
        this.auctionRepository = auctionRepository;
        this.accessEntitlementService = accessEntitlementService;
    }

    @GetMapping
    public ResponseEntity<List<BidRuleResponse>> getAll(@PathVariable Long auctionId, Authentication authentication) {
        accessEntitlementService.requirePremiumAccess(authentication.getName(), auctionId, "Bid increment rules");
        return ResponseEntity.ok(
                bidRuleRepository.findByAuctionIdOrderByThresholdAmountAsc(auctionId).stream()
                        .map(this::toResponse)
                        .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BidRuleResponse> getById(@PathVariable Long auctionId, @PathVariable Long id,
            Authentication authentication) {
        accessEntitlementService.requirePremiumAccess(authentication.getName(), auctionId, "Bid increment rules");
        BidRule rule = bidRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bid rule not found with id: " + id));
        if (!rule.getAuction().getId().equals(auctionId)) {
            throw new ResourceNotFoundException("Bid rule not found for auction: " + auctionId);
        }
        return ResponseEntity.ok(toResponse(rule));
    }

    @PostMapping
    public ResponseEntity<BidRuleResponse> create(@PathVariable Long auctionId,
            @Valid @RequestBody BidRuleRequest request,
            Authentication authentication) {
        accessEntitlementService.requirePremiumAccess(authentication.getName(), auctionId, "Bid increment rules");
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));
        BidRule rule = new BidRule();
        rule.setThresholdAmount(request.getThresholdAmount());
        rule.setIncrementAmount(request.getIncrementAmount());
        rule.setAuction(auction);
        rule = bidRuleRepository.save(rule);
        return ResponseEntity.ok(toResponse(rule));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BidRuleResponse> update(@PathVariable Long auctionId, @PathVariable Long id,
            @Valid @RequestBody BidRuleRequest request,
            Authentication authentication) {
        accessEntitlementService.requirePremiumAccess(authentication.getName(), auctionId, "Bid increment rules");
        BidRule rule = bidRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bid rule not found with id: " + id));
        if (!rule.getAuction().getId().equals(auctionId)) {
            throw new ResourceNotFoundException("Bid rule not found for auction: " + auctionId);
        }
        rule.setThresholdAmount(request.getThresholdAmount());
        rule.setIncrementAmount(request.getIncrementAmount());
        rule = bidRuleRepository.save(rule);
        return ResponseEntity.ok(toResponse(rule));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long auctionId, @PathVariable Long id,
            Authentication authentication) {
        accessEntitlementService.requirePremiumAccess(authentication.getName(), auctionId, "Bid increment rules");
        BidRule rule = bidRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bid rule not found with id: " + id));
        if (!rule.getAuction().getId().equals(auctionId)) {
            throw new ResourceNotFoundException("Bid rule not found for auction: " + auctionId);
        }
        bidRuleRepository.delete(rule);
        return ResponseEntity.ok().build();
    }

    private BidRuleResponse toResponse(BidRule rule) {
        BidRuleResponse response = new BidRuleResponse();
        response.setId(rule.getId());
        response.setThresholdAmount(rule.getThresholdAmount());
        response.setIncrementAmount(rule.getIncrementAmount());
        return response;
    }
}
