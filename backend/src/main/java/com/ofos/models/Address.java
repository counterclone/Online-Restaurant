package com.ofos.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "addresses")
public class Address {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long userId;
    
    @NotBlank
    @Size(max = 255)
    @Column(nullable = false)
    private String street;
    
    @NotBlank
    @Size(max = 100)
    @Column(nullable = false)
    private String city;
    
    @NotBlank
    @Size(max = 100)
    @Column(nullable = false)
    private String state;
    
    @NotBlank
    @Size(max = 10)
    @Column(nullable = false)
    private String pincode;
    
    public Address() {
    }
    
    public Address(Long userId, String street, String city, String state, String pincode) {
        this.userId = userId;
        this.street = street;
        this.city = city;
        this.state = state;
        this.pincode = pincode;
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
    
    public String getStreet() {
        return street;
    }
    
    public void setStreet(String street) {
        this.street = street;
    }
    
    public String getCity() {
        return city;
    }
    
    public void setCity(String city) {
        this.city = city;
    }
    
    public String getState() {
        return state;
    }
    
    public void setState(String state) {
        this.state = state;
    }
    
    public String getPincode() {
        return pincode;
    }
    
    public void setPincode(String pincode) {
        this.pincode = pincode;
    }
}

