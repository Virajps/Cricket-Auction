package com.auction.cricket.dto;

import java.time.LocalDateTime;

import com.auction.cricket.entity.AccessType;

import lombok.Data;

@Data
public class AccessEntitlementResponse {
    private Long id;
    private String username;
    private AccessType accessType;
    private Long auctionId;
    private String auctionName;
    private LocalDateTime startsAt;
    private LocalDateTime expiresAt;
    private String notes;
    private String grantedBy;
    private boolean active;
}
