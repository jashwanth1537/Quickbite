package com.quickbite.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quickbite.model.FoodItem;
import com.quickbite.service.FoodService;

@RestController
@RequestMapping("/api/food")
public class FoodController {

    private final FoodService service;

    public FoodController(FoodService service) {
        this.service = service;
    }

    @GetMapping
    public List<FoodItem> getAllFood() {
        return service.getAllFood();
    }

    @PostMapping
    public FoodItem addFood(@RequestBody FoodItem food) {
        return service.addFood(food);
    }
    @DeleteMapping("/{id}")
    public void deleteFood(@PathVariable Long id) {
        service.deleteFood(id);
    }
}