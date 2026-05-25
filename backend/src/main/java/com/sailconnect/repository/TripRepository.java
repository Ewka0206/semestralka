package com.sailconnect.repository;

import com.sailconnect.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TripRepository extends JpaRepository<Trip, String> {
    List<Trip> findByOwnerUserId(String ownerUserId);
}
