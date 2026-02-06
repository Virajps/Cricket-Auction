package com.auction.cricket.entity;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "players")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@Data
@NoArgsConstructor
public class Player {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer age;

    @Column(nullable = false)
    private String role;

    @Column(name = "base_price", nullable = false)
    private Double basePrice;

    @Column(name = "current_price", nullable = false)
    private Double currentPrice;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "mobile_number", length = 20)
    private String mobileNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PlayerStatus status = PlayerStatus.AVAILABLE;

    @Column(name = "is_icon", nullable = false)
    private Boolean isIcon = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = true)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_id", nullable = false)
    private Auction auction;

    @OneToMany(mappedBy = "player", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Bid> bids = new ArrayList<>();
}
