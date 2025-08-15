package com.auction.cricket.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import net.coobird.thumbnailator.Thumbnails;
import net.coobird.thumbnailator.resizers.Resizers;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileUploadService {

    private final String uploadDir = "uploads"; // Directory to store uploaded files
    private static final Logger logger = LoggerFactory.getLogger(FileUploadService.class);

    public FileUploadService() {
        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            logger.error("Could not create upload directory!", e);
            throw new RuntimeException("Could not create upload directory!", e);
        }
    }

    public String uploadFile(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        String fileName = UUID.randomUUID().toString() + "-" + originalFilename;
        Path filePath = Paths.get(uploadDir, fileName);

        if ("svg".equals(fileExtension)) {
            // For SVG files, save directly without compression
            Files.copy(file.getInputStream(), filePath);
        } else {
            // For other image types, compress and save
            File tempFile = null;
            try {
                tempFile = Files.createTempFile("temp-", originalFilename).toFile();
                file.transferTo(tempFile);

                Thumbnails.of(tempFile)
                        .size(800, 800) // Resize to a maximum of 800x800
                        .outputQuality(0.8) // Compress to 80% quality
                        .toFile(filePath.toFile());
            } catch (IOException e) {
                logger.error("Error during file upload or compression: {}", e.getMessage(), e);
                throw e;
            } finally {
                if (tempFile != null) {
                    tempFile.delete(); // Ensure temp file is deleted
                }
            }
        }
        return "/" + uploadDir + "/" + fileName; // Return URL relative to base URL
    }
}