package com.auction.cricket.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamResponse {
    private Long id;
    private String name;
    private Double budgetAmount;
    private Double remainingBudget;
    private Integer pointsUsed;
    private Integer playersCount;
    private String auctionName;
    private String ownerName;
    private Boolean isActive;
    private Long auctionId;
    private String logoUrl;
}