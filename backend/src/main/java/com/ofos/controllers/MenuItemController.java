package com.ofos.controllers;

import com.ofos.models.MenuItem;
import com.ofos.services.MenuItemService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200")
public class MenuItemController {
    
    @Autowired
    private MenuItemService menuItemService;
    
    // POST /api/restaurants/{id}/items
    // Request Body: { "name": "string", "price": number, "veg": boolean }
    // Response: { "id": number, "name": "string", "price": number, "veg": boolean, "restaurantId": number }
    @PostMapping("/restaurants/{id}/items")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MenuItem> createMenuItem(@PathVariable Long id, @Valid @RequestBody MenuItem menuItem) {
        menuItem.setRestaurantId(id);
        return ResponseEntity.ok(menuItemService.createMenuItem(menuItem));
    }
    
    // GET /api/restaurants/{id}/items
    // Response: [ { "id": number, "name": "string", "price": number, "veg": boolean, "restaurantId": number } ]
    @GetMapping("/restaurants/{id}/items")
    public ResponseEntity<List<MenuItem>> getMenuItemsByRestaurant(@PathVariable Long id) {
        return ResponseEntity.ok(menuItemService.getMenuItemsByRestaurant(id));
    }
    
    // PUT /api/items/{itemId}
    // Request Body: { "name": "string", "price": number, "veg": boolean }
    // Response: { "id": number, "name": "string", "price": number, "veg": boolean, "restaurantId": number }
    @PutMapping("/items/{itemId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MenuItem> updateMenuItem(@PathVariable Long itemId, @Valid @RequestBody MenuItem menuItem) {
        try {
            return ResponseEntity.ok(menuItemService.updateMenuItem(itemId, menuItem));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // DELETE /api/items/{itemId}
    // Response: { "message": "string" }
    @DeleteMapping("/items/{itemId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteMenuItem(@PathVariable Long itemId) {
        try {
            menuItemService.deleteMenuItem(itemId);
            return ResponseEntity.ok(Map.of("message", "Menu item deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // GET /api/items/{itemId}
    // Response: { "id": number, "name": "string", "price": number, "veg": boolean, "restaurantId": number }
    @GetMapping("/items/{itemId}")
    public ResponseEntity<MenuItem> getMenuItemById(@PathVariable Long itemId) {
        return menuItemService.getMenuItemById(itemId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }
}

