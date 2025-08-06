package com.auction.cricket.repository;

import com.auction.cricket.entity.Auction;
import com.auction.cricket.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByAuction(Auction auction);
}