package com.ofos.controllers;

import com.ofos.models.Order;
import com.ofos.models.OrderItem;
import com.ofos.models.User;
import com.ofos.repository.UserRepository;
import com.ofos.services.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:4200")
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private UserRepository userRepository;
    
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest, Authentication authentication) {
        try {
            if (orderRequest == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Order request cannot be null");
                return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST).body(error);
            }
            
            if (orderRequest.getRestaurantId() == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Restaurant ID is required");
                return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST).body(error);
            }
            
            if (orderRequest.getDeliveryAddress() == null || orderRequest.getDeliveryAddress().trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Delivery address is required");
                return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST).body(error);
            }
            
            if (orderRequest.getOrderItems() == null || orderRequest.getOrderItems().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Order must contain at least one item");
                return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST).body(error);
            }
            
            Order order = new Order();
            order.setUserId(getUserIdFromAuth(authentication));
            order.setRestaurantId(orderRequest.getRestaurantId());
            order.setDeliveryAddress(orderRequest.getDeliveryAddress());
            
            Order createdOrder = orderService.createOrder(order, orderRequest.getOrderItems());
            return ResponseEntity.ok(createdOrder);
        } catch (RuntimeException e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create order: " + e.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<Order>> getMyOrders(Authentication authentication) {
        Long userId = getUserIdFromAuth(authentication);
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }
    
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }
    
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'DELIVERY_AGENT')")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> statusRequest) {
        try {
            Order updatedOrder = orderService.updateOrderStatus(id, statusRequest.get("status"));
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        
        return orderService.getOrderById(id)
                .map(order -> {
                    try {
                        String username = authentication.getName();
                        User user = userRepository.findByUsername(username)
                                .orElse(null);
                        
                        if (user == null) {
                            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
                        }
                        
                        if ("ADMIN".equals(user.getRole()) || "DELIVERY_AGENT".equals(user.getRole())) {
                            return ResponseEntity.ok(order);
                        }
                        
                        if (order.getUserId().equals(user.getId())) {
                            return ResponseEntity.ok(order);
                        }
                        
                        return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
                    } catch (Exception e) {
                        return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).build();
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{id}/items")
    public ResponseEntity<List<OrderItem>> getOrderItems(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderItems(id));
    }
    
    private Long getUserIdFromAuth(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
    
    public static class OrderRequest {
        private Long restaurantId;
        private String deliveryAddress;
        private List<OrderService.OrderItemRequest> orderItems;
        
        public Long getRestaurantId() {
            return restaurantId;
        }
        
        public void setRestaurantId(Long restaurantId) {
            this.restaurantId = restaurantId;
        }
        
        public String getDeliveryAddress() {
            return deliveryAddress;
        }
        
        public void setDeliveryAddress(String deliveryAddress) {
            this.deliveryAddress = deliveryAddress;
        }
        
        public List<OrderService.OrderItemRequest> getOrderItems() {
            return orderItems;
        }
        
        public void setOrderItems(List<OrderService.OrderItemRequest> orderItems) {
            this.orderItems = orderItems;
        }
    }
}

