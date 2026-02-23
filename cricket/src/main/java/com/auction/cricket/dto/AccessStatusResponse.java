package com.auction.cricket.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccessStatusResponse {
    private boolean admin;
    private boolean fullAccessActive;
    private boolean auctionAccessActive;
}
