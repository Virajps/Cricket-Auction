package com.auction.cricket.dto;

import lombok.Data;

@Data
public class UpdatePlayerStatusRequest {
    private String status;
    private Long teamId;
    private Double finalBidAmount;
}
