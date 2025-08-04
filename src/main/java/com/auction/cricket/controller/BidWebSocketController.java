package com.auction.cricket.controller;

import com.auction.cricket.dto.BidRequest;
import com.auction.cricket.dto.BidResponse;
import com.auction.cricket.service.BidService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Controller
public class BidWebSocketController {

    @Autowired
    private BidService bidService;

    @MessageMapping("/bids")
    @SendTo("/topic/bids")
    public BidResponse handleBid(@Payload BidRequest bidRequest) {
        Long teamId = bidRequest.getTeamId(); // Ensure BidRequest has getTeamId()
        return bidService.placeBid(bidRequest, teamId);
    }
} 