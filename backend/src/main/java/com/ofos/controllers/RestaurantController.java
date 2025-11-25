package com.ofos.controllers;

import com.ofos.models.Restaurant;
import com.ofos.services.RestaurantService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "http://localhost:4200")
public class RestaurantController {
    
    @Autowired
    private RestaurantService restaurantService;
    
    // GET /api/restaurants
    // Response: [ { "id": number, "name": "string", "address": "string", "cuisine": "string", "image": "string" } ]
    @GetMapping
    public ResponseEntity<List<Restaurant>> getAllRestaurants() {
        return ResponseEntity.ok(restaurantService.getAllRestaurants());
    }
    
    // GET /api/restaurants/{id}
    // Response: { "id": number, "name": "string", "address": "string", "cuisine": "string", "image": "string" }
    @GetMapping("/{id}")
    public ResponseEntity<Restaurant> getRestaurantById(@PathVariable Long id) {
        return restaurantService.getRestaurantById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // POST /api/restaurants
    // Request Body: { "name": "string", "address": "string", "cuisine": "string", "image": "string" }
    // Response: { "id": number, "name": "string", "address": "string", "cuisine": "string", "image": "string" }
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Restaurant> createRestaurant(@Valid @RequestBody Restaurant restaurant) {
        return ResponseEntity.ok(restaurantService.createRestaurant(restaurant));
    }
    
    // PUT /api/restaurants/{id}
    // Request Body: { "name": "string", "address": "string", "cuisine": "string", "image": "string" }
    // Response: { "id": number, "name": "string", "address": "string", "cuisine": "string", "image": "string" }
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Restaurant> updateRestaurant(@PathVariable Long id, @Valid @RequestBody Restaurant restaurant) {
        try {
            return ResponseEntity.ok(restaurantService.updateRestaurant(id, restaurant));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // DELETE /api/restaurants/{id}
    // Response: { "message": "string" }
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteRestaurant(@PathVariable Long id) {
        try {
            restaurantService.deleteRestaurant(id);
            return ResponseEntity.ok(Map.of("message", "Restaurant deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // GET /api/restaurants/search?name={name}
    // Response: [ { "id": number, "name": "string", "address": "string", "cuisine": "string", "image": "string" } ]
    @GetMapping("/search")
    public ResponseEntity<List<Restaurant>> searchRestaurants(@RequestParam String name) {
        return ResponseEntity.ok(restaurantService.searchRestaurants(name));
    }
    
    // GET /api/restaurants/cuisine/{cuisine}
    // Response: [ { "id": number, "name": "string", "address": "string", "cuisine": "string", "image": "string" } ]
    @GetMapping("/cuisine/{cuisine}")
    public ResponseEntity<List<Restaurant>> getRestaurantsByCuisine(@PathVariable String cuisine) {
        return ResponseEntity.ok(restaurantService.getRestaurantsByCuisine(cuisine));
    }
}

