package com.auction.cricket.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.auction.cricket.dto.TeamRequest;
import com.auction.cricket.dto.TeamResponse;
import com.auction.cricket.service.TeamService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auctions/{auctionId}/teams")
public class TeamController {
    private static final Logger logger = LoggerFactory.getLogger(TeamController.class);

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @GetMapping
    public ResponseEntity<List<TeamResponse>> getTeamsForAuction(@PathVariable Long auctionId) {
        logger.debug("Received request to get teams for auction: {}", auctionId);
        return ResponseEntity.ok(teamService.getTeamsByAuction(auctionId));
    }

    @PostMapping
    public ResponseEntity<TeamResponse> createTeamForAuction(
            @PathVariable Long auctionId,
            @RequestBody TeamRequest request) {
        logger.debug("Received request to create team for auction: {}", auctionId);
        return ResponseEntity.ok(teamService.createTeam(auctionId, request));
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
    public ResponseEntity<Void> deleteTeam(@PathVariable Long id) {
        logger.debug("Received request to delete team: {}", id);
        teamService.deleteTeam(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/budget")
    public ResponseEntity<TeamResponse> updateBudget(@PathVariable Long id, @RequestBody Double budget) {
        logger.debug("Received request to update budget for team id: {} to: {}", id, budget);
        return ResponseEntity.ok(teamService.updateBudget(id, budget));
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<TeamResponse> toggleStatus(@PathVariable Long id) {
        logger.debug("Received request to toggle status for team: {}", id);
        return ResponseEntity.ok(teamService.toggleStatus(id));
    }
}