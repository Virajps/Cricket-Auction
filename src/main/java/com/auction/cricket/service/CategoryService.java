package com.auction.cricket.service;

import com.auction.cricket.dto.CategoryRequest;
import com.auction.cricket.dto.CategoryResponse;
import com.auction.cricket.entity.Auction;
import com.auction.cricket.entity.Category;
import com.auction.cricket.exception.ResourceNotFoundException;
import com.auction.cricket.repository.AuctionRepository;
import com.auction.cricket.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final AuctionRepository auctionRepository;

    public CategoryService(CategoryRepository categoryRepository, AuctionRepository auctionRepository) {
        this.categoryRepository = categoryRepository;
        this.auctionRepository = auctionRepository;
    }

    @Transactional
    public CategoryResponse createCategory(Long auctionId, CategoryRequest request) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setAuction(auction);

        category = categoryRepository.save(category);
        return convertToResponse(category);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategoriesByAuction(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));
        return categoryRepository.findByAuction(auction).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long auctionId, Long categoryId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        if (!category.getAuction().getId().equals(auctionId)) {
            throw new ResourceNotFoundException("Category not found in auction with id: " + auctionId);
        }

        return convertToResponse(category);
    }

    @Transactional
    public CategoryResponse updateCategory(Long auctionId, Long categoryId, CategoryRequest request) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        if (!category.getAuction().getId().equals(auctionId)) {
            throw new ResourceNotFoundException("Category not found in auction with id: " + auctionId);
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        category = categoryRepository.save(category);
        return convertToResponse(category);
    }

    @Transactional
    public void deleteCategory(Long auctionId, Long categoryId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        if (!category.getAuction().getId().equals(auctionId)) {
            throw new ResourceNotFoundException("Category not found in auction with id: " + auctionId);
        }

        categoryRepository.delete(category);
    }

    private CategoryResponse convertToResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setDescription(category.getDescription());
        return response;
    }
}