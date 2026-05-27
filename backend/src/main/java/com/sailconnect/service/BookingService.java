package com.sailconnect.service;

import com.sailconnect.model.Booking;
import com.sailconnect.repository.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/** Business logika pro správu rezervací plaveb. */
@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    private final BookingRepository bookingRepo;

    public BookingService(BookingRepository bookingRepo) {
        this.bookingRepo = bookingRepo;
    }

    /** Vrátí rezervace – všechny nebo pouze pro daného uživatele. */
    public List<Booking> getAll(String userId) {
        if (userId != null && !userId.isBlank()) {
            log.debug("Načítám rezervace pro userId={}", userId);
            return bookingRepo.findByUserId(userId);
        }
        log.debug("Načítám všechny rezervace");
        return bookingRepo.findAll();
    }

    /** Vrátí rezervaci podle ID nebo vyhodí 404. */
    public Booking getById(String id) {
        log.debug("Načítám rezervaci id={}", id);
        return bookingRepo.findById(id)
                .orElseThrow(() -> {
                    log.warn("Rezervace nenalezena: id={}", id);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND);
                });
    }

    /** Vytvoří novou rezervaci. */
    public Booking create(Booking booking) {
        Booking saved = bookingRepo.save(booking);
        log.info("Nová rezervace: id={}, tripId={}, userId={}, seats={}",
                saved.getId(), saved.getTripId(), saved.getUserId(), saved.getSeats());
        return saved;
    }

    /** Částečně aktualizuje rezervaci (null pole se ignorují). */
    public Booking update(String id, Booking patch) {
        Booking booking = getById(id);
        if (patch.getContactName()  != null) booking.setContactName(patch.getContactName());
        if (patch.getContactEmail() != null) booking.setContactEmail(patch.getContactEmail());
        if (patch.getSeats() > 0)            booking.setSeats(patch.getSeats());
        log.info("Rezervace aktualizována: id={}", id);
        return bookingRepo.save(booking);
    }

    /** Zruší rezervaci nebo vyhodí 404. */
    public void delete(String id) {
        if (!bookingRepo.existsById(id)) {
            log.warn("Pokus o zrušení neexistující rezervace: id={}", id);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        bookingRepo.deleteById(id);
        log.info("Rezervace zrušena: id={}", id);
    }
}
