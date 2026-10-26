package com.quickbite.repository;

import com.quickbite.model.FoodOrder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FoodOrderRepository
        extends JpaRepository<FoodOrder, Long> {
}