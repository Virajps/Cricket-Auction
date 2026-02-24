package com.auction.cricket.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.auction.cricket.entity.AccessEntitlement;

@Repository
public interface AccessEntitlementRepository extends JpaRepository<AccessEntitlement, Long> {
    @Query("select e from AccessEntitlement e join fetch e.user u left join fetch e.auction a order by e.id desc")
    List<AccessEntitlement> findAllWithRelations();

    @Query("select e from AccessEntitlement e join fetch e.user u left join fetch e.auction a where lower(u.username) = lower(:username) order by e.id desc")
    List<AccessEntitlement> findAllWithRelationsByUsername(@Param("username") String username);

    @Query("select e from AccessEntitlement e join fetch e.auction a where e.user.id = :userId order by e.id desc")
    List<AccessEntitlement> findByUserIdWithAuction(@Param("userId") Long userId);
}
