package com.auction.cricket.repository;

import com.auction.cricket.entity.Auction;
import com.auction.cricket.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, Long> {
    List<Auction> findByCreatedBy(User user);
    
    @Query("SELECT a FROM Auction a WHERE a.auctionDate > :now AND a.isActive = true")
    List<Auction> findUpcomingAuctions(LocalDateTime now);
    
    @Query("SELECT a FROM Auction a WHERE a.auctionDate <= :now AND a.auctionDate > :twoDaysAgo AND a.isActive = true")
    List<Auction> findRecentAuctions(LocalDateTime now, LocalDateTime twoDaysAgo);
    
    @Query("SELECT a FROM Auction a WHERE a.auctionDate <= :now AND a.isActive = true")
    List<Auction> findPastAuctions(LocalDateTime now);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM Auction a WHERE a.id = :id")
    void deleteByIdDirect(@Param("id") Long id);
}
