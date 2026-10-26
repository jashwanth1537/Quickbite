package com.quickbite.repository;

import com.quickbite.model.CanteenTiming;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CanteenTimingRepository
        extends JpaRepository<CanteenTiming, Long> {
}