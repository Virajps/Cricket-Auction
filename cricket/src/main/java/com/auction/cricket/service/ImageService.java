package com.auction.cricket.service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ImageService {

    @Value("${app.upload.dir:./uploads/images}")
    private String uploadDir;

    private final RestTemplate restTemplate;

    @Autowired
    public ImageService(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder.build();
    }

    /**
     * Downloads an image from a URL and stores it locally.
     * Returns the local path to be used in the app.
     */
    public String downloadAndStoreImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return null;
        }

        try {
            // Create upload directory if it doesn't exist
            File uploadDirectory = new File(uploadDir);
            if (!uploadDirectory.exists()) {
                uploadDirectory.mkdirs();
            }

            // Download the image
            byte[] imageData = restTemplate.getForObject(imageUrl, byte[].class);
            if (imageData == null || imageData.length == 0) {
                return null;
            }

            // Generate unique filename
            String filename = UUID.randomUUID().toString() + ".jpg";
            String filepath = uploadDir + File.separator + filename;

            // Save to disk
            try (FileOutputStream fos = new FileOutputStream(filepath)) {
                fos.write(imageData);
            }

            // Return path for API access
            return "/api/images/" + filename;
        } catch (Exception e) {
            System.err.println("Failed to download image from " + imageUrl + ": " + e.getMessage());
            return null;
        }
    }

    /**
     * Retrieves a locally stored image by filename.
     */
    public byte[] getImage(String filename) throws IOException {
        String filepath = uploadDir + File.separator + filename;
        File file = new File(filepath);

        // Security check: ensure the file is within the upload directory
        if (!file.getCanonicalPath().startsWith(new File(uploadDir).getCanonicalPath())) {
            throw new IOException("Invalid file path");
        }

        if (!file.exists()) {
            return null;
        }

        return Files.readAllBytes(Paths.get(filepath));
    }
}
