package com.auction.cricket.dto;

import lombok.Data;

@Data
public class PlayerResponse {
    private Long id;
    private String name;
    private Integer age;
    private String role;
    private Double basePrice;
    private String mobileNumber;
    private String teamName;
    private String status;
    private boolean isSold;
    private boolean isUnsold;
    private Double currentPrice;
    private String photoUrl;
    private Boolean isIcon;

}
