package com.auction.cricket.controller;

import com.auction.cricket.dto.UserDetailsDto;
import com.auction.cricket.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserDetailsDto> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(userService.getUserDetails(authentication.getName()));
    }
} 