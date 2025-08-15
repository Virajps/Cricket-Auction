package com.auction.cricket.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "bid_rules")
@Data
@NoArgsConstructor
public class BidRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "threshold_amount", nullable = false)
    private Double thresholdAmount;

    @Column(name = "increment_amount", nullable = false)
    private Double incrementAmount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_id", nullable = false)
    private Auction auction;
} 