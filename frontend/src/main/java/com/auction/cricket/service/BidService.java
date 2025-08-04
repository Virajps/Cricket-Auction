package com.auction.cricket.service;

import com.auction.cricket.dto.BidRequest;
import com.auction.cricket.dto.BidResponse;
import com.auction.cricket.entity.Bid;
import com.auction.cricket.entity.Player;
import com.auction.cricket.entity.Team;
import com.auction.cricket.repository.BidRepository;
import com.auction.cricket.repository.PlayerRepository;
import com.auction.cricket.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BidService {

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private WebSocketService webSocketService;

    @Transactional
    public BidResponse placeBid(BidRequest request, Long teamId) {
        Player player = playerRepository.findById(request.getPlayerId())
                .orElseThrow(() -> new RuntimeException("Player not found"));

        if (player.getStatus() == com.auction.cricket.entity.PlayerStatus.SOLD) {
            throw new RuntimeException("Player is already sold");
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        if (request.getAmount() <= player.getCurrentPrice()) {
            throw new RuntimeException("Bid amount must be higher than current price");
        }

        if (request.getAmount() > team.getRemainingBudget()) {
            throw new RuntimeException("Bid amount exceeds team's remaining budget");
        }

        // Update previous winning bid if exists
        Bid previousWinningBid = bidRepository.findTopByPlayerIdOrderByAmountDesc(player.getId());
        if (previousWinningBid != null) {
            previousWinningBid.setIsWinningBid(false);
            bidRepository.save(previousWinningBid);
        }

        Bid bid = new Bid();
        bid.setPlayer(player);
        bid.setTeam(team);
        bid.setAmount(request.getAmount());
        bid.setTimestamp(LocalDateTime.now());
        bid.setIsWinningBid(true);

        player.setCurrentPrice(request.getAmount());
        player.setTeam(team);
        player.setStatus(com.auction.cricket.entity.PlayerStatus.SOLD);
        playerRepository.save(player);

        // Update team budget and points
        team.setRemainingBudget(team.getRemainingBudget() - request.getAmount());
        team.setPointsUsed(team.getPointsUsed() + request.getAmount().intValue());
        team.setPlayersCount(team.getPlayersCount() + 1);
        teamRepository.save(team);

        bid = bidRepository.save(bid);
        BidResponse response = convertToResponse(bid);
        
        // Send WebSocket notifications
        webSocketService.broadcastBid(response);
        webSocketService.broadcastPlayerUpdate(player.getId());

        return response;
    }

    public List<BidResponse> getBidsByPlayer(Long playerId) {
        return bidRepository.findByPlayerIdOrderByAmountDesc(playerId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<BidResponse> getBidsByTeam(Long teamId) {
        return bidRepository.findByTeamId(teamId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private BidResponse convertToResponse(Bid bid) {
        BidResponse response = new BidResponse();
        response.setId(bid.getId());
        response.setPlayerId(bid.getPlayer().getId());
        response.setPlayerName(bid.getPlayer().getName());
        response.setTeamId(bid.getTeam().getId());
        response.setTeamName(bid.getTeam().getName());
        response.setAmount(bid.getAmount());
        response.setTimestamp(bid.getTimestamp());
        response.setIsWinningBid(bid.getIsWinningBid());
        return response;
    }
} 