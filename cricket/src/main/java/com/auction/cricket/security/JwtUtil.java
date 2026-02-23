package com.auction.cricket.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms}")
    private Long expirationMs;

    @PostConstruct
    public void validateConfiguration() {
        if (secret == null || secret.trim().length() < 32) {
            throw new IllegalStateException("JWT secret must be at least 32 characters long.");
        }
        if (expirationMs == null || expirationMs <= 0) {
            throw new IllegalStateException("JWT expiration must be a positive number of milliseconds.");
        }
    }

    private Key getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUsername(String token) {
        try {
            Claims claims = extractAllClaims(token);
            String username = claims.getSubject();
            logger.debug("Extracted username: {} from token", username);
            return username;
        } catch (Exception e) {
            logger.error("Error extracting username from token: {}", e.getMessage(), e);
            return null;
        }
    }

    public Date extractExpiration(String token) {
        try {
            Claims claims = extractAllClaims(token);
            Date expiration = claims.getExpiration();
            logger.debug("Extracted expiration: {} from token", expiration);
            return expiration;
        } catch (Exception e) {
            logger.error("Error extracting expiration from token: {}", e.getMessage(), e);
            return null;
        }
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        try {
            final Claims claims = extractAllClaims(token);
            return claimsResolver.apply(claims);
        } catch (Exception e) {
            logger.error("Error extracting claim from token: {}", e.getMessage(), e);
            return null;
        }
    }

    private Claims extractAllClaims(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
            logger.debug("Extracted claims from token: {}", claims);
            return claims;
        } catch (Exception e) {
            logger.error("Error extracting claims from token: {}", e.getMessage(), e);
            throw e;
        }
    }

    private Boolean isTokenExpired(String token) {
        try {
            Date expiration = extractExpiration(token);
            if (expiration == null) {
                return true;
            }
            boolean isExpired = expiration.before(new Date());
            logger.debug("Token expiration check: {} is expired: {}", expiration, isExpired);
            return isExpired;
        } catch (Exception e) {
            logger.error("Error checking token expiration: {}", e.getMessage(), e);
            return true;
        }
    }

    public String generateToken(UserDetails userDetails) {
        try {
            Map<String, Object> claims = new HashMap<>();
            String token = createToken(claims, userDetails.getUsername());
            logger.debug("Generated token for user: {}", userDetails.getUsername());
            return token;
        } catch (Exception e) {
            logger.error("Error generating token: {}", e.getMessage(), e);
            throw e;
        }
    }

    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + expirationMs);
        
        String token = Jwts.builder()
            .setClaims(claims)
            .setSubject(subject)
            .setIssuedAt(now)
            .setExpiration(expirationDate)
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
            
        logger.debug("Created token for subject: {} with expiration: {}", subject, expirationDate);
        return token;
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            if (username == null) {
                logger.warn("Token validation failed: username is null");
                return false;
            }
            
            boolean isValid = (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
            logger.debug("Token validation for user: {} - isValid: {}", username, isValid);
            return isValid;
        } catch (Exception e) {
            logger.error("Error validating token: {}", e.getMessage(), e);
            return false;
        }
    }
} 
