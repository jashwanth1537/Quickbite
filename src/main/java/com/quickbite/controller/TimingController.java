package com.quickbite.controller;

import com.quickbite.model.CanteenTiming;
import com.quickbite.repository.CanteenTimingRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timings")
public class TimingController {

    private final CanteenTimingRepository repository;

    public TimingController(CanteenTimingRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<CanteenTiming> getTimings() {
        return repository.findAll();
    }

    @PostMapping
    public CanteenTiming addTiming(
            @RequestBody CanteenTiming timing) {

        return repository.save(timing);
    }
    @DeleteMapping("/{id}")
    public void deleteTiming(@PathVariable Long id) {
    repository.deleteById(id);
    }
}