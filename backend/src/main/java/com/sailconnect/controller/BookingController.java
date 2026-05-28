package com.sailconnect.controller;

import com.sailconnect.model.Booking;
import com.sailconnect.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller pro správu rezervací plaveb.
 *
 * <p>Všechny endpointy vyžadují platný JWT Bearer token.
 * Seznam rezervací {@code GET /api/bookings} vrací pouze záznamy
 * přihlášeného uživatele (userId extrahován z tokenu).
 */
@RestController
@RequestMapping("/api/bookings")
@Tag(name = "Rezervace", description = "Správa rezervací plaveb")
@SecurityRequirement(name = "bearerAuth")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @Operation(
        summary     = "Seznam rezervací přihlášeného uživatele",
        description = "Vrátí pouze rezervace aktuálně přihlášeného uživatele (userId z JWT tokenu)."
    )
    @ApiResponse(responseCode = "200", description = "Pole rezervací, může být prázdné")
    @GetMapping
    public List<Booking> getAll(Authentication auth) {
        String userId = (auth != null) ? auth.getName() : null;
        return bookingService.getAll(userId);
    }

    @Operation(summary = "Detail rezervace")
    @ApiResponse(responseCode = "200",  description = "Rezervace nalezena")
    @ApiResponse(responseCode = "404",  description = "Rezervace neexistuje")
    @GetMapping("/{id}")
    public Booking getById(@PathVariable String id) {
        return bookingService.getById(id);
    }

    @Operation(
        summary     = "Vytvoření nebo aktualizace rezervace (upsert)",
        description = "userId se vždy nastaví z JWT tokenu. " +
                      "Pokud uživatel již má rezervaci na tuto plavbu, aktualizuje ji místo vytvoření nové."
    )
    @ApiResponse(responseCode = "201", description = "Rezervace vytvořena nebo aktualizována")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Booking create(
            @RequestBody Booking booking,
            Authentication auth
    ) {
        // Vždy použij userId z JWT – zaručí správné párování při upsert
        if (auth != null) booking.setUserId(auth.getName());
        return bookingService.create(booking);
    }

    @Operation(summary = "Úprava rezervace (počet míst)")
    @ApiResponse(responseCode = "200", description = "Rezervace aktualizována")
    @ApiResponse(responseCode = "404", description = "Rezervace neexistuje")
    @PutMapping("/{id}")
    public Booking update(@PathVariable String id, @RequestBody Booking booking) {
        return bookingService.update(id, booking);
    }

    @Operation(summary = "Zrušení rezervace")
    @ApiResponse(responseCode = "204", description = "Rezervace zrušena")
    @ApiResponse(responseCode = "404", description = "Rezervace neexistuje")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        bookingService.delete(id);
    }
}
