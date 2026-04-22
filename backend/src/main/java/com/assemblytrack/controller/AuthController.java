package com.assemblytrack.controller;

import com.assemblytrack.dto.AuthRequest;
import com.assemblytrack.dto.AuthResponse;
import com.assemblytrack.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registerEmployee(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.registerEmployee(request));
    }
}
