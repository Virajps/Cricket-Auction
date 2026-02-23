package com.auction.cricket.dto;

import java.time.LocalDateTime;

import com.auction.cricket.entity.AccessType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GrantEntitlementRequest {
    @NotBlank(message = "Username is required")
    private String username;

    @NotNull(message = "Access type is required")
    private AccessType accessType;

    private Long auctionId;
    private LocalDateTime startsAt;
    private LocalDateTime expiresAt;
    private String notes;
}
