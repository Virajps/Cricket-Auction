package com.auction.cricket.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BidResponse {
    private Long id;
    private Long playerId;
    private String playerName;
    private Long teamId;
    private String teamName;
    private Double amount;
    private LocalDateTime timestamp;
    private Boolean isWinningBid;
} 