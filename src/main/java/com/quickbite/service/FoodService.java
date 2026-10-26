package com.quickbite.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.quickbite.model.FoodItem;
import com.quickbite.repository.FoodItemRepository;

@Service
public class FoodService {

    private final FoodItemRepository repository;

    public FoodService(FoodItemRepository repository) {
        this.repository = repository;
    }

    public List<FoodItem> getAllFood() {
        return repository.findAll();
    }

    public FoodItem addFood(FoodItem food) {
        return repository.save(food);
    }
    public void deleteFood(Long id) {
        repository.deleteById(id);
    }
}