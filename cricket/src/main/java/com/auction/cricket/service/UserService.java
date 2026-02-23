package com.auction.cricket.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.auction.cricket.dto.AuthRequest;
import com.auction.cricket.dto.AuthResponse;
import com.auction.cricket.dto.RegisterRequest;
import com.auction.cricket.dto.UserDetailsDto;
import com.auction.cricket.entity.Role;
import com.auction.cricket.entity.User;
import com.auction.cricket.repository.UserRepository;
import com.auction.cricket.security.JwtUtil;

@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.security.allow-admin-register:false}")
    private boolean allowAdminRegister;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        logger.info("Registering new user: {}", request.getUsername());

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        if (request.getRoles() != null && request.getRoles().contains(com.auction.cricket.entity.Role.ADMIN)
                && !allowAdminRegister) {
            throw new IllegalArgumentException("Admin self-registration is disabled.");
        }

        java.util.Set<com.auction.cricket.entity.Role> assignedRoles = new java.util.HashSet<>();
        if (allowAdminRegister && request.getRoles() != null && !request.getRoles().isEmpty()) {
            assignedRoles.addAll(request.getRoles());
        } else {
            assignedRoles.add(com.auction.cricket.entity.Role.TEAM_OWNER);
        }
        user.setRoles(assignedRoles);
        user = userRepository.save(user);

        logger.info("User registered successfully: {}", user.getUsername());

        final UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        final String token = jwtUtil.generateToken(userDetails);

        return new AuthResponse(token, user.getUsername());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        final String jwt = jwtUtil.generateToken(userDetails);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        logger.debug("Logged in user: {}", user.getUsername());

        return new AuthResponse(jwt, user.getUsername());
    }

    @Transactional(readOnly = true)
    public UserDetailsDto getUserDetails(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        java.util.Set<String> roles = user.getRoles().stream()
                .map(Enum::name)
                .collect(java.util.stream.Collectors.toSet());
        String primaryRole = user.getRoles().contains(Role.ADMIN) ? Role.ADMIN.name() : Role.TEAM_OWNER.name();

        return new UserDetailsDto(
                user.getUsername(),
                user.getEmail(),
                primaryRole,
                roles);
    }
}
