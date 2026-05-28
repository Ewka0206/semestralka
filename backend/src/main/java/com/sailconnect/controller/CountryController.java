package com.sailconnect.controller;

import com.sailconnect.model.Country;
import com.sailconnect.repository.CountryRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/countries")
@Tag(name = "Číselníky", description = "Číselníky – typy plaveb a státy světa")
public class CountryController {

    private final CountryRepository repo;

    public CountryController(CountryRepository repo) {
        this.repo = repo;
    }

    @Operation(
        summary     = "Seznam zemí světa",
        description = "Vrátí 190 zemí světa seřazených abecedně dle českého názvu. "
                    + "Každá položka obsahuje `code` (ISO 3166-1 alpha-2, např. CZ) a `name` (český název)."
    )
    @ApiResponse(responseCode = "200", description = "Abecedně seřazené pole zemí")
    @GetMapping
    public List<Country> getAll() {
        return repo.findAll(Sort.by("name"));
    }
}
