package com.quickbite.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.quickbite.model.FoodOrder;
import com.quickbite.repository.FoodOrderRepository;

@Service
public class OrderService {

    private final FoodOrderRepository repository;

    public OrderService(FoodOrderRepository repository) {
        this.repository = repository;
    }

    public List<FoodOrder> getAllOrders() {
        return repository.findAll();
    }

    public FoodOrder createOrder(FoodOrder order) {

        LocalDateTime now = LocalDateTime.now();

        Duration duration =
              Duration.between(now, LocalDateTime.parse(order.getPickupTime()));

        if (duration.toMinutes() < 30) {
            throw new RuntimeException(
                "Pickup time must be at least 30 minutes from now"
            );
        }

        order.setStatus("BOOKED");

        return repository.save(order);
    }
    public FoodOrder updateOrderStatus(Long id, String status) {
    FoodOrder order = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found"));

    String currentStatus = order.getStatus();

    boolean validTransition =
            ("BOOKED".equals(currentStatus) && "PREPARING".equals(status))
            || ("PREPARING".equals(currentStatus) && "READY".equals(status))
            || ("READY".equals(currentStatus) && "COLLECTED".equals(status));

    if (!validTransition) {
        throw new RuntimeException(
                "Invalid status transition: "
                + currentStatus + " to " + status);
    }

    order.setStatus(status);
    return repository.save(order);
    }

}