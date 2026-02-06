package com.auction.cricket.service;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import com.auction.cricket.dto.ImportResult;
import com.auction.cricket.dto.RowError;
import com.auction.cricket.entity.Auction;
import com.auction.cricket.entity.Player;
import com.auction.cricket.exception.ImportProcessingException;
import com.auction.cricket.exception.InvalidFileException;
import com.auction.cricket.repository.AuctionRepository;
import com.auction.cricket.repository.PlayerRepository;
import com.auction.cricket.util.ExcelHelper;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

/**
 * Service to import players from an Excel (.xlsx) file.
 * - headers are mapped with a headerMapping (normalized)
 * - rows with validation errors are collected and skipped
 * - batch insert is used for performance
 */
@Service
public class PlayerImportService {

    private final PlayerRepository playerRepository;
    private final AuctionRepository auctionRepository;
    private final ImageService imageService;

    @PersistenceContext
    private EntityManager entityManager;

    @Value("${app.import.download-images:false}")
    private boolean downloadImages;

    private static final int BATCH_SIZE = 100;

    public PlayerImportService(PlayerRepository playerRepository, AuctionRepository auctionRepository,
            ImageService imageService) {
        this.playerRepository = playerRepository;
        this.auctionRepository = auctionRepository;
        this.imageService = imageService;
    }

    private static Map<String, String> buildHeaderMapping() {
        Map<String, String> m = new HashMap<>();
        // name variants
        m.put("name", "name");
        m.put("playername", "name");
        m.put("fullname", "name");
        m.put("player", "name");
        // age
        m.put("age", "age");
        m.put("years", "age");
        // role
        m.put("role", "role");
        m.put("position", "role");
        // base price
        m.put("baseprice", "basePrice");
        m.put("base_price", "basePrice");
        m.put("base", "basePrice");
        m.put("price", "basePrice");
        // current price (optional)
        m.put("currentprice", "currentPrice");
        m.put("current_price", "currentPrice");
        // mobile
        m.put("mobilenumber", "mobileNumber");
        m.put("mobile", "mobileNumber");
        m.put("phone", "mobileNumber");
        // photo url
        m.put("photourl", "photoUrl");
        m.put("photo", "photoUrl");
        m.put("image", "photoUrl");
        // status
        m.put("status", "status");
        return m;
    }

    /**
     * Imports players from an uploaded .xlsx file for a given auction.
     */
    @Transactional
    public ImportResult importPlayers(Long auctionId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("Uploaded file is empty");
        }
        String filename = Objects.requireNonNull(file.getOriginalFilename()).toLowerCase();
        if (!filename.endsWith(".xlsx") && !Objects.equals(file.getContentType(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
            throw new InvalidFileException("Only .xlsx files are supported");
        }

        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ImportProcessingException("Auction not found: " + auctionId));

        Map<String, String> headerMappingNormalized = new HashMap<>();
        Map<String, String> baseHeaderMap = buildHeaderMapping();
        // normalize header map keys to the same normalization used by ExcelHelper
        for (Map.Entry<String, String> e : baseHeaderMap.entrySet()) {
            String normalized = com.auction.cricket.util.ExcelHelper.normalizeHeader(e.getKey());
            headerMappingNormalized.put(normalized, e.getValue());
        }

        ExcelHelper.ParseResult parseResult;
        try (InputStream is = file.getInputStream()) {
            parseResult = ExcelHelper.parse(is, headerMappingNormalized);
        } catch (IOException e) {
            throw new InvalidFileException("Failed to read uploaded file", e);
        }

        List<RowError> failed = new ArrayList<>(parseResult.errors);
        List<Player> toSave = new ArrayList<>();
        int processed = 0;

        for (int i = 0; i < parseResult.rows.size(); i++) {
            Map<String, String> row = parseResult.rows.get(i);
            int rowNumber = i + 2; // header + 1-based rows
            processed++;
            List<String> rowErrors = new ArrayList<>();

            String name = optionalTrim(row.get("name"));
            String basePriceStr = optionalTrim(row.get("basePrice"));
            if (name == null || name.isEmpty()) {
                rowErrors.add("name is required");
            }
            Double basePrice = null;
            try {
                if (basePriceStr != null && !basePriceStr.isEmpty()) {
                    basePrice = Double.parseDouble(basePriceStr.replaceAll(",", ""));
                } else {
                    basePrice = auction.getBasePrice() != null ? auction.getBasePrice() : 0.0;
                }
            } catch (NumberFormatException nfe) {
                rowErrors.add("basePrice is not a valid number");
            }

            // age (optional) - default to 0 when missing to satisfy DB not-null constraint
            Integer age = null;
            String ageStr = optionalTrim(row.get("age"));
            if (ageStr != null && !ageStr.isEmpty()) {
                try {
                    age = Integer.valueOf(ageStr);
                } catch (NumberFormatException nfe) {
                    rowErrors.add("age is not a valid integer");
                }
            } else {
                age = 0; // default to 0 to prevent DB null constraint problems
            }

            // role (if missing set to default PLAYER)
            String role = optionalTrim(row.get("role"));
            if (role == null || role.isEmpty()) {
                role = "PLAYER";
            }

            // currentPrice should always start at 0 for new players (ignore any file value)
            Double currentPrice = 0.0;

            String mobile = optionalTrim(row.get("mobileNumber"));
            String photoUrl = optionalTrim(row.get("photoUrl"));
            // Convert Google Drive links and download/store locally
            if (photoUrl != null && !photoUrl.isEmpty()) {
                photoUrl = convertGoogleDriveUrl(photoUrl);
                if (downloadImages) {
                    // Download and store the image locally
                    String localImagePath = imageService.downloadAndStoreImage(photoUrl);
                    if (localImagePath != null) {
                        photoUrl = localImagePath;
                    } else {
                        photoUrl = toProxyUrl(photoUrl);
                    }
                } else {
                    photoUrl = toProxyUrl(photoUrl);
                }
            }
            String status = optionalTrim(row.get("status"));

            if (!rowErrors.isEmpty()) {
                RowError re = new RowError(rowNumber, rowErrors);
                failed.add(re);
                continue;
            }

            Player p = new Player();
            p.setName(name);
            p.setAge(age);
            p.setRole(role);
            p.setBasePrice(basePrice != null ? basePrice : 0.0);
            p.setCurrentPrice(currentPrice);
            p.setMobileNumber(mobile);
            p.setPhotoUrl(photoUrl);
            if (status != null && !status.isEmpty()) {
                try {
                    p.setStatus(com.auction.cricket.entity.PlayerStatus.valueOf(status.toUpperCase()));
                } catch (IllegalArgumentException ignored) {
                    // invalid status - ignore and keep default
                }
            }
            p.setAuction(auction);
            toSave.add(p);

            if (toSave.size() >= BATCH_SIZE) {
                try {
                    playerRepository.saveAll(toSave);
                    // force flush and clear to avoid memory bloat
                    entityManager.flush();
                    entityManager.clear();
                    toSave.clear();
                } catch (DataAccessException dae) {
                    throw new ImportProcessingException("Database error while saving batch", dae);
                }
            }
        }

        // final flush
        if (!toSave.isEmpty()) {
            try {
                playerRepository.saveAll(toSave);
                entityManager.flush();
                entityManager.clear();
            } catch (DataAccessException dae) {
                throw new ImportProcessingException("Database error while saving final batch", dae);
            }
        }

        ImportResult result = new ImportResult();
        result.setTotalRows(processed + parseResult.errors.size());
        result.setSuccessfulRows(processed - failed.size());
        result.setFailedRows(failed);
        return result;
    }

    private static String optionalTrim(String s) {
        return s == null ? null : s.trim();
    }

    /**
     * Converts Google Drive shareable links to thumbnail URLs that work in img
     * tags.
     * Supports formats like:
     * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
     * - https://drive.google.com/file/d/FILE_ID/view
     * - https://drive.google.com/open?id=FILE_ID
     * 
     * Uses Google's thumbnail endpoint which is accessible without auth and works
     * with img tags.
     */
    private static String convertGoogleDriveUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return url;
        }

        url = url.trim();

        // Pattern 1: https://drive.google.com/file/d/FILE_ID/view...
        if (url.contains("/file/d/")) {
            int startIdx = url.indexOf("/file/d/") + 8;
            int endIdx = url.indexOf("/", startIdx);
            if (endIdx == -1) {
                endIdx = url.length();
            }
            String fileId = url.substring(startIdx, endIdx);
            // Use thumbnail URL which works with img tags and public files
            return "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w1000";
        }

        // Pattern 2: https://drive.google.com/open?id=FILE_ID
        if (url.contains("open?id=")) {
            int startIdx = url.indexOf("open?id=") + 8;
            int endIdx = url.indexOf("&", startIdx);
            if (endIdx == -1) {
                endIdx = url.length();
            }
            String fileId = url.substring(startIdx, endIdx);
            return "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w1000";
        }

        // If not a Google Drive URL, return as is
        return url;
    }

    private static String toProxyUrl(String url) {
        if (url == null || url.isEmpty()) {
            return url;
        }
        String encoded = URLEncoder.encode(url, StandardCharsets.UTF_8);
        return "/api/proxy/image?url=" + encoded;
    }
}
