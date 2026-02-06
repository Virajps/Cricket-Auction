package com.auction.cricket.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import com.auction.cricket.entity.Auction;
import com.auction.cricket.entity.Team;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    Optional<Team> findByName(String name);

    boolean existsByName(String name);

    List<Team> findByAuction(Auction auction);

    long countByAuction(Auction auction);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    void deleteByAuctionId(Long auctionId);

}
