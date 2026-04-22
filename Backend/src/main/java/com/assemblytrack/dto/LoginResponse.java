package com.assemblytrack.dto;

public class LoginResponse {
    private String token;
    private String employeeId;
    private String name;
    private String role;

    public LoginResponse() {
    }

    public LoginResponse(String token, String employeeId, String name, String role) {
        this.token = token;
        this.employeeId = employeeId;
        this.name = name;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}