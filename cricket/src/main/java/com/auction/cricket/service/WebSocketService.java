package com.auction.cricket.service;

import com.auction.cricket.dto.BidResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void broadcastBid(BidResponse bid) {
        messagingTemplate.convertAndSend("/topic/bids", bid);
    }

    public void broadcastPlayerUpdate(Long playerId) {
        messagingTemplate.convertAndSend("/topic/players/" + playerId, "update");
    }
} 