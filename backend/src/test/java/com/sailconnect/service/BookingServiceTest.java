package com.sailconnect.service;

import com.sailconnect.model.Booking;
import com.sailconnect.model.Trip;
import com.sailconnect.repository.BookingRepository;
import com.sailconnect.repository.TripRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    BookingRepository bookingRepo;

    @Mock
    TripRepository tripRepo;

    @InjectMocks
    BookingService bookingService;

    private Booking booking;
    private Trip    trip;

    @BeforeEach
    void setUp() {
        booking = new Booking();
        booking.setId("b1");
        booking.setTripId("t1");
        booking.setCreatedAt("2026-01-01T10:00:00Z");
        booking.setSeats(2);
        booking.setContactName("Efka");
        booking.setContactEmail("efka@email.cz");
        booking.setUserId("u1");

        trip = new Trip();
        trip.setId("t1");
        trip.setTitle("Testovací plavba");
        trip.setCapacity(10);
        trip.setBooked(3);
    }

    // ── getAll ────────────────────────────────────────────────────────────────

    @Test
    void getAll_bezUserId_vratiVsechny() {
        when(bookingRepo.findAll()).thenReturn(List.of(booking));

        List<Booking> result = bookingService.getAll(null);

        assertThat(result).hasSize(1);
        verify(bookingRepo).findAll();
        verify(bookingRepo, never()).findByUserId(any());
    }

    @Test
    void getAll_sUserId_filtrujePodleUzivatele() {
        when(bookingRepo.findByUserId("u1")).thenReturn(List.of(booking));

        List<Booking> result = bookingService.getAll("u1");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUserId()).isEqualTo("u1");
        verify(bookingRepo).findByUserId("u1");
        verify(bookingRepo, never()).findAll();
    }

    // ── getById ───────────────────────────────────────────────────────────────

    @Test
    void getById_nalezena_vratiBooking() {
        when(bookingRepo.findById("b1")).thenReturn(Optional.of(booking));

        Booking result = bookingService.getById("b1");

        assertThat(result.getId()).isEqualTo("b1");
        assertThat(result.getSeats()).isEqualTo(2);
    }

    @Test
    void getById_nenalezena_hodi404() {
        when(bookingRepo.findById("neexistuje")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.getById("neexistuje"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    // ── create ────────────────────────────────────────────────────────────────

    @Test
    void create_dostupnaMista_uloziiAktualizujeBooked() {
        when(tripRepo.findById("t1")).thenReturn(Optional.of(trip));          // 10-3=7 volných
        when(bookingRepo.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        Booking result = bookingService.create(booking);   // seats=2

        assertThat(result.getSeats()).isEqualTo(2);
        assertThat(trip.getBooked()).isEqualTo(5);          // 3+2
        verify(tripRepo).save(trip);
        verify(bookingRepo).save(booking);
    }

    @Test
    void create_nedostaMist_hodi409() {
        trip.setBooked(9);  // zbývá 1 místo, ale booking.seats=2
        when(tripRepo.findById("t1")).thenReturn(Optional.of(trip));

        assertThatThrownBy(() -> bookingService.create(booking))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.CONFLICT);

        verify(bookingRepo, never()).save(any());
    }

    @Test
    void create_plavbaNeexistuje_hodi404() {
        when(tripRepo.findById("t1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.create(booking))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);

        verify(bookingRepo, never()).save(any());
    }

    // ── update ────────────────────────────────────────────────────────────────

    @Test
    void update_zmenaSeats_aktualizujeBooked() {
        Booking patch = new Booking();
        patch.setSeats(4);  // bylo 2, diff=+2

        when(bookingRepo.findById("b1")).thenReturn(Optional.of(booking));
        when(tripRepo.findById("t1")).thenReturn(Optional.of(trip));          // 10-3=7 volných
        when(bookingRepo.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        Booking result = bookingService.update("b1", patch);

        assertThat(result.getSeats()).isEqualTo(4);
        assertThat(trip.getBooked()).isEqualTo(5);   // 3+2
        verify(tripRepo).save(trip);
    }

    @Test
    void update_aktualizujeKontaktniUdaje() {
        Booking patch = new Booking();
        patch.setContactName("Nové jméno");
        patch.setContactEmail("nove@email.cz");
        // seats = 0 → nebude se měnit

        when(bookingRepo.findById("b1")).thenReturn(Optional.of(booking));
        when(bookingRepo.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        Booking result = bookingService.update("b1", patch);

        assertThat(result.getContactName()).isEqualTo("Nové jméno");
        assertThat(result.getContactEmail()).isEqualTo("nove@email.cz");
        assertThat(result.getSeats()).isEqualTo(2);   // beze změny
        verify(tripRepo, never()).findById(any());     // trip se nenačítal
    }

    @Test
    void update_seats0_neprepisujeSeats() {
        Booking patch = new Booking();
        patch.setContactName("Nové jméno");
        patch.setSeats(0);

        when(bookingRepo.findById("b1")).thenReturn(Optional.of(booking));
        when(bookingRepo.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        Booking result = bookingService.update("b1", patch);

        assertThat(result.getSeats()).isEqualTo(2);
    }

    // ── delete ────────────────────────────────────────────────────────────────

    @Test
    void delete_existujiciRezervace_smazeAUvolniMista() {
        when(bookingRepo.findById("b1")).thenReturn(Optional.of(booking));
        when(tripRepo.findById("t1")).thenReturn(Optional.of(trip));

        bookingService.delete("b1");

        assertThat(trip.getBooked()).isEqualTo(1);   // 3-2
        verify(tripRepo).save(trip);
        verify(bookingRepo).deleteById("b1");
    }

    @Test
    void delete_neexistujiciRezervace_hodi404() {
        when(bookingRepo.findById("neexistuje")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.delete("neexistuje"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);

        verify(bookingRepo, never()).deleteById(any());
    }
}
