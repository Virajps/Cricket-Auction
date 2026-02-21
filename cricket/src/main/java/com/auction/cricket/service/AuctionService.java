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
import com.auction.cricket.repository.BidRepository;
import com.auction.cricket.repository.BidRuleRepository;
import com.auction.cricket.repository.CategoryRepository;
import com.auction.cricket.repository.PlayerRepository;
import com.auction.cricket.repository.SponsorRepository;
import com.auction.cricket.repository.TeamRepository;
import jakarta.persistence.EntityManager;
import com.auction.cricket.repository.UserRepository;

@Service
public class AuctionService {

    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;
    private final TeamService teamService;
    private final PlayerService playerService;

    private final CategoryService categoryService;

    private final CategoryRepository categoryRepository;
    private final PlayerRepository playerRepository;
    private final BidRepository bidRepository;
    private final BidRuleRepository bidRuleRepository;
    private final SponsorRepository sponsorRepository;
    private final TeamRepository teamRepository;
    private final EntityManager entityManager;

    public AuctionService(AuctionRepository auctionRepository, UserRepository userRepository, TeamService teamService,
            PlayerService playerService, CategoryService categoryService, CategoryRepository categoryRepository,
            PlayerRepository playerRepository, BidRepository bidRepository, BidRuleRepository bidRuleRepository,
            SponsorRepository sponsorRepository, TeamRepository teamRepository, EntityManager entityManager) {
        this.auctionRepository = auctionRepository;
        this.userRepository = userRepository;
        this.teamService = teamService;
        this.playerService = playerService;
        this.categoryService = categoryService;
        this.categoryRepository = categoryRepository;
        this.playerRepository = playerRepository;
        this.bidRepository = bidRepository;
        this.bidRuleRepository = bidRuleRepository;
        this.sponsorRepository = sponsorRepository;
        this.teamRepository = teamRepository;
        this.entityManager = entityManager;
    }

    @Transactional
    public AuctionResponse createAuction(AuctionRequest request, String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

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
        auction.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        auction.setPlayerRegistrationEnabled(
                request.getPlayerRegistrationEnabled() != null ? request.getPlayerRegistrationEnabled() : true);

        try {
            auction = auctionRepository.save(auction);

            return convertToResponse(auction);
        } catch (Exception e) {
            System.err.println("Error creating auction: " + e.getMessage());
            e.printStackTrace();
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
            throw new IllegalArgumentException("Cannot delete auction after its date has passed");
        }

        bidRepository.deleteByPlayerAuctionId(auction.getId());
        entityManager.flush();
        entityManager.clear();

        bidRepository.deleteByTeamAuctionId(auction.getId());
        entityManager.flush();
        entityManager.clear();

        playerRepository.deleteByAuctionId(auction.getId());
        entityManager.flush();
        entityManager.clear();

        teamRepository.deleteByAuctionId(auction.getId());
        entityManager.flush();
        entityManager.clear();

        bidRuleRepository.deleteByAuctionId(auction.getId());
        categoryRepository.deleteByAuctionId(auction.getId());
        sponsorRepository.deleteByAuctionId(auction.getId());
        entityManager.flush();
        entityManager.clear();

        auctionRepository.deleteByIdDirect(auction.getId());
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
        response.setBidRules(
                auction.getBidRules().stream().map(rule -> {
                    com.auction.cricket.dto.BidRuleResponse br = new com.auction.cricket.dto.BidRuleResponse();
                    br.setId(rule.getId());
                    br.setThresholdAmount(rule.getThresholdAmount());
                    br.setIncrementAmount(rule.getIncrementAmount());
                    return br;
                }).collect(Collectors.toList()));
        // Add teams and players
        response.setTeams(teamService.getTeamsByAuction(auction.getId()));
        response.setPlayers(playerService.getAllPlayers(auction.getId()));
        response.setCategories(categoryService.getAllCategoriesByAuction(auction.getId()));
        return response;
    }
}
