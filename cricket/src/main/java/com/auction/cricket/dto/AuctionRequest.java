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
    @DecimalMin(value = "0.0", inclusive = true, message = "Minimum bid must be non-negative")
    private Double minimumBid;

    @NotNull(message = "Bid increase by is required")
    @DecimalMin(value = "0.01", inclusive = true, message = "Bid increase must be at least 0.01")
    private Double bidIncreaseBy;

    @NotNull(message = "Base price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Base price must be non-negative")
    private Double basePrice;

    @NotNull(message = "Players per team is required")
    @Min(value = 1, message = "Players per team must be at least 1")
    private Integer playersPerTeam;

    @NotNull(message = "Active status is required")
    private Boolean isActive;

    @NotNull(message = "Player registration enabled status is required")
    private Boolean playerRegistrationEnabled;
} 
