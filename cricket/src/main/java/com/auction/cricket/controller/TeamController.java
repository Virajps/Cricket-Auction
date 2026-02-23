package com.auction.cricket.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.auction.cricket.dto.DirectTeamPlayerRequest;
import com.auction.cricket.dto.TeamRequest;
import com.auction.cricket.dto.TeamResponse;
import com.auction.cricket.dto.PlayerResponse;
import com.auction.cricket.service.PlayerService;
import com.auction.cricket.service.TeamService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auctions/{auctionId}/teams")
public class TeamController {
    private static final Logger logger = LoggerFactory.getLogger(TeamController.class);

    private final TeamService teamService;
    private final PlayerService playerService;

    public TeamController(TeamService teamService, PlayerService playerService) {
        this.teamService = teamService;
        this.playerService = playerService;
    }

    @GetMapping
    public ResponseEntity<List<TeamResponse>> getTeamsForAuction(@PathVariable Long auctionId) {
        logger.debug("Received request to get teams for auction: {}", auctionId);
        return ResponseEntity.ok(teamService.getTeamsByAuction(auctionId));
    }

    @PostMapping
    public ResponseEntity<TeamResponse> createTeamForAuction(
            @PathVariable Long auctionId,
            @RequestBody TeamRequest request,
            Authentication authentication) {
        logger.debug("Received request to create team for auction: {}", auctionId);
        return ResponseEntity.ok(teamService.createTeam(auctionId, request, authentication.getName()));
    }

    // The following endpoints operate on team id only
    @GetMapping("/{id}")
    public ResponseEntity<TeamResponse> getTeam(@PathVariable Long id) {
        logger.debug("Received request to get team by id: {}", id);
        return ResponseEntity.ok(teamService.getTeamById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TeamResponse> updateTeam(
            @PathVariable Long auctionId,
            @PathVariable Long id,
            @Valid @RequestBody TeamRequest request) {
        logger.debug("Received request to update team: {}", id);
        return ResponseEntity.ok(teamService.updateTeam(auctionId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeam(@PathVariable Long auctionId, @PathVariable Long id) {
        logger.debug("Received request to delete team: {} in auction: {}", id, auctionId);
        teamService.deleteTeam(auctionId, id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/budget")
    public ResponseEntity<TeamResponse> updateBudget(@PathVariable Long id, @RequestBody Double budget) {
        logger.debug("Received request to update budget for team id: {} to: {}", id, budget);
        return ResponseEntity.ok(teamService.updateBudget(id, budget));
    }

    @PostMapping("/{teamId}/icon-players/{playerId}")
    public ResponseEntity<PlayerResponse> addIconPlayer(
            @PathVariable Long auctionId,
            @PathVariable Long teamId,
            @PathVariable Long playerId) {
        logger.debug("Received request to add icon player {} to team {} for auction {}", playerId, teamId, auctionId);
        return ResponseEntity.ok(playerService.assignIconPlayer(auctionId, teamId, playerId));
    }

    @DeleteMapping("/{teamId}/icon-players/{playerId}")
    public ResponseEntity<PlayerResponse> removeIconPlayer(
            @PathVariable Long auctionId,
            @PathVariable Long teamId,
            @PathVariable Long playerId) {
        logger.debug("Received request to remove icon player {} from team {} for auction {}", playerId, teamId,
                auctionId);
        return ResponseEntity.ok(playerService.removeIconPlayer(auctionId, teamId, playerId));
    }

    @DeleteMapping("/{teamId}/players/{playerId}")
    public ResponseEntity<PlayerResponse> removePlayerFromTeam(
            @PathVariable Long auctionId,
            @PathVariable Long teamId,
            @PathVariable Long playerId) {
        logger.debug("Received request to remove player {} from team {} for auction {}", playerId, teamId, auctionId);
        return ResponseEntity.ok(playerService.removePlayerFromTeam(auctionId, teamId, playerId));
    }

    @PostMapping("/{teamId}/players/{playerId}")
    public ResponseEntity<PlayerResponse> addPlayerToTeam(
            @PathVariable Long auctionId,
            @PathVariable Long teamId,
            @PathVariable Long playerId,
            @RequestBody(required = false) DirectTeamPlayerRequest request) {
        Double finalBidAmount = request != null ? request.getFinalBidAmount() : null;
        logger.debug("Received request to directly add player {} to team {} for auction {}", playerId, teamId, auctionId);
        return ResponseEntity.ok(playerService.addPlayerToTeam(auctionId, teamId, playerId, finalBidAmount));
    }
}
