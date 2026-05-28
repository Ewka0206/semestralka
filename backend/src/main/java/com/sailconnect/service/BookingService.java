package com.sailconnect.service;

import com.sailconnect.model.Booking;
import com.sailconnect.model.Trip;
import com.sailconnect.repository.BookingRepository;
import com.sailconnect.repository.TripRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * Business logika pro správu rezervací plaveb.
 *
 * <p>Poskytuje CRUD operace nad entitou {@link Booking}.
 * Ke každé operaci je přiloženo logování na příslušné úrovni (debug/info/warn).
 * Při vytvoření i zrušení rezervace se atomicky aktualizuje pole {@code booked}
 * na příslušné plavbě (entita {@link Trip}).
 *
 * <p>Tato service se injectuje do {@code BookingController}, který zajišťuje
 * mapování HTTP požadavků a extrakci identity uživatele z JWT tokenu.
 */
@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    private final BookingRepository bookingRepo;
    private final TripRepository    tripRepo;

    public BookingService(BookingRepository bookingRepo, TripRepository tripRepo) {
        this.bookingRepo = bookingRepo;
        this.tripRepo    = tripRepo;
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
     * Upsert rezervace – pokud uživatel již má rezervaci na tuto plavbu,
     * aktualizuje počet míst; jinak vytvoří novou rezervaci.
     *
     * <p>Atomicky udržuje pole {@code trip.booked} – při navýšení míst přičte
     * rozdíl, při snížení odečte. Vždy ověří, zda je na plavbě dostatek kapacity.
     *
     * @param booking požadovaná rezervace (userId musí být vyplněno)
     * @return uložená (nová nebo aktualizovaná) rezervace
     * @throws ResponseStatusException HTTP 404, pokud plavba neexistuje
     * @throws ResponseStatusException HTTP 409, pokud není dostatek volných míst
     */
    @Transactional
    public Booking create(Booking booking) {
        Trip trip = tripRepo.findById(booking.getTripId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Plavba s id=" + booking.getTripId() + " neexistuje"));

        // ── Upsert: existuje už rezervace tohoto uživatele na tuto plavbu? ──
        if (booking.getUserId() != null) {
            var existing = bookingRepo.findByUserIdAndTripId(booking.getUserId(), booking.getTripId());
            if (existing.isPresent()) {
                Booking ex = existing.get();
                int diff = booking.getSeats() - ex.getSeats();
                if (diff != 0) {
                    int free = trip.getCapacity() - trip.getBooked();
                    if (diff > free) {
                        log.warn("Nedostatek míst při upsert: tripId={}, diff={}, volných={}",
                                booking.getTripId(), diff, free);
                        throw new ResponseStatusException(HttpStatus.CONFLICT,
                                "Na plavbě zbývá pouze " + free + " volné místo/míst.");
                    }
                    trip.setBooked(Math.max(0, trip.getBooked() + diff));
                    tripRepo.save(trip);
                    ex.setSeats(booking.getSeats());
                }
                Booking updated = bookingRepo.save(ex);
                log.info("Rezervace aktualizována (upsert): id={}, tripId={}, seats={}",
                        updated.getId(), updated.getTripId(), updated.getSeats());
                return updated;
            }
        }

        // ── Nová rezervace ──
        int free = trip.getCapacity() - trip.getBooked();
        if (booking.getSeats() > free) {
            log.warn("Nedostatek míst pro rezervaci: tripId={}, požadováno={}, volných={}",
                    booking.getTripId(), booking.getSeats(), free);
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Na plavbě zbývá pouze " + free + " volné místo/míst.");
        }

        trip.setBooked(trip.getBooked() + booking.getSeats());
        tripRepo.save(trip);

        Booking saved = bookingRepo.save(booking);
        log.info("Nová rezervace: id={}, tripId={}, userId={}, seats={}",
                saved.getId(), saved.getTripId(), saved.getUserId(), saved.getSeats());
        return saved;
    }

    /**
     * Aktualizuje existující rezervaci a atomicky opravuje počet obsazených míst
     * na plavbě, pokud se mění počet sedadel ({@code trip.booked += newSeats - oldSeats}).
     *
     * <p>Aplikuje tzv. partial-update strategii: pole {@code null} v objektu
     * {@code patch} se ignorují a ponechávají se původní hodnoty.
     * Výjimku tvoří pole {@code seats} – aktualizuje se pouze pokud je hodnota > 0.
     *
     * @param id    UUID rezervace, která se má aktualizovat
     * @param patch objekt s hodnotami pro aktualizaci (null pole se ignorují)
     * @return aktualizovaná a uložená rezervace
     * @throws ResponseStatusException HTTP 404, pokud rezervace nebo plavba neexistuje
     * @throws ResponseStatusException HTTP 409, pokud není dostatek volných míst
     */
    @Transactional
    public Booking update(String id, Booking patch) {
        Booking booking = getById(id);
        if (patch.getContactName()  != null) booking.setContactName(patch.getContactName());
        if (patch.getContactEmail() != null) booking.setContactEmail(patch.getContactEmail());

        if (patch.getSeats() > 0 && patch.getSeats() != booking.getSeats()) {
            int diff = patch.getSeats() - booking.getSeats();
            Trip trip = tripRepo.findById(booking.getTripId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Plavba s id=" + booking.getTripId() + " neexistuje"));

            int free = trip.getCapacity() - trip.getBooked();
            if (diff > free) {
                log.warn("Nedostatek míst při úpravě rezervace: id={}, diff={}, volných={}", id, diff, free);
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Na plavbě zbývá pouze " + free + " volné místo/míst.");
            }

            trip.setBooked(trip.getBooked() + diff);
            tripRepo.save(trip);
            booking.setSeats(patch.getSeats());
        }

        log.info("Rezervace aktualizována: id={}", id);
        return bookingRepo.save(booking);
    }

    /**
     * Zruší (smaže) rezervaci podle ID a atomicky vrátí uvolněná místa
     * zpět plavbě ({@code trip.booked -= seats}).
     *
     * @param id UUID rezervace ke zrušení
     * @throws ResponseStatusException HTTP 404, pokud rezervace neexistuje
     */
    @Transactional
    public void delete(String id) {
        Booking booking = bookingRepo.findById(id).orElseThrow(() -> {
            log.warn("Pokus o zrušení neexistující rezervace: id={}", id);
            return new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Rezervace s id=" + id + " neexistuje");
        });

        // Uvolni místa na plavbě
        tripRepo.findById(booking.getTripId()).ifPresent(trip -> {
            trip.setBooked(Math.max(0, trip.getBooked() - booking.getSeats()));
            tripRepo.save(trip);
        });

        bookingRepo.deleteById(id);
        log.info("Rezervace zrušena: id={}, uvolněno {} míst na plavbě {}",
                id, booking.getSeats(), booking.getTripId());
    }
}
