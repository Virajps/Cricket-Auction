package com.auction.cricket.dto;

import lombok.Data;

@Data
public class BidRuleResponse {
    private Long id;
    private Double thresholdAmount;
    private Double incrementAmount;
} 