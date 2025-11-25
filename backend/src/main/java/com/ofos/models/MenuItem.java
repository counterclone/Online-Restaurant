package com.ofos.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "menu_items")
public class MenuItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Column(nullable = false)
    private String name;
    
    @NotNull
    @Positive
    @Column(nullable = false)
    private Double price;
    
    @NotNull
    @Column(nullable = false)
    private Boolean veg;
    
    @Column(nullable = false)
    private Long restaurantId;
    
    public MenuItem() {
    }
    
    public MenuItem(String name, Double price, Boolean veg, Long restaurantId) {
        this.name = name;
        this.price = price;
        this.veg = veg;
        this.restaurantId = restaurantId;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public Double getPrice() {
        return price;
    }
    
    public void setPrice(Double price) {
        this.price = price;
    }
    
    public Boolean getVeg() {
        return veg;
    }
    
    public void setVeg(Boolean veg) {
        this.veg = veg;
    }
    
    public Long getRestaurantId() {
        return restaurantId;
    }
    
    public void setRestaurantId(Long restaurantId) {
        this.restaurantId = restaurantId;
    }
}

