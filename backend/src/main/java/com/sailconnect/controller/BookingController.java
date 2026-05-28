package com.sailconnect.controller;

import com.sailconnect.model.Booking;
import com.sailconnect.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /**
     * Vrátí rezervace přihlášeného uživatele (userId z JWT tokenu).
     * Kapitán (CAPTAIN) vidí všechny rezervace – userId bude null pouze
     * u neautentizovaných volání, která Security blokuje před dosažením controlleru.
     */
    @GetMapping
    public List<Booking> getAll(Authentication auth) {
        String userId = (auth != null) ? auth.getName() : null;
        return bookingService.getAll(userId);
    }

    @GetMapping("/{id}")
    public Booking getById(@PathVariable String id) {
        return bookingService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Booking create(
            @RequestBody Booking booking,
            Authentication auth
    ) {
        // Pokud userId není v těle requestu, doplníme z JWT tokenu
        if (auth != null && booking.getUserId() == null) {
            booking.setUserId(auth.getName());
        }
        return bookingService.create(booking);
    }

    @PutMapping("/{id}")
    public Booking update(@PathVariable String id, @RequestBody Booking booking) {
        return bookingService.update(id, booking);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        bookingService.delete(id);
    }
}
