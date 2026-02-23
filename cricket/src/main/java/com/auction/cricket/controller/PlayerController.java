package com.auction.cricket.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.auction.cricket.dto.PlayerRequest;
import com.auction.cricket.dto.PlayerResponse;
import com.auction.cricket.dto.UpdatePlayerStatusRequest;
import com.auction.cricket.service.PlayerService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auctions/{auctionId}/players")
public class PlayerController {

    private final PlayerService playerService;

    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @PostMapping
    public ResponseEntity<PlayerResponse> createPlayer(
            @PathVariable Long auctionId,
            @Valid @RequestBody PlayerRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(playerService.createPlayer(auctionId, request, authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<PlayerResponse>> getAllPlayers(@PathVariable Long auctionId) {
        return ResponseEntity.ok(playerService.getAllPlayers(auctionId));
    }

    @GetMapping("/available")
    public ResponseEntity<List<PlayerResponse>> getAvailablePlayers(@PathVariable Long auctionId) {
        return ResponseEntity.ok(playerService.getAvailablePlayers(auctionId));
    }

    @GetMapping("/{playerId}")
    public ResponseEntity<PlayerResponse> getPlayerById(
            @PathVariable Long auctionId,
            @PathVariable Long playerId) {
        return ResponseEntity.ok(playerService.getPlayerById(auctionId, playerId));
    }

    @PutMapping("/{playerId}")
    public ResponseEntity<PlayerResponse> updatePlayer(
            @PathVariable Long auctionId,
            @PathVariable Long playerId,
            @Valid @RequestBody PlayerRequest request) {
        return ResponseEntity.ok(playerService.updatePlayer(auctionId, playerId, request));
    }

    @DeleteMapping("/{playerId}")
    public ResponseEntity<Void> deletePlayer(
            @PathVariable Long auctionId,
            @PathVariable Long playerId) {
        playerService.deletePlayer(auctionId, playerId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{playerId}/status")
    public ResponseEntity<PlayerResponse> updatePlayerStatus(
            @PathVariable Long auctionId,
            @PathVariable Long playerId,
            @RequestBody UpdatePlayerStatusRequest request) {
        return ResponseEntity
                .ok(playerService.updatePlayerStatus(auctionId, playerId, request.getStatus(), request.getTeamId(),
                        request.getFinalBidAmount()));
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<PlayerResponse>> getPlayersByTeam(
            @PathVariable Long auctionId,
            @PathVariable Long teamId) {
        return ResponseEntity.ok(playerService.getPlayersByTeam(auctionId, teamId));
    }

    @PatchMapping("/set-unsold-available")
    public ResponseEntity<Void> setUnsoldPlayersAvailable(@PathVariable Long auctionId) {
        playerService.setUnsoldPlayersAvailable(auctionId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{playerId}/set-available")
    public ResponseEntity<PlayerResponse> setUnsoldPlayerAvailable(
            @PathVariable Long auctionId,
            @PathVariable Long playerId) {
        return ResponseEntity.ok(playerService.setUnsoldPlayerAvailable(auctionId, playerId));
    }
}
