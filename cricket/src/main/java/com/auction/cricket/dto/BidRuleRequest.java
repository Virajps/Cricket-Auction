package com.auction.cricket.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BidRuleRequest {
    @NotNull(message = "Threshold amount is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Threshold amount must be non-negative")
    private Double thresholdAmount;

    @NotNull(message = "Increment amount is required")
    @DecimalMin(value = "1.0", inclusive = true, message = "Increment amount must be at least 1")
    private Double incrementAmount;
}
