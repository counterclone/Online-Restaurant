package com.ofos.controllers;

import com.ofos.models.Order;
import com.ofos.repository.OrderRepository;
import com.ofos.repository.RestaurantRepository;
import com.ofos.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:4200")
public class DashboardController {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private RestaurantRepository restaurantRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // GET /api/dashboard/admin
    // Response: { "totalOrders": number, "totalRevenue": number, "totalRestaurants": number, "topRestaurants": [...] }
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAdminDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        
        List<Order> allOrders = orderRepository.findAll();
        dashboard.put("totalOrders", allOrders.size());
        
        double totalRevenue = allOrders.stream()
                .mapToDouble(Order::getFinalAmount)
                .sum();
        dashboard.put("totalRevenue", totalRevenue);
        
        dashboard.put("totalRestaurants", restaurantRepository.count());
        
        // Top restaurants by order count
        Map<Long, Long> restaurantOrderCount = allOrders.stream()
                .collect(Collectors.groupingBy(Order::getRestaurantId, Collectors.counting()));
        
        List<Map<String, Object>> topRestaurants = restaurantOrderCount.entrySet().stream()
                .sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
                .limit(5)
                .map(entry -> {
                    Map<String, Object> restaurantData = new HashMap<>();
                    restaurantRepository.findById(entry.getKey()).ifPresent(restaurant -> {
                        restaurantData.put("id", restaurant.getId());
                        restaurantData.put("name", restaurant.getName());
                        restaurantData.put("orderCount", entry.getValue());
                    });
                    return restaurantData;
                })
                .filter(map -> !map.isEmpty())
                .collect(Collectors.toList());
        
        dashboard.put("topRestaurants", topRestaurants);
        
        return ResponseEntity.ok(dashboard);
    }
    
    // GET /api/dashboard/customer
    // Response: { "recentOrders": [...], "totalOrders": number, "totalSpent": number }
    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getCustomerDashboard(Authentication authentication) {
        Map<String, Object> dashboard = new HashMap<>();
        
        Long userId = getUserIdFromAuth(authentication);
        List<Order> userOrders = orderRepository.findByUserId(userId);
        
        dashboard.put("totalOrders", userOrders.size());
        
        double totalSpent = userOrders.stream()
                .mapToDouble(Order::getFinalAmount)
                .sum();
        dashboard.put("totalSpent", totalSpent);
        
        // Recent orders (last 5)
        List<Order> recentOrders = userOrders.stream()
                .sorted((o1, o2) -> o2.getOrderDate().compareTo(o1.getOrderDate()))
                .limit(5)
                .collect(Collectors.toList());
        
        dashboard.put("recentOrders", recentOrders);
        
        return ResponseEntity.ok(dashboard);
    }
    
    // GET /api/dashboard/delivery
    // Response: { "assignedOrders": number, "completedOrders": number, "pendingOrders": [...] }
    @GetMapping("/delivery")
    @PreAuthorize("hasRole('DELIVERY_AGENT')")
    public ResponseEntity<Map<String, Object>> getDeliveryDashboard(Authentication authentication) {
        Map<String, Object> dashboard = new HashMap<>();
        
        // Get delivery agent by userId - simplified for now
        List<Order> assignedOrders = orderRepository.findAll().stream()
                .filter(order -> order.getDeliveryAgentId() != null)
                .filter(order -> {
                    // This should check if deliveryAgentId matches the agent's id
                    // Simplified for now
                    return true;
                })
                .collect(Collectors.toList());
        
        dashboard.put("assignedOrders", assignedOrders.size());
        
        long completedOrders = assignedOrders.stream()
                .filter(order -> "DELIVERED".equals(order.getStatus()))
                .count();
        dashboard.put("completedOrders", completedOrders);
        
        List<Order> pendingOrders = assignedOrders.stream()
                .filter(order -> !"DELIVERED".equals(order.getStatus()))
                .collect(Collectors.toList());
        
        dashboard.put("pendingOrders", pendingOrders);
        
        return ResponseEntity.ok(dashboard);
    }
    
    private Long getUserIdFromAuth(Authentication authentication) {
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .map(user -> user.getId())
                .orElse(0L);
    }
}

