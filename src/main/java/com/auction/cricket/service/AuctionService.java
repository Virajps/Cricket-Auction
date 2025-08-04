package com.auction.cricket.service;

import com.auction.cricket.dto.AuctionRequest;
import com.auction.cricket.dto.AuctionResponse;
import com.auction.cricket.entity.Auction;
import com.auction.cricket.entity.User;
import com.auction.cricket.repository.AuctionRepository;
import com.auction.cricket.repository.UserRepository;
import com.auction.cricket.exception.ResourceNotFoundException;
import com.auction.cricket.dto.TeamResponse;
import com.auction.cricket.dto.PlayerResponse;
import com.auction.cricket.service.TeamService;
import com.auction.cricket.service.PlayerService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuctionService {

    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;
    private final TeamService teamService;
    private final PlayerService playerService;

    public AuctionService(AuctionRepository auctionRepository, UserRepository userRepository, TeamService teamService, PlayerService playerService) {
        this.auctionRepository = auctionRepository;
        this.userRepository = userRepository;
        this.teamService = teamService;
        this.playerService = playerService;
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
    public List<AuctionResponse> getAllAuctions() {
        return auctionRepository.findAll().stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AuctionResponse getAuctionById(Long id) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + id));
        return mapToResponse(auction);
    }

    @Transactional
    public AuctionResponse updateAuction(Long id, AuctionRequest request) {
        Auction auction = auctionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Auction not found"));

        if (auction.getAuctionDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot update auction after its date has passed");
        }

        auction.setName(request.getName());
        auction.setLogoUrl(request.getLogoUrl());
        auction.setAuctionDate(request.getAuctionDate());
        auction.setPointsPerTeam(request.getPointsPerTeam());
        auction.setTotalTeams(request.getTotalTeams());
        auction.setMinimumBid(request.getMinimumBid());
        auction.setBidIncreaseBy(request.getBidIncreaseBy());
        auction.setPlayersPerTeam(request.getPlayersPerTeam());

        auction = auctionRepository.save(auction);
        return convertToResponse(auction);
    }

    @Transactional
    public void deleteAuction(Long id) {
        Auction auction = auctionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Auction not found"));

        if (auction.getAuctionDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot delete auction after its date has passed");
        }

        auctionRepository.delete(auction);
    }

    @Transactional
    public AuctionResponse togglePlayerRegistration(Long id) {
        Auction auction = auctionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Auction not found"));

        auction.setPlayerRegistrationEnabled(!auction.getPlayerRegistrationEnabled());
        auction = auctionRepository.save(auction);
        return convertToResponse(auction);
    }

    @Transactional
    public AuctionResponse toggleAuctionStatus(Long id) {
        Auction auction = auctionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Auction not found"));

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
        response.setPlayersPerTeam(auction.getPlayersPerTeam());
        response.setIsActive(auction.getIsActive());
        response.setPlayerRegistrationEnabled(auction.getPlayerRegistrationEnabled());
        response.setOverlayUrl(auction.getOverlayUrl());
        response.setSummaryUrl(auction.getSummaryUrl());
        response.setCreatedBy(auction.getCreatedBy().getUsername());
        // Add teams and players
        response.setTeams(teamService.getTeamsByAuction(auction.getId()));
        response.setPlayers(playerService.getAllPlayers(auction.getId()));
        return response;
    }

    private AuctionResponse mapToResponse(Auction auction) {
        AuctionResponse response = new AuctionResponse();
        response.setId(auction.getId());
        response.setName(auction.getName());
        response.setLogoUrl(auction.getLogoUrl());
        response.setAuctionDate(auction.getAuctionDate());
        response.setPointsPerTeam(auction.getPointsPerTeam());
        response.setTotalTeams(auction.getTotalTeams());
        response.setMinimumBid(auction.getMinimumBid());
        response.setBidIncreaseBy(auction.getBidIncreaseBy());
        response.setPlayersPerTeam(auction.getPlayersPerTeam());
        response.setIsActive(auction.getIsActive());
        response.setPlayerRegistrationEnabled(auction.getPlayerRegistrationEnabled());
        response.setOverlayUrl(auction.getOverlayUrl());
        response.setSummaryUrl(auction.getSummaryUrl());
        response.setCreatedBy(auction.getCreatedBy().getUsername());
        // Add teams and players
        response.setTeams(teamService.getTeamsByAuction(auction.getId()));
        response.setPlayers(playerService.getAllPlayers(auction.getId()));
        return response;
    }
} 