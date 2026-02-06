package com.auction.cricket.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PlayerRequest {
    @NotBlank(message = "Name is required")
    private String name;

    // age is optional
    private Integer age;

    @NotBlank(message = "Role is required")
    private String role;

    @Min(value = 0, message = "Base price cannot be negative")
    private Double basePrice;

    @Pattern(regexp = "^\\+?[1-9]\\d{6,14}$", message = "Invalid mobile number")
    @Size(max = 20)
    private String mobileNumber;

    private String status;

    private String photoUrl;

    private Boolean isIcon;
}
