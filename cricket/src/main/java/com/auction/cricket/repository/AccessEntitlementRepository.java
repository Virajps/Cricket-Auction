package com.auction.cricket.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.auction.cricket.entity.AccessEntitlement;

public interface AccessEntitlementRepository extends JpaRepository<AccessEntitlement, Long> {
    List<AccessEntitlement> findByUserUsernameOrderByStartsAtDesc(String username);

    List<AccessEntitlement> findByUserUsernameAndExpiresAtGreaterThanEqualOrderByStartsAtDesc(
            String username, LocalDateTime now);

    List<AccessEntitlement> findByUserUsernameAndAuctionIdAndExpiresAtGreaterThanEqualOrderByStartsAtDesc(
            String username, Long auctionId, LocalDateTime now);
}
