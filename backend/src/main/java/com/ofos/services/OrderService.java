package com.ofos.services;

import com.ofos.models.Order;
import com.ofos.models.OrderItem;
import com.ofos.models.MenuItem;
import com.ofos.repository.OrderRepository;
import com.ofos.repository.OrderItemRepository;
import com.ofos.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Transactional
    public Order createOrder(Order order, List<OrderItemRequest> orderItems) {
        double totalAmount = 0;
        for (OrderItemRequest item : orderItems) {
            MenuItem menuItem = menuItemRepository.findById(item.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Menu item not found: " + item.getMenuItemId()));
            totalAmount += menuItem.getPrice() * item.getQuantity();
        }

        order.setTotalAmount(totalAmount);
        order.setFinalAmount(totalAmount);
        order.setStatus("CONFIRMED");
        if (order.getOrderDate() == null) {
            order.setOrderDate(java.time.LocalDateTime.now());
        }

        Order savedOrder = orderRepository.save(order);

        
        for (OrderItemRequest itemRequest : orderItems) {
            MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Menu item not found"));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setMenuItemId(menuItem.getId());
            orderItem.setMenuItemName(menuItem.getName());
            orderItem.setPrice(menuItem.getPrice());
            orderItem.setQuantity(itemRequest.getQuantity());

            orderItemRepository.save(orderItem);
        }

        return savedOrder;
    }

    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrdersByDeliveryAgent(Long deliveryAgentId) {
        return orderRepository.findByDeliveryAgentId(deliveryAgentId);
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public Order updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (("OUT_FOR_DELIVERY".equals(status) || "DELIVERED".equals(status))
                && order.getDeliveryAgentId() == null) {
            throw new RuntimeException("Cannot set order to " + status + " without assigning a delivery agent");
        }

        order.setStatus(status);
        return orderRepository.save(order);
    }

    public Order assignDeliveryAgent(Long orderId, Long deliveryAgentId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setDeliveryAgentId(deliveryAgentId);
        order.setStatus("OUT_FOR_DELIVERY");
        return orderRepository.save(order);
    }

    public List<OrderItem> getOrderItems(Long orderId) {
        return orderItemRepository.findByOrderId(orderId);
    }

    public static class OrderItemRequest {
        private Long menuItemId;
        private Integer quantity;

        public Long getMenuItemId() {
            return menuItemId;
        }

        public void setMenuItemId(Long menuItemId) {
            this.menuItemId = menuItemId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }
}
