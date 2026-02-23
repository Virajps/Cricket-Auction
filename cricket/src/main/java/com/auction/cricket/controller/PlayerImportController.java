package com.auction.cricket.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.auction.cricket.dto.ImportResult;
import com.auction.cricket.exception.InvalidFileException;
import com.auction.cricket.service.AccessEntitlementService;
import com.auction.cricket.service.PlayerImportService;

@RestController
@RequestMapping("/api/auctions/{auctionId}/players")
public class PlayerImportController {

    private final PlayerImportService playerImportService;
    private final AccessEntitlementService accessEntitlementService;

    public PlayerImportController(PlayerImportService playerImportService,
            AccessEntitlementService accessEntitlementService) {
        this.playerImportService = playerImportService;
        this.accessEntitlementService = accessEntitlementService;
    }

    /**
     * Uploads an .xlsx file to import players for an auction.
     */
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImportResult> importPlayers(@PathVariable Long auctionId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        if (file == null) {
            throw new InvalidFileException("No file uploaded");
        }
        accessEntitlementService.requirePremiumAccess(authentication.getName(), auctionId, "Player import");
        ImportResult result = playerImportService.importPlayers(auctionId, file);
        return ResponseEntity.ok(result);
    }
}
