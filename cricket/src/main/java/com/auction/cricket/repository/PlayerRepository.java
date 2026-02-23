package com.auction.cricket.repository;

import com.auction.cricket.entity.Auction;
import com.auction.cricket.entity.Player;
import com.auction.cricket.entity.Team;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {
    List<Player> findByTeamId(Long teamId);
    List<Player> findByRole(String role);
    List<Player> findByTeamIsNull();
    List<Player> findByTeam(Team team);
    List<Player> findByAuction(Auction auction);
    List<Player> findByAuctionAndTeamIsNull(Auction auction);
    List<Player> findByAuctionAndTeam(Auction auction, Team team);
    List<Player> findByStatus(com.auction.cricket.entity.PlayerStatus status);
    List<Player> findByAuctionAndStatus(Auction auction, com.auction.cricket.entity.PlayerStatus status);
    long countByAuction(Auction auction);

    long countByAuctionAndTeam(Auction auction, Team team);

    @Query("select coalesce(sum(p.currentPrice), 0) from Player p where p.auction = :auction and p.team = :team and p.status = com.auction.cricket.entity.PlayerStatus.SOLD")
    Double sumSoldPriceByAuctionAndTeam(@Param("auction") Auction auction, @Param("team") Team team);
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    void deleteByAuctionId(Long auctionId);
} 
