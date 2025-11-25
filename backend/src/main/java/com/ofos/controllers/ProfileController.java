package com.ofos.controllers;

import com.ofos.models.Profile;
import com.ofos.models.User;
import com.ofos.repository.UserRepository;
import com.ofos.services.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:4200")
public class ProfileController {
    
    @Autowired
    private ProfileService profileService;
    
    @Autowired
    private UserRepository userRepository;
    
    // GET /api/profile
    // Response: { "id": number, "userId": number, "firstName": "string", "lastName": "string", "email": "string", "phoneNumber": "string", "bio": "string" }
    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'DELIVERY_AGENT')")
    public ResponseEntity<Profile> getProfile(Authentication authentication) {
        Long userId = getUserIdFromAuth(authentication);
        return ResponseEntity.ok(profileService.getProfileByUserId(userId));
    }
    
    // PUT /api/profile
    // Request Body: { "firstName": "string", "lastName": "string", "email": "string", "phoneNumber": "string", "bio": "string" }
    // Response: { "id": number, "userId": number, "firstName": "string", ... }
    @PutMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'DELIVERY_AGENT')")
    public ResponseEntity<Profile> updateProfile(@RequestBody Profile profile, Authentication authentication) {
        Long userId = getUserIdFromAuth(authentication);
        return ResponseEntity.ok(profileService.updateProfile(userId, profile));
    }
    
    private Long getUserIdFromAuth(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}

