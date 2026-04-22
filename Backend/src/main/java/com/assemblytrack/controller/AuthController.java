package com.assemblytrack.controller;

import com.assemblytrack.dto.LoginRequest;
import com.assemblytrack.dto.LoginResponse;
import com.assemblytrack.entity.Employee;
import com.assemblytrack.repository.EmployeeRepository;
import com.assemblytrack.service.JwtService;
import com.assemblytrack.service.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        Employee employee = employeeRepository.findByEmployeeId(loginRequest.getEmployeeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (employee.getRole() == Employee.Role.ADMIN) {
            try {
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                loginRequest.getEmployeeId(),
                                loginRequest.getPassword()));
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
            }
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getEmployeeId());
        String jwt = jwtService.generateToken(userDetails);

        LoginResponse response = new LoginResponse(
                jwt,
                employee.getEmployeeId(),
                employee.getName(),
                employee.getRole().name());

        return ResponseEntity.ok(response);
    }
}