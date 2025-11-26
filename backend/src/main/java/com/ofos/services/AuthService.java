package com.ofos.services;

import com.ofos.config.JwtUtil;
import com.ofos.models.DeliveryAgent;
import com.ofos.models.User;
import com.ofos.repository.DeliveryAgentRepository;
import com.ofos.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private DeliveryAgentRepository deliveryAgentRepository;

    public Map<String, Object> register(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("CUSTOMER");
        }
        user.setEnabled(true);

        User savedUser = userRepository.save(user);

        if ("DELIVERY_AGENT".equals(savedUser.getRole())) {
            if (deliveryAgentRepository.findByUserId(savedUser.getId()).isEmpty()) {
                DeliveryAgent deliveryAgent = new DeliveryAgent();
                deliveryAgent.setUserId(savedUser.getId());
                deliveryAgent.setVehicleNumber("TBD");
                deliveryAgent.setPhoneNumber(savedUser.getEmail());
                deliveryAgent.setAvailable(true);
                deliveryAgentRepository.save(deliveryAgent);
            }
        }

        String token = jwtUtil.generateToken(
                savedUser.getUsername(),
                savedUser.getRole(),
                savedUser.getEmail(),
                savedUser.getFirstName(),
                savedUser.getLastName());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", createUserResponse(savedUser));
        return response;
    }

    public Map<String, Object> login(String username, String password) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!user.getEnabled()) {
            throw new RuntimeException("User account is disabled");
        }

        String token = jwtUtil.generateToken(
                user.getUsername(),
                user.getRole(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", createUserResponse(user));
        return response;
    }

    private Map<String, Object> createUserResponse(User user) {
        Map<String, Object> userResponse = new HashMap<>();
        userResponse.put("id", user.getId());
        userResponse.put("username", user.getUsername());
        userResponse.put("email", user.getEmail());
        userResponse.put("firstName", user.getFirstName());
        userResponse.put("lastName", user.getLastName());
        userResponse.put("role", user.getRole());
        return userResponse;
    }
}
