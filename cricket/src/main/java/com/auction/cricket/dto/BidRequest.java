package com.auction.cricket.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BidRequest {
    @NotNull(message = "Player ID is required")
    private Long playerId;

    @NotNull(message = "Amount is required")
    @Min(value = 0, message = "Bid amount must be positive")
    private Double amount;

    @NotNull(message = "Team ID is required")
    private Long teamId;
} 