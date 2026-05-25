package com.sailconnect.controller;

import com.sailconnect.model.TripTypeDef;
import com.sailconnect.repository.TripTypeDefRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trip-types")
public class TripTypeController {

    private final TripTypeDefRepository repo;

    public TripTypeController(TripTypeDefRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<TripTypeDef> getAll() {
        return repo.findAll();
    }
}