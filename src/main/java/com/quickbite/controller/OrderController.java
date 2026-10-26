
package com.quickbite.controller;

import com.quickbite.model.FoodOrder;
import com.quickbite.repository.FoodOrderRepository;
import com.quickbite.service.OrderService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final FoodOrderRepository repository;
    private final OrderService orderService;

    public OrderController(
            FoodOrderRepository repository,
            OrderService orderService) {
        this.repository = repository;
        this.orderService = orderService;
    }

    @GetMapping
    public List<FoodOrder> getOrders() {
        return repository.findAll();
    }

    @PostMapping
    public FoodOrder createOrder(
            @RequestBody FoodOrder order) {
        return orderService.createOrder(order);
    }

    @PutMapping("/{id}/preparing")
    public FoodOrder markPreparing(
            @PathVariable Long id) {
        return orderService.updateOrderStatus(id, "PREPARING");
    }

    @PutMapping("/{id}/ready")
    public FoodOrder markReady(
            @PathVariable Long id) {
        return orderService.updateOrderStatus(id, "READY");
    }

    @PutMapping("/{id}/collected")
    public FoodOrder markCollected(
            @PathVariable Long id) {
        return orderService.updateOrderStatus(id, "COLLECTED");
    }
}
