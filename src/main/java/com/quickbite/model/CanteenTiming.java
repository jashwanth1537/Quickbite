package com.quickbite.model;

import jakarta.persistence.*;

@Entity
@Table(name = "canteen_timings")
public class CanteenTiming {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String mealType;

    private String startTime;

    private String endTime;

    public CanteenTiming() {
    }

    public CanteenTiming(String mealType,
                         String startTime,
                         String endTime) {
        this.mealType = mealType;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public Long getId() {
        return id;
    }

    public String getMealType() {
        return mealType;
    }

    public void setMealType(String mealType) {
        this.mealType = mealType;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }
}