package com.ofos.controllers;

import com.ofos.models.DeliveryAgent;
import com.ofos.models.Order;
import com.ofos.models.User;
import com.ofos.repository.UserRepository;
import com.ofos.services.DeliveryService;
import com.ofos.services.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/delivery")
@CrossOrigin(origins = "http://localhost:4200")
public class DeliveryController {
    
    @Autowired
    private DeliveryService deliveryService;
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping("/agents")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DeliveryAgent>> getAllDeliveryAgents() {
        return ResponseEntity.ok(deliveryService.getAllDeliveryAgents());
    }
    
    @GetMapping("/agents/available")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DeliveryAgent>> getAvailableDeliveryAgents() {
        return ResponseEntity.ok(deliveryService.getAvailableDeliveryAgents());
    }
    
    @GetMapping("/agents/{id}")
    public ResponseEntity<?> getDeliveryAgentById(@PathVariable Long id) {
        return deliveryService.getDeliveryAgentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/agents")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DeliveryAgent> createDeliveryAgent(@RequestBody DeliveryAgent deliveryAgent) {
        return ResponseEntity.ok(deliveryService.createDeliveryAgent(deliveryAgent));
    }
    
    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('DELIVERY_AGENT')")
    public ResponseEntity<?> getMyOrders(Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            Optional<DeliveryAgent> agentOpt = deliveryService.getDeliveryAgentByUserId(userId);
            
            if (agentOpt.isEmpty()) {
                return ResponseEntity.ok(List.of());
            }
            
            DeliveryAgent agent = agentOpt.get();
            return ResponseEntity.ok(deliveryService.getAssignedOrders(agent.getId()));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to load orders: " + e.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/pending-orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Order>> getPendingOrders() {
        return ResponseEntity.ok(deliveryService.getPendingOrders());
    }
    
    @PostMapping("/assign-order")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Order> assignOrder(@RequestBody Map<String, Long> request) {
        Long orderId = request.get("orderId");
        Long deliveryAgentId = request.get("deliveryAgentId");
        
        Order order = orderService.assignDeliveryAgent(orderId, deliveryAgentId);
        return ResponseEntity.ok(order);
    }
    
    private Long getUserIdFromAuth(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}

