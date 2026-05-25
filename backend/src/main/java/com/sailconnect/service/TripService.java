package com.sailconnect.service;

import com.sailconnect.model.Trip;
import com.sailconnect.repository.TripRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TripService {

    private final TripRepository tripRepo;

    public TripService(TripRepository tripRepo) {
        this.tripRepo = tripRepo;
    }

    public List<Trip> getAll(String owner) {
        if (owner != null && !owner.isBlank()) {
            return tripRepo.findByOwnerUserId(owner);
        }
        return tripRepo.findAll();
    }

    public Trip getById(String id) {
        return tripRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    public Trip create(Trip trip) {
        return tripRepo.save(trip);
    }

    public Trip update(String id, Trip patch) {
        Trip trip = getById(id);
        if (patch.getTitle() != null) trip.setTitle(patch.getTitle());
        if (patch.getLocation() != null) trip.setLocation(patch.getLocation());
        if (patch.getCountry() != null) trip.setCountry(patch.getCountry());
        if (patch.getType() != null) trip.setType(patch.getType());
        if (patch.getStartDate() != null) trip.setStartDate(patch.getStartDate());
        if (patch.getEndDate() != null) trip.setEndDate(patch.getEndDate());
        trip.setPriceCzk(patch.getPriceCzk());
        trip.setCapacity(patch.getCapacity());
        trip.setBooked(patch.getBooked());
        trip.setSkipperIncluded(patch.isSkipperIncluded());
        if (patch.getHighlights() != null) trip.setHighlights(patch.getHighlights());
        if (patch.getDescription() != null) trip.setDescription(patch.getDescription());
        if (patch.getImageUrl() != null) trip.setImageUrl(patch.getImageUrl());
        return tripRepo.save(trip);
    }

    public void delete(String id) {
        if (!tripRepo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        tripRepo.deleteById(id);
    }
}
