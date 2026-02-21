package com.auction.cricket.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.auction.cricket.dto.PlayerRequest;
import com.auction.cricket.dto.PlayerResponse;
import com.auction.cricket.entity.Auction;
import com.auction.cricket.entity.Player;
import com.auction.cricket.entity.PlayerStatus;
import com.auction.cricket.entity.Team;
import com.auction.cricket.exception.ResourceNotFoundException;
import com.auction.cricket.repository.AuctionRepository;
import com.auction.cricket.repository.PlayerRepository;
import com.auction.cricket.repository.TeamRepository;

@Service
public class PlayerService {

    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;
    private final AuctionRepository auctionRepository;

    public PlayerService(PlayerRepository playerRepository, TeamRepository teamRepository,
            AuctionRepository auctionRepository) {
        this.playerRepository = playerRepository;
        this.teamRepository = teamRepository;
        this.auctionRepository = auctionRepository;
    }

    @Transactional
    public PlayerResponse createPlayer(Long auctionId, PlayerRequest request) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        Player player = new Player();
        player.setName(request.getName());
        player.setAge(request.getAge());
        player.setRole(request.getRole());
        player.setCurrentPrice(auction.getBasePrice());
        player.setPhotoUrl(request.getPhotoUrl());
        player.setMobileNumber(request.getMobileNumber());
        player.setAuction(auction);
        if (request.getStatus() != null) {
            player.setStatus(PlayerStatus.valueOf(request.getStatus()));
        } else {
            player.setStatus(PlayerStatus.AVAILABLE);
        }

        player = playerRepository.save(player);
        return convertToResponse(player);
    }

    @Transactional(readOnly = true)
    public List<PlayerResponse> getAllPlayers(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));
        return playerRepository.findByAuction(auction).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PlayerResponse> getAvailablePlayers(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));
        return playerRepository.findByAuctionAndStatus(auction, PlayerStatus.AVAILABLE).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PlayerResponse> getPlayersByTeam(Long auctionId, Long teamId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + teamId));
        return playerRepository.findByAuctionAndTeam(auction, team).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PlayerResponse getPlayerById(Long auctionId, Long playerId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with id: " + playerId));

        if (!player.getAuction().getId().equals(auctionId)) {
            throw new ResourceNotFoundException("Player not found in auction with id: " + auctionId);
        }

        return convertToResponse(player);
    }

    @Transactional
    public PlayerResponse updatePlayer(Long auctionId, Long playerId, PlayerRequest request) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with id: " + playerId));

        if (!player.getAuction().getId().equals(auctionId)) {
            throw new ResourceNotFoundException("Player not found in auction with id: " + auctionId);
        }

        player.setName(request.getName());
        player.setAge(request.getAge());
        player.setRole(request.getRole());
        player.setPhotoUrl(request.getPhotoUrl());
        player.setMobileNumber(request.getMobileNumber());
        if (request.getStatus() != null) {
            player.setStatus(PlayerStatus.valueOf(request.getStatus()));
        }

        player = playerRepository.save(player);
        return convertToResponse(player);
    }

    @Transactional
    public PlayerResponse updatePlayerStatus(Long auctionId, Long playerId, String status, Long teamId,
            Double finalBidAmount) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with id: " + playerId));
        if (!player.getAuction().getId().equals(auctionId)) {
            throw new ResourceNotFoundException("Player not found in auction with id: " + auctionId);
        }
        if (PlayerStatus.valueOf(status) == PlayerStatus.SOLD) {
            if (teamId != null && finalBidAmount != null) {
                Team team = teamRepository.findById(teamId)
                        .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + teamId));
                player.setTeam(team);
                player.setCurrentPrice(finalBidAmount);
                player.setStatus(PlayerStatus.SOLD);
                Double newRemainingBudget = team.getRemainingBudget() - finalBidAmount;
                if (newRemainingBudget < 0) {
                    throw new IllegalArgumentException("Insufficient budget for team: " + team.getName());
                }
                team.setRemainingBudget(newRemainingBudget);
                teamRepository.save(team);
            } else {
                throw new IllegalArgumentException("Team ID and final bid amount are required for SOLD status.");
            }
        } else if (PlayerStatus.valueOf(status) == PlayerStatus.UNSOLD) {
            player.setTeam(null);
            player.setStatus(PlayerStatus.UNSOLD);

        }
        player = playerRepository.save(player);
        return convertToResponse(player);
    }

    @Transactional
    public PlayerResponse assignIconPlayer(Long auctionId, Long teamId, Long playerId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + teamId));
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with id: " + playerId));

        if (!player.getAuction().getId().equals(auctionId)) {
            throw new ResourceNotFoundException("Player not found in auction with id: " + auctionId);
        }
        if (player.getTeam() != null) {
            throw new IllegalArgumentException("Player is already assigned to a team.");
        }

        player.setTeam(team);
        player.setIsIcon(true);
        player.setStatus(PlayerStatus.SOLD);
        player.setCurrentPrice(0.0);

        player = playerRepository.save(player);
        return convertToResponse(player);
    }

    @Transactional
    public PlayerResponse removeIconPlayer(Long auctionId, Long teamId, Long playerId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + teamId));
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with id: " + playerId));

        if (!player.getAuction().getId().equals(auctionId)) {
            throw new ResourceNotFoundException("Player not found in auction with id: " + auctionId);
        }
        if (player.getTeam() == null || !player.getTeam().getId().equals(teamId)) {
            throw new ResourceNotFoundException("Player not found in team with id: " + teamId);
        }
        if (player.getIsIcon() == null || !player.getIsIcon()) {
            throw new IllegalArgumentException("Player is not an icon player.");
        }

        player.setIsIcon(false);
        player.setTeam(null);
        player.setStatus(PlayerStatus.AVAILABLE);
        player.setCurrentPrice(auction.getBasePrice());

        player = playerRepository.save(player);
        return convertToResponse(player);
    }

    @Transactional
    public PlayerResponse removePlayerFromTeam(Long auctionId, Long teamId, Long playerId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + teamId));
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with id: " + playerId));

        if (!player.getAuction().getId().equals(auctionId)) {
            throw new ResourceNotFoundException("Player not found in auction with id: " + auctionId);
        }
        if (player.getTeam() == null || !player.getTeam().getId().equals(teamId)) {
            throw new ResourceNotFoundException("Player not found in team with id: " + teamId);
        }

        if (player.getStatus() == PlayerStatus.SOLD) {
            double refund = player.getCurrentPrice() != null ? player.getCurrentPrice() : 0.0;
            double remaining = team.getRemainingBudget() != null ? team.getRemainingBudget() : 0.0;
            double budget = team.getBudgetAmount() != null ? team.getBudgetAmount() : remaining;
            double nextRemaining = remaining + refund;
            if (nextRemaining > budget) {
                nextRemaining = budget;
            }
            team.setRemainingBudget(nextRemaining);
            teamRepository.save(team);
        }

        player.setIsIcon(false);
        player.setTeam(null);
        player.setStatus(PlayerStatus.AVAILABLE);
        player.setCurrentPrice(auction.getBasePrice());

        player = playerRepository.save(player);
        return convertToResponse(player);
    }

    @Transactional
    public PlayerResponse addPlayerToTeam(Long auctionId, Long teamId, Long playerId, Double finalBidAmount) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + teamId));
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with id: " + playerId));

        if (!team.getAuction().getId().equals(auctionId)) {
            throw new ResourceNotFoundException("Team not found in auction with id: " + auctionId);
        }
        if (!player.getAuction().getId().equals(auctionId)) {
            throw new ResourceNotFoundException("Player not found in auction with id: " + auctionId);
        }
        if (player.getTeam() != null) {
            throw new IllegalArgumentException("Player is already assigned to a team.");
        }
        if (player.getStatus() == PlayerStatus.SOLD) {
            throw new IllegalArgumentException("Player is already sold.");
        }

        double soldAmount = finalBidAmount != null ? finalBidAmount : auction.getBasePrice();
        if (soldAmount < 0) {
            throw new IllegalArgumentException("Final sold price cannot be negative.");
        }

        Double remainingBudget = team.getRemainingBudget() == null ? 0.0 : team.getRemainingBudget();
        Double newRemainingBudget = remainingBudget - soldAmount;
        if (newRemainingBudget < 0) {
            throw new IllegalArgumentException("Insufficient budget for team: " + team.getName());
        }

        player.setTeam(team);
        player.setIsIcon(false);
        player.setStatus(PlayerStatus.SOLD);
        player.setCurrentPrice(soldAmount);
        team.setRemainingBudget(newRemainingBudget);

        teamRepository.save(team);
        player = playerRepository.save(player);
        return convertToResponse(player);
    }

    @Transactional
    public PlayerResponse setUnsoldPlayerAvailable(Long auctionId, Long playerId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with id: " + playerId));

        if (!player.getAuction().getId().equals(auctionId)) {
            throw new ResourceNotFoundException("Player not found in auction with id: " + auctionId);
        }
        if (player.getStatus() != PlayerStatus.UNSOLD) {
            throw new IllegalArgumentException("Only UNSOLD players can be set to AVAILABLE.");
        }

        player.setStatus(PlayerStatus.AVAILABLE);
        player.setCurrentPrice(auction.getBasePrice());
        player.setTeam(null);
        player.setIsIcon(false);

        player = playerRepository.save(player);
        return convertToResponse(player);
    }

    @Transactional
    public void deletePlayer(Long auctionId, Long playerId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with id: " + playerId));

        if (!player.getAuction().getId().equals(auctionId)) {
            throw new ResourceNotFoundException("Player not found in auction with id: " + auctionId);
        }

        playerRepository.delete(player);
    }

    @Transactional
    public void setUnsoldPlayersAvailable(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        List<Player> unsoldPlayers = playerRepository.findByAuctionAndStatus(auction, PlayerStatus.UNSOLD);
        for (Player player : unsoldPlayers) {
            player.setStatus(PlayerStatus.AVAILABLE);
            playerRepository.save(player);
        }

        // Also reset players who were SOLD but are now being made available (e.g., if a
        // team was deleted)
        List<Player> soldPlayers = playerRepository.findByAuctionAndStatus(auction, PlayerStatus.SOLD);
        for (Player player : soldPlayers) {
            if (player.getTeam() == null) { // Only reset if team is null (e.g., team was deleted)
                player.setStatus(PlayerStatus.AVAILABLE);
                player.setCurrentPrice(auction.getBasePrice());
                playerRepository.save(player);
            }
        }
    }

    private PlayerResponse convertToResponse(Player player) {
        PlayerResponse response = new PlayerResponse();
        response.setId(player.getId());
        response.setName(player.getName());
        response.setAge(player.getAge());
        response.setRole(player.getRole());
        response.setMobileNumber(player.getMobileNumber());
        if (player.getTeam() != null) {
            response.setTeamName(player.getTeam().getName());
        }
        response.setStatus(player.getStatus().name());
        response.setSold(player.getStatus() == PlayerStatus.SOLD);
        response.setUnsold(player.getStatus() == PlayerStatus.UNSOLD);
        response.setCurrentPrice(player.getCurrentPrice());
        response.setPhotoUrl(player.getPhotoUrl());
        response.setIsIcon(player.getIsIcon());
        return response;
    }
}
