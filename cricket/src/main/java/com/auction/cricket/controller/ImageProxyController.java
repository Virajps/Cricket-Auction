package com.auction.cricket.controller;

import java.net.URI;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/proxy")
public class ImageProxyController {

    private final RestTemplate restTemplate;

    public ImageProxyController() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Proxies external images (especially from Google Drive) to bypass CORS issues.
     * Usage:
     * /api/proxy/image?url=https://drive.google.com/thumbnail?id=FILE_ID&sz=w1000
     */
    @GetMapping("/image")
    public ResponseEntity<byte[]> proxyImage(@RequestParam String url) {
        try {
            // Validate it's a safe URL (optional additional validation)
            if (!url.startsWith("https://")) {
                return ResponseEntity.badRequest().build();
            }

            String normalizedUrl = normalizeGoogleDriveImageUrl(url);

            // Fetch the image from the external URL
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.USER_AGENT, "Mozilla/5.0");
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<byte[]> upstream = restTemplate.exchange(normalizedUrl, HttpMethod.GET, entity, byte[].class);
            byte[] imageData = upstream.getBody();
            if (imageData == null || imageData.length == 0) {
                return ResponseEntity.notFound().build();
            }
            MediaType contentType = upstream.getHeaders().getContentType();
            if (contentType == null) {
                contentType = MediaType.APPLICATION_OCTET_STREAM;
            }

            // Return with appropriate headers to allow caching and proper MIME type
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, contentType.toString())
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=3600")
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                    .body(imageData);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private String normalizeGoogleDriveImageUrl(String url) {
        try {
            URI uri = URI.create(url);
            String host = uri.getHost();
            if (host == null || !host.toLowerCase().contains("drive.google.com")) {
                return url;
            }

            String path = uri.getPath() == null ? "" : uri.getPath();
            String fileId = null;

            if (path.contains("/file/d/")) {
                int startIdx = path.indexOf("/file/d/") + 8;
                int endIdx = path.indexOf('/', startIdx);
                if (endIdx == -1) {
                    endIdx = path.length();
                }
                fileId = path.substring(startIdx, endIdx);
            } else if (path.endsWith("/open") || path.contains("/open")) {
                fileId = queryParam(uri.getQuery(), "id");
            }

            if (fileId == null || fileId.isBlank()) {
                return url;
            }

            return "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w1000";
        } catch (Exception ignored) {
            return url;
        }
    }

    private String queryParam(String query, String key) {
        if (query == null || query.isBlank()) {
            return null;
        }
        String[] pairs = query.split("&");
        for (String pair : pairs) {
            String[] kv = pair.split("=", 2);
            if (kv.length == 2 && key.equals(kv[0])) {
                return kv[1];
            }
        }
        return null;
    }
}
