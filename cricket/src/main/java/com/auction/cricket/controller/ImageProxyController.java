package com.auction.cricket.controller;

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

            // Fetch the image from the external URL
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.USER_AGENT, "Mozilla/5.0");
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<byte[]> upstream = restTemplate.exchange(url, HttpMethod.GET, entity, byte[].class);
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
}
