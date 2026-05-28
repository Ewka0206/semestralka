package com.sailconnect.controller;

import com.sailconnect.model.Country;
import com.sailconnect.repository.CountryRepository;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/countries")
public class CountryController {

    private final CountryRepository repo;

    public CountryController(CountryRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Country> getAll() {
        return repo.findAll(Sort.by("name"));
    }
}
