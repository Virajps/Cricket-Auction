package com.auction.cricket.repository;

import com.auction.cricket.entity.BidRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BidRuleRepository extends JpaRepository<BidRule, Long> {
    List<BidRule> findByAuctionIdOrderByThresholdAmountAsc(Long auctionId);
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    void deleteByAuctionId(Long auctionId);
}
