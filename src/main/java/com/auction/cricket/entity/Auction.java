package com.auction.cricket.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "auctions")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@Data
@NoArgsConstructor
public class Auction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "auction_date", nullable = false)
    private LocalDateTime auctionDate;

    @Column(name = "points_per_team", nullable = false)
    private Integer pointsPerTeam;

    @Column(name = "total_teams", nullable = false)
    private Integer totalTeams;

    @Column(name = "minimum_bid", nullable = false)
    private Double minimumBid;

    @Column(name = "bid_increase_by", nullable = false)
    private Double bidIncreaseBy;

    @Column(name = "base_price", nullable = false)
    private Double basePrice;

    @Column(name = "players_per_team", nullable = false)
    private Integer playersPerTeam;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL, orphanRemoval = true)
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    private List<Team> teams = new ArrayList<>();

    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Player> players = new ArrayList<>();

    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BidRule> bidRules = new ArrayList<>();

    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Category> categories = new ArrayList<>();

    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Sponsor> sponsors = new ArrayList<>();

    @Column(name = "player_registration_enabled", nullable = false)
    private Boolean playerRegistrationEnabled = true;

    @Column(name = "overlay_url")
    private String overlayUrl;

    @Column(name = "summary_url")
    private String summaryUrl;

    
} 