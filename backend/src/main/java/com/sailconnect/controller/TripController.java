package com.sailconnect.controller;

import com.sailconnect.dto.TripRequest;
import com.sailconnect.model.Trip;
import com.sailconnect.service.TripService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller pro správu nabídek plaveb.
 *
 * <p>Veřejné endpointy (GET) nevyžadují autentizaci.
 * Endpointy pro zápis (POST, PUT) vyžadují platný JWT token.
 * Mazání (DELETE) vyžaduje roli CAPTAIN.
 */
@RestController
@RequestMapping("/api/trips")
@Tag(name = "Plavby", description = "Správa nabídek plaveb")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @Operation(summary = "Výpis všech plaveb", description = "Vrátí seznam plaveb, volitelně filtrovaný podle vlastníka.")
    @GetMapping
    public List<Trip> getAll(@RequestParam(required = false) String owner) {
        return tripService.getAll(owner);
    }

    @Operation(
        summary     = "Vyhledávání dostupných plaveb se stránkováním",
        description = "Filtruje plavby přímo v databázi. Vrací pouze plavby s dostatečným počtem " +
                      "volných míst, seřazené dle data zahájení. " +
                      "Odpověď obsahuje metadata stránkování (totalElements, totalPages, number, size)."
    )
    @GetMapping("/search")
    public Page<Trip> search(
            @Parameter(description = "Klíčové slovo (hledá v názvu, destinaci, státu)")
            @RequestParam(required = false) String q,
            @Parameter(description = "Typ plavby: TRAINING | ADVENTURE | RELAX")
            @RequestParam(required = false) String type,
            @Parameter(description = "Přesný název státu (např. Chorvatsko)")
            @RequestParam(required = false) String country,
            @Parameter(description = "Datum zahájení od (YYYY-MM-DD)")
            @RequestParam(required = false) String dateFrom,
            @Parameter(description = "Datum zahájení do (YYYY-MM-DD)")
            @RequestParam(required = false) String dateTo,
            @Parameter(description = "Maximální cena v Kč (-1 nebo vynechat = bez filtru)")
            @RequestParam(required = false) Integer maxPrice,
            @Parameter(description = "Minimální počet volných míst (výchozí 1)")
            @RequestParam(required = false) Integer minFreeSpots,
            @Parameter(description = "Číslo stránky (od 0, výchozí 0)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Počet výsledků na stránku (výchozí 200)")
            @RequestParam(defaultValue = "200") int size) {
        return tripService.search(q, type, country, dateFrom, dateTo, maxPrice, minFreeSpots,
                                  PageRequest.of(page, size));
    }

    @Operation(summary = "Detail plavby")
    @GetMapping("/{id}")
    public Trip getById(@PathVariable String id) {
        return tripService.getById(id);
    }

    @Operation(
        summary     = "Vytvoření nové plavby",
        description = "Povinná pole: title, location, type, startDate, endDate, capacity (≥1).",
        security    = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(responseCode = "201", description = "Plavba vytvořena")
    @ApiResponse(responseCode = "400", description = "Neplatná vstupní data – chybí povinné pole nebo špatný formát")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Trip create(@Valid @RequestBody TripRequest req, Authentication auth) {
        // Vlastník se nastaví ze SecurityContextu (JWT principal); fallback na hodnotu z těla požadavku
        String ownerId = (auth != null) ? (String) auth.getPrincipal() : null;
        return tripService.create(req, ownerId);
    }

    @Operation(summary = "Úprava plavby", security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/{id}")
    public Trip update(@PathVariable String id, @RequestBody Trip trip) {
        return tripService.update(id, trip);
    }

    @Operation(
        summary     = "Smazání plavby",
        description = "Vyžaduje roli CAPTAIN.",
        security    = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(responseCode = "204", description = "Plavba smazána")
    @ApiResponse(responseCode = "403", description = "Přístup odepřen – vyžadována role CAPTAIN")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        tripService.delete(id);
    }
}
