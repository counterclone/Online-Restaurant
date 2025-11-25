package com.ofos.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "delivery_agents")
public class DeliveryAgent {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Column(unique = true, nullable = false)
    private Long userId;
    
    @NotBlank
    @Column(nullable = false)
    private String vehicleNumber;
    
    @NotBlank
    @Column(nullable = false)
    private String phoneNumber;
    
    @Column(nullable = false)
    private Boolean available = true;
    
    public DeliveryAgent() {
    }
    
    public DeliveryAgent(Long userId, String vehicleNumber, String phoneNumber) {
        this.userId = userId;
        this.vehicleNumber = vehicleNumber;
        this.phoneNumber = phoneNumber;
        this.available = true;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getVehicleNumber() {
        return vehicleNumber;
    }
    
    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public Boolean getAvailable() {
        return available;
    }
    
    public void setAvailable(Boolean available) {
        this.available = available;
    }
}

