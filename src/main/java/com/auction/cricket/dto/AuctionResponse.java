package com.auction.cricket.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class AuctionResponse {
    private Long id;
    private String name;
    private String logoUrl;
    private LocalDateTime auctionDate;
    private Integer pointsPerTeam;
    private Integer totalTeams;
    private Double minimumBid;
    private Double bidIncreaseBy;
    private Integer playersPerTeam;
    private Boolean isActive;
    private String createdBy;
    private List<TeamResponse> teams;
    private List<PlayerResponse> players;
    private List<BidRuleResponse> bidRules;
    private List<CategoryResponse> categories;
    private List<SponsorResponse> sponsors;
    private Boolean playerRegistrationEnabled;
    private String overlayUrl;
    private String summaryUrl;
} 