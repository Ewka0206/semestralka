package com.sailconnect.controller;

import com.sailconnect.model.TripTypeDef;
import com.sailconnect.repository.TripTypeDefRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trip-types")
@Tag(name = "Číselníky", description = "Číselníky – typy plaveb a státy světa")
public class TripTypeController {

    private final TripTypeDefRepository repo;

    public TripTypeController(TripTypeDefRepository repo) {
        this.repo = repo;
    }

    @Operation(
        summary     = "Seznam typů plaveb",
        description = "Vrátí všechny dostupné typy plaveb z databáze. "
                    + "Každá položka obsahuje `code` (RELAX, TRAINING, ADVENTURE) a `label` (český název)."
    )
    @ApiResponse(responseCode = "200", description = "Pole typů plaveb")
    @GetMapping
    public List<TripTypeDef> getAll() {
        return repo.findAll();
    }
}
