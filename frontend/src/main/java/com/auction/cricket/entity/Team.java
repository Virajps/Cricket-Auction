package com.auction.cricket.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "teams", indexes = {
    @Index(name = "idx_auction_name", columnList = "auction_id, name", unique = true),
    
})
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@Data
@NoArgsConstructor
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "budget_amount", nullable = false)
    private Double budgetAmount;

    @Column(name = "remaining_budget", nullable = false)
    private Double remainingBudget;

    @Column(name = "points_used", nullable = false)
    private Integer pointsUsed;

    @Column(name = "players_count", nullable = false)
    private Integer playersCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_id", nullable = false)
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    private Auction auction;

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Player> players = new HashSet<>();

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    private List<Bid> bids;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
} 