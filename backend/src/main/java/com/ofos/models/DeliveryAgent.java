package com.ofos.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
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

}
