package com.assemblytrack.controller;

import com.assemblytrack.dto.EmployeeRequest;
import com.assemblytrack.entity.Employee;
import com.assemblytrack.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<Employee>> getAll() {
        return ResponseEntity.ok(employeeRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Employee> create(@RequestBody EmployeeRequest request) {
        if (request.getEmployeeId() == null || request.getEmployeeId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Employee ID is required");
        }
        if (request.getName() == null || request.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
        }
        if (employeeRepository.findByEmployeeId(request.getEmployeeId()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Employee ID already exists");
        }

        Employee.Role role = parseRole(request.getRole());
        String password = (request.getPassword() != null && !request.getPassword().isBlank())
                ? passwordEncoder.encode(request.getPassword())
                : passwordEncoder.encode(request.getEmployeeId());

        Employee employee = new Employee(request.getEmployeeId(), request.getName(), role, password);
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeRepository.save(employee));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employee> update(@PathVariable Long id, @RequestBody EmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            employee.setName(request.getName());
        }
        if (request.getRole() != null && !request.getRole().isBlank()) {
            employee.setRole(parseRole(request.getRole()));
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            employee.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return ResponseEntity.ok(employeeRepository.save(employee));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found");
        }
        employeeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private Employee.Role parseRole(String role) {
        try {
            return Employee.Role.valueOf(role != null ? role.toUpperCase() : "EMPLOYEE");
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role: " + role);
        }
    }
}
