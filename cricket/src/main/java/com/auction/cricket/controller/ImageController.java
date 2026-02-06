package com.auction.cricket.controller;

import java.io.IOException;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.auction.cricket.service.ImageService;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private final ImageService imageService;

    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    /**
     * Serves locally stored player images.
     * Usage: /api/images/filename.jpg
     */
    @GetMapping("/{filename}")
    public ResponseEntity<byte[]> getImage(@PathVariable String filename) {
        try {
            // Security: only allow alphanumeric and .jpg/.jpeg
            if (!filename.matches("[a-f0-9\\-]+\\.jpg")) {
                return ResponseEntity.badRequest().build();
            }

            byte[] imageData = imageService.getImage(filename);
            if (imageData == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_JPEG_VALUE)
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                    .body(imageData);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
