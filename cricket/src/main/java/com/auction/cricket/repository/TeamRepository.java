package com.auction.cricket.repository;

import com.auction.cricket.entity.Team;
import com.auction.cricket.entity.User;
import com.auction.cricket.entity.Auction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    Optional<Team> findByName(String name);
    boolean existsByName(String name);
    List<Team> findByAuction(Auction auction);
    long countByAuction(Auction auction);
} 