package com.sailconnect.controller;

import com.sailconnect.model.Booking;
import com.sailconnect.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public List<Booking> getAll(@RequestHeader(value = "X-User-Id", required = false) String userId) {
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
            @RequestHeader(value = "X-User-Id", required = false) String userId
    ) {
        if (userId != null && booking.getUserId() == null) {
            booking.setUserId(userId);
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
