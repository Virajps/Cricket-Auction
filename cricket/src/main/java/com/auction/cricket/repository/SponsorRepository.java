package com.auction.cricket.repository;

import com.auction.cricket.entity.Sponsor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

@Repository
public interface SponsorRepository extends JpaRepository<Sponsor, Long> {
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    void deleteByAuctionId(Long auctionId);
}
