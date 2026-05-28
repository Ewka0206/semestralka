package com.sailconnect.service;

import com.sailconnect.model.Booking;
import com.sailconnect.repository.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * Business logika pro správu rezervací plaveb.
 *
 * <p>Poskytuje CRUD operace nad entitou {@link Booking}.
 * Ke každé operaci je přiloženo logování na příslušné úrovni (debug/info/warn).
 *
 * <p>Tato service se injectuje do {@code BookingController}, který zajišťuje
 * mapování HTTP požadavků a extrakci identity uživatele z JWT tokenu.
 */
@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    private final BookingRepository bookingRepo;

    public BookingService(BookingRepository bookingRepo) {
        this.bookingRepo = bookingRepo;
    }

    /**
     * Vrátí rezervace filtrované podle přihlášeného uživatele.
     *
     * <p>Pokud je {@code userId} zadán (extrahován z JWT tokenu v controlleru),
     * vrátí pouze rezervace daného uživatele pomocí metody
     * {@link BookingRepository#findByUserId(String)}.
     * Bez {@code userId} (administrátorský pohled) vrátí všechny záznamy.
     *
     * @param userId UUID přihlášeného uživatele nebo {@code null}
     * @return seznam rezervací; nikdy {@code null}, může být prázdný
     */
    public List<Booking> getAll(String userId) {
        if (userId != null && !userId.isBlank()) {
            log.debug("Načítám rezervace pro userId={}", userId);
            return bookingRepo.findByUserId(userId);
        }
        log.debug("Načítám všechny rezervace");
        return bookingRepo.findAll();
    }

    /**
     * Vrátí rezervaci podle primárního klíče.
     *
     * @param id UUID rezervace
     * @return nalezená rezervace
     * @throws ResponseStatusException s HTTP 404, pokud rezervace neexistuje
     */
    public Booking getById(String id) {
        log.debug("Načítám rezervaci id={}", id);
        return bookingRepo.findById(id)
                .orElseThrow(() -> {
                    log.warn("Rezervace nenalezena: id={}", id);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Rezervace s id=" + id + " neexistuje");
                });
    }

    /**
     * Uloží novou rezervaci do databáze.
     *
     * <p>ID se generuje automaticky (UUID) před voláním {@code save()}.
     * Pole {@code userId} by mělo být nastaveno v controlleru z JWT tokenu
     * před předáním do této metody.
     *
     * @param booking nová rezervace (bez {@code id}, to se vygeneruje)
     * @return uložená rezervace včetně přiděleného {@code id}
     */
    public Booking create(Booking booking) {
        Booking saved = bookingRepo.save(booking);
        log.info("Nová rezervace: id={}, tripId={}, userId={}, seats={}",
                saved.getId(), saved.getTripId(), saved.getUserId(), saved.getSeats());
        return saved;
    }

    /**
     * Aktualizuje existující rezervaci.
     *
     * <p>Aplikuje tzv. partial-update strategii: pole {@code null} v objektu
     * {@code patch} se ignorují a ponechávají se původní hodnoty.
     * Výjimku tvoří pole {@code seats} – aktualizuje se pouze pokud je hodnota > 0.
     *
     * @param id    UUID rezervace, která se má aktualizovat
     * @param patch objekt s hodnotami pro aktualizaci (null pole se ignorují)
     * @return aktualizovaná a uložená rezervace
     * @throws ResponseStatusException s HTTP 404, pokud rezervace neexistuje
     */
    public Booking update(String id, Booking patch) {
        Booking booking = getById(id);
        if (patch.getContactName()  != null) booking.setContactName(patch.getContactName());
        if (patch.getContactEmail() != null) booking.setContactEmail(patch.getContactEmail());
        if (patch.getSeats() > 0)            booking.setSeats(patch.getSeats());
        log.info("Rezervace aktualizována: id={}", id);
        return bookingRepo.save(booking);
    }

    /**
     * Zruší (smaže) rezervaci podle ID.
     *
     * @param id UUID rezervace ke zrušení
     * @throws ResponseStatusException s HTTP 404, pokud rezervace neexistuje
     */
    public void delete(String id) {
        if (!bookingRepo.existsById(id)) {
            log.warn("Pokus o zrušení neexistující rezervace: id={}", id);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Rezervace s id=" + id + " neexistuje");
        }
        bookingRepo.deleteById(id);
        log.info("Rezervace zrušena: id={}", id);
    }
}
