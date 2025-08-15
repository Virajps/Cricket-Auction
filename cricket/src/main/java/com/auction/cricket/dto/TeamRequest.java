package com.auction.cricket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TeamRequest {
    @NotBlank(message = "Team name is required")
    private String name;
    private String logoUrl;
    @NotNull(message = "Active status is required")
    private Boolean isActive;
}