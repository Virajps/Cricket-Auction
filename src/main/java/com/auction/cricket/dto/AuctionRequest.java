package com.auction.cricket.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AuctionRequest {
    @NotBlank(message = "Auction name is required")
    private String name;

    private String logoUrl;

    @NotNull(message = "Auction date is required")
    @Future(message = "Auction date must be in the future")
    private LocalDateTime auctionDate;

    @NotNull(message = "Points per team is required")
    @Min(value = 1, message = "Points per team must be at least 1")
    private Integer pointsPerTeam;

    @NotNull(message = "Total teams is required")
    @Min(value = 1, message = "Total teams must be at least 1")
    private Integer totalTeams;

    @NotNull(message = "Minimum bid is required")
    @Min(value = 0, message = "Minimum bid must be non-negative")
    private Double minimumBid;

    @NotNull(message = "Bid increase by is required")
    @Min(value = 1, message = "Bid increase must be at least 1")
    private Double bidIncreaseBy;

    @NotNull(message = "Players per team is required")
    @Min(value = 1, message = "Players per team must be at least 1")
    private Integer playersPerTeam;
} 