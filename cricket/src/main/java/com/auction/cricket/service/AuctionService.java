package com.auction.cricket.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.auction.cricket.dto.AuctionRequest;
import com.auction.cricket.dto.AuctionResponse;
import com.auction.cricket.entity.Auction;
import com.auction.cricket.entity.User;
import com.auction.cricket.exception.ResourceNotFoundException;
import com.auction.cricket.repository.AuctionRepository;
import com.auction.cricket.repository.CategoryRepository;
import com.auction.cricket.repository.UserRepository;

@Service
public class AuctionService {

    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;
    private final TeamService teamService;
    private final PlayerService playerService;

    private final CategoryService categoryService;

    private final CategoryRepository categoryRepository;

    public AuctionService(AuctionRepository auctionRepository, UserRepository userRepository, TeamService teamService,
            PlayerService playerService, CategoryService categoryService, CategoryRepository categoryRepository) {
        this.auctionRepository = auctionRepository;
        this.userRepository = userRepository;
        this.teamService = teamService;
        this.playerService = playerService;
        this.categoryService = categoryService;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public AuctionResponse createAuction(AuctionRequest request, String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getAuctionDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Auction date must be in the future");
        }

        Auction auction = new Auction();
        auction.setName(request.getName());
        auction.setLogoUrl(request.getLogoUrl());
        auction.setAuctionDate(request.getAuctionDate());
        auction.setPointsPerTeam(request.getPointsPerTeam());
        auction.setTotalTeams(request.getTotalTeams());
        auction.setMinimumBid(request.getMinimumBid());
        auction.setBidIncreaseBy(request.getBidIncreaseBy());
        auction.setBasePrice(request.getBasePrice());
        auction.setPlayersPerTeam(request.getPlayersPerTeam());
        auction.setCreatedBy(user);
        auction.setIsActive(true);
        auction.setPlayerRegistrationEnabled(true);

        try {
            auction = auctionRepository.save(auction);

            return convertToResponse(auction);
        } catch (Exception e) {

            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<AuctionResponse> getAuctionsByUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return auctionRepository.findByCreatedBy(user).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuctionResponse> getUpcomingAuctions() {
        return auctionRepository.findUpcomingAuctions(LocalDateTime.now()).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuctionResponse> getRecentAuctions() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime twoDaysAgo = now.minusDays(2);
        return auctionRepository.findRecentAuctions(now, twoDaysAgo).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuctionResponse> getPastAuctions() {
        return auctionRepository.findPastAuctions(LocalDateTime.now()).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    

    @Transactional(readOnly = true)
    public AuctionResponse getAuctionById(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + id));
        if (!auction.getCreatedBy().equals(user)) {
            throw new ResourceNotFoundException("Auction not found with id: " + id);
        }
        return convertToResponse(auction);
    }

    @Transactional
    public AuctionResponse updateAuction(Long id, AuctionRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        if (!auction.getCreatedBy().equals(user)) {
            throw new ResourceNotFoundException("Auction not found with id: " + id);
        }

        if (auction.getAuctionDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Cannot update auction after its date has passed");
        }

        auction.setName(request.getName());
        auction.setLogoUrl(request.getLogoUrl());
        auction.setAuctionDate(request.getAuctionDate());
        auction.setPointsPerTeam(request.getPointsPerTeam());
        auction.setTotalTeams(request.getTotalTeams());
        auction.setMinimumBid(request.getMinimumBid());
        auction.setBidIncreaseBy(request.getBidIncreaseBy());
        auction.setBasePrice(request.getBasePrice());
        auction.setPlayersPerTeam(request.getPlayersPerTeam());

        auction = auctionRepository.save(auction);
        return convertToResponse(auction);
    }

    @Transactional
    public void deleteAuction(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        if (!auction.getCreatedBy().equals(user)) {
            throw new ResourceNotFoundException("Auction not found with id: " + id);
        }

        if (auction.getAuctionDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot delete auction after its date has passed");
        }

        auctionRepository.delete(auction);
    }

    @Transactional
    public AuctionResponse togglePlayerRegistration(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        if (!auction.getCreatedBy().equals(user)) {
            throw new ResourceNotFoundException("Auction not found with id: " + id);
        }

        auction.setPlayerRegistrationEnabled(!auction.getPlayerRegistrationEnabled());
        auction = auctionRepository.save(auction);
        return convertToResponse(auction);
    }

    @Transactional
    public AuctionResponse toggleAuctionStatus(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        if (!auction.getCreatedBy().equals(user)) {
            throw new ResourceNotFoundException("Auction not found with id: " + id);
        }

        auction.setIsActive(!auction.getIsActive());
        auction = auctionRepository.save(auction);
        return convertToResponse(auction);
    }

    private AuctionResponse convertToResponse(Auction auction) {
        AuctionResponse response = new AuctionResponse();
        response.setId(auction.getId());
        response.setName(auction.getName());
        response.setLogoUrl(auction.getLogoUrl());
        response.setAuctionDate(auction.getAuctionDate());
        response.setPointsPerTeam(auction.getPointsPerTeam());
        response.setTotalTeams(auction.getTotalTeams());
        response.setMinimumBid(auction.getMinimumBid());
        response.setBidIncreaseBy(auction.getBidIncreaseBy());
        response.setBasePrice(auction.getBasePrice());
        response.setPlayersPerTeam(auction.getPlayersPerTeam());
        response.setIsActive(auction.getIsActive());
        response.setPlayerRegistrationEnabled(auction.getPlayerRegistrationEnabled());
        response.setOverlayUrl(auction.getOverlayUrl());
        response.setSummaryUrl(auction.getSummaryUrl());
        response.setCreatedBy(auction.getCreatedBy().getUsername());
        // Add teams and players
        response.setTeams(teamService.getTeamsByAuction(auction.getId()));
        response.setPlayers(playerService.getAllPlayers(auction.getId()));
        response.setCategories(categoryService.getAllCategoriesByAuction(auction.getId()));
        return response;
    }
}