package com.auction.cricket.service;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.auction.cricket.dto.TeamRequest;
import com.auction.cricket.dto.TeamResponse;
import com.auction.cricket.entity.Auction;
import com.auction.cricket.entity.Team;
import com.auction.cricket.exception.ResourceNotFoundException;
import com.auction.cricket.repository.AuctionRepository;
import com.auction.cricket.repository.TeamRepository;
import com.auction.cricket.repository.UserRepository;

@Service
public class TeamService {
    private static final Logger logger = LoggerFactory.getLogger(TeamService.class);

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final AuctionRepository auctionRepository;

    public TeamService(TeamRepository teamRepository, UserRepository userRepository,
            AuctionRepository auctionRepository) {
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
        this.auctionRepository = auctionRepository;
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> getAllTeams() {
        logger.debug("Fetching all teams");
        return teamRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TeamResponse getTeamById(Long id) {
        logger.debug("Fetching team by id: {}", id);
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + id));
        return mapToResponse(team);
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> getTeamsByAuction(Long auctionId) {
        logger.debug("Fetching teams for auction: {}", auctionId);
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));
        return teamRepository.findByAuction(auction).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TeamResponse createTeam(Long auctionId, TeamRequest request) {
        logger.debug("Creating team for auction: {}, request: {}", auctionId, request);
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        // Check if auction has reached its team limit
        long currentTeamCount = teamRepository.countByAuction(auction);
        if (currentTeamCount >= auction.getTotalTeams()) {
            throw new RuntimeException("Auction has reached its maximum team limit of " + auction.getTotalTeams());
        }

        // Check if team name already exists in this auction
        if (teamRepository.findByAuction(auction).stream()
                .anyMatch(team -> team.getName().equals(request.getName()))) {
            throw new RuntimeException("Team name already exists in this auction");
        }

        Team team = new Team();
        team.setName(request.getName());
        team.setAuction(auction);
        team.setBudgetAmount(auction.getPointsPerTeam().doubleValue());
        team.setRemainingBudget(auction.getPointsPerTeam().doubleValue());

        team.setIsActive(true);
        team.setLogoUrl(request.getLogoUrl());

        team = teamRepository.save(team);
        return mapToResponse(team);
    }

    @Transactional
    public TeamResponse updateTeam(Long auctionId, Long id, TeamRequest request) {
        logger.debug("Updating team with id: {} and request: {}", id, request);
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + id));

        if (!team.getAuction().getId().equals(auctionId)) {
            throw new ResourceNotFoundException("Team not found in auction with id: " + auctionId);
        }

        // Check if new name already exists in the same auction
        if (!team.getName().equals(request.getName()) &&
                teamRepository.findByAuction(team.getAuction()).stream()
                        .anyMatch(t -> t.getName().equals(request.getName()))) {
            throw new RuntimeException("Team name already exists in this auction");
        }

        team.setName(request.getName());
        team.setLogoUrl(request.getLogoUrl());
        team = teamRepository.save(team);
        return mapToResponse(team);
    }

    @Transactional
    public void deleteTeam(Long id) {
        logger.debug("Deleting team with id: {}", id);
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + id));

        // Disassociate players from the team
        team.getPlayers().forEach(player -> player.setTeam(null));
        // Disassociate bids from the team
        team.getBids().forEach(bid -> bid.setTeam(null));

        teamRepository.delete(team);
    }

    @Transactional
    public TeamResponse updateBudget(Long id, Double budget) {
        logger.debug("Updating budget for team id: {} to: {}", id, budget);
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + id));

        if (budget < 0) {
            throw new RuntimeException("Budget cannot be negative");
        }
        
        team.setBudgetAmount(budget);
        team.setRemainingBudget(budget - team.getPointsUsed());
        team = teamRepository.save(team);
        return mapToResponse(team);
    }

    @Transactional
    public TeamResponse toggleStatus(Long id) {
        logger.debug("Toggling status for team with id: {}", id);
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + id));

        team.setIsActive(!team.getIsActive());
        team = teamRepository.save(team);
        return mapToResponse(team);
    }

    private TeamResponse mapToResponse(Team team) {
        TeamResponse response = new TeamResponse();
        response.setId(team.getId());
        response.setName(team.getName());
        response.setBudgetAmount(team.getBudgetAmount());
        response.setRemainingBudget(team.getRemainingBudget());
        response.setPointsUsed(team.getPointsUsed());
        response.setPlayersCount(team.getPlayersCount());
        response.setAuctionName(team.getAuction().getName());
        response.setIsActive(team.getIsActive());
        response.setLogoUrl(team.getLogoUrl());
        return response;
    }
}