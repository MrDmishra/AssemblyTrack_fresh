package com.assemblytrack.service;

import com.assemblytrack.dto.AuthRequest;
import com.assemblytrack.dto.AuthResponse;
import com.assemblytrack.model.Role;
import com.assemblytrack.model.User;
import com.assemblytrack.repository.UserRepository;
import com.assemblytrack.security.JwtService;
import java.util.Map;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager, JwtService jwtService,
                       UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse login(AuthRequest request) {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        String token = jwtService.generateToken(userDetails, Map.of("role", user.getRole().name()));
        return new AuthResponse(token, user.getRole().name());
    }

    public AuthResponse registerEmployee(AuthRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_EMPLOYEE);
        userRepository.save(user);

        UserDetails details = new org.springframework.security.core.userdetails.User(
            user.getUsername(), user.getPassword(), java.util.List.of(() -> user.getRole().name())
        );
        String token = jwtService.generateToken(details, Map.of("role", user.getRole().name()));
        return new AuthResponse(token, user.getRole().name());
    }
}
