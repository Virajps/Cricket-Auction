package com.auction.cricket.dto;

import lombok.Data;

@Data
public class SponsorResponse {
    private Long id;
    private String name;
    private String logoUrl;
    private String website;
    private String description;
}
