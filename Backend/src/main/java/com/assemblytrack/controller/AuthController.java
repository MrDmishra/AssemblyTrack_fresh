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
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

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
        String employeeId = Optional.ofNullable(loginRequest.getEmployeeId())
                .map(String::trim)
                .orElse("");

        if (employeeId.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        Employee employee = employeeRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (employee.getRole() == Employee.Role.ADMIN) {
            String requestPassword = Optional.ofNullable(loginRequest.getPassword())
                    .map(String::trim)
                    .orElse("");
            String storedPassword = Optional.ofNullable(employee.getPassword())
                    .map(String::trim)
                    .orElse("");

            boolean isBcryptHash = storedPassword.startsWith("$2a$")
                    || storedPassword.startsWith("$2b$")
                    || storedPassword.startsWith("$2y$");
            boolean passwordValid = isBcryptHash
                    ? passwordEncoder.matches(requestPassword, storedPassword)
                    : requestPassword.equals(storedPassword);

            if (!passwordValid) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
            }
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(employee.getEmployeeId());
        String jwt = jwtService.generateToken(userDetails);

        LoginResponse response = new LoginResponse(
                jwt,
                employee.getEmployeeId(),
                employee.getName(),
                employee.getRole().name());

        return ResponseEntity.ok(response);
    }
}