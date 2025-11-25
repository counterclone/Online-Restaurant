package com.ofos.services;

import com.ofos.models.DeliveryAgent;
import com.ofos.models.Order;
import com.ofos.repository.DeliveryAgentRepository;
import com.ofos.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DeliveryService {
    
    @Autowired
    private DeliveryAgentRepository deliveryAgentRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    public List<DeliveryAgent> getAllDeliveryAgents() {
        return deliveryAgentRepository.findAll();
    }
    
    public List<DeliveryAgent> getAvailableDeliveryAgents() {
        return deliveryAgentRepository.findByAvailable(true);
    }
    
    public Optional<DeliveryAgent> getDeliveryAgentById(Long id) {
        return deliveryAgentRepository.findById(id);
    }
    
    public Optional<DeliveryAgent> getDeliveryAgentByUserId(Long userId) {
        return deliveryAgentRepository.findByUserId(userId);
    }
    
    public DeliveryAgent createDeliveryAgent(DeliveryAgent deliveryAgent) {
        return deliveryAgentRepository.save(deliveryAgent);
    }
    
    public DeliveryAgent updateDeliveryAgent(Long id, DeliveryAgent deliveryAgentDetails) {
        DeliveryAgent deliveryAgent = deliveryAgentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery agent not found"));
        
        deliveryAgent.setVehicleNumber(deliveryAgentDetails.getVehicleNumber());
        deliveryAgent.setPhoneNumber(deliveryAgentDetails.getPhoneNumber());
        deliveryAgent.setAvailable(deliveryAgentDetails.getAvailable());
        
        return deliveryAgentRepository.save(deliveryAgent);
    }
    
    public List<Order> getAssignedOrders(Long deliveryAgentId) {
        return orderRepository.findByDeliveryAgentId(deliveryAgentId);
    }
    
    public List<Order> getPendingOrders() {
        return orderRepository.findByStatus("CONFIRMED");
    }
}

