package com.auction.cricket.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PlayerRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Age is required")
    @Min(value = 18, message = "Player must be at least 18 years old")
    private Integer age;

    @NotBlank(message = "Role is required")
    private String role;

    @NotNull(message = "Base price is required")
    @Min(value = 0, message = "Base price must be positive")
    private Double basePrice;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Nationality is required")
    private String nationality;

    private String battingStyle;

    private String bowlingStyle;

    private String status;
}