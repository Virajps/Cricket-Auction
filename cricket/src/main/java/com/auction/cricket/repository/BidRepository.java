package com.auction.cricket.repository;

import com.auction.cricket.entity.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findByPlayerIdOrderByAmountDesc(Long playerId);
    List<Bid> findByPlayerIdAndPlayerAuctionIdOrderByAmountDesc(Long playerId, Long auctionId);
    List<Bid> findByPlayerAuctionIdOrderByAmountDesc(Long auctionId);
    List<Bid> findByTeamId(Long teamId);
    Bid findTopByPlayerIdOrderByAmountDesc(Long playerId);
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    void deleteByPlayerAuctionId(Long auctionId);
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    void deleteByTeamAuctionId(Long auctionId);
} 
