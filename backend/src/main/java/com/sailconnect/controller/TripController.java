package com.sailconnect.controller;

import com.sailconnect.model.Trip;
import com.sailconnect.service.TripService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @GetMapping
    public List<Trip> getAll(@RequestParam(required = false) String owner) {
        return tripService.getAll(owner);
    }

    @GetMapping("/{id}")
    public Trip getById(@PathVariable String id) {
        return tripService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Trip create(
            @RequestBody Trip trip,
            @RequestHeader(value = "X-User-Id", required = false) String userId
    ) {
        if (userId != null && trip.getOwnerUserId() == null) {
            trip.setOwnerUserId(userId);
        }
        return tripService.create(trip);
    }

    @PutMapping("/{id}")
    public Trip update(@PathVariable String id, @RequestBody Trip trip) {
        return tripService.update(id, trip);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        tripService.delete(id);
    }
}
