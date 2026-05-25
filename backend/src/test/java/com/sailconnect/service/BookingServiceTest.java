package com.sailconnect.service;

import com.sailconnect.model.Booking;
import com.sailconnect.repository.BookingRepository;
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

    @InjectMocks
    BookingService bookingService;

    private Booking booking;

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
    }

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

    @Test
    void update_aktualizujeKontaktniUdaje() {
        Booking patch = new Booking();
        patch.setContactName("Nové jméno");
        patch.setContactEmail("nove@email.cz");
        patch.setSeats(4);

        when(bookingRepo.findById("b1")).thenReturn(Optional.of(booking));
        when(bookingRepo.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        Booking result = bookingService.update("b1", patch);

        assertThat(result.getContactName()).isEqualTo("Nové jméno");
        assertThat(result.getContactEmail()).isEqualTo("nove@email.cz");
        assertThat(result.getSeats()).isEqualTo(4);
        verify(bookingRepo).save(booking);
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

    @Test
    void delete_existujiciRezervace_smaze() {
        when(bookingRepo.existsById("b1")).thenReturn(true);

        bookingService.delete("b1");

        verify(bookingRepo).deleteById("b1");
    }

    @Test
    void delete_neexistujiciRezervace_hodi404() {
        when(bookingRepo.existsById("neexistuje")).thenReturn(false);

        assertThatThrownBy(() -> bookingService.delete("neexistuje"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);

        verify(bookingRepo, never()).deleteById(any());
    }
}
