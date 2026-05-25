package com.sailconnect.service;

import com.sailconnect.model.Booking;
import com.sailconnect.repository.BookingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepo;

    public BookingService(BookingRepository bookingRepo) {
        this.bookingRepo = bookingRepo;
    }

    public List<Booking> getAll(String userId) {
        if (userId != null && !userId.isBlank()) {
            return bookingRepo.findByUserId(userId);
        }
        return bookingRepo.findAll();
    }

    public Booking getById(String id) {
        return bookingRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    public Booking create(Booking booking) {
        return bookingRepo.save(booking);
    }

    public Booking update(String id, Booking patch) {
        Booking booking = getById(id);
        if (patch.getContactName() != null) booking.setContactName(patch.getContactName());
        if (patch.getContactEmail() != null) booking.setContactEmail(patch.getContactEmail());
        if (patch.getSeats() > 0) booking.setSeats(patch.getSeats());
        return bookingRepo.save(booking);
    }

    public void delete(String id) {
        if (!bookingRepo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        bookingRepo.deleteById(id);
    }
}
