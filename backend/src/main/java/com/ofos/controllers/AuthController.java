package com.ofos.controllers;

import com.ofos.models.User;
import com.ofos.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    // POST /auth/register
    // Request Body: { "username": "string", "email": "string", "password": "string", 
    //                 "firstName": "string", "lastName": "string", "role": "CUSTOMER|ADMIN|DELIVERY_AGENT" }
    // Response: { "token": "string", "user": { "id": number, "username": "string", "email": "string", 
    //            "firstName": "string", "lastName": "string", "role": "string" } }
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody User user) {
        try {
            Map<String, Object> response = authService.register(user);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // POST /auth/login
    // Request Body: { "username": "string", "password": "string" }
    // Response: { "token": "string", "user": { "id": number, "username": "string", "email": "string", 
    //            "firstName": "string", "lastName": "string", "role": "string" } }
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
        try {
            String username = loginRequest.get("username");
            String password = loginRequest.get("password");
            
            if (username == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username and password are required"));
            }
            
            Map<String, Object> response = authService.login(username, password);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
        }
    }
}

