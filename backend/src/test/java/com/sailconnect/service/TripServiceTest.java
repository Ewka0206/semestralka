package com.sailconnect.service;

import com.sailconnect.dto.TripRequest;
import com.sailconnect.model.Trip;
import com.sailconnect.model.TripType;
import com.sailconnect.repository.TripRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TripServiceTest {

    @Mock
    TripRepository tripRepo;

    @InjectMocks
    TripService tripService;

    private Trip trip;

    @BeforeEach
    void setUp() {
        trip = new Trip();
        trip.setId("t1");
        trip.setTitle("Korfu – rekreace");
        trip.setLocation("Korfu");
        trip.setCountry("Řecko");
        trip.setType(TripType.RELAX);
        trip.setStartDate("2026-06-06");
        trip.setEndDate("2026-06-13");
        trip.setPriceCzk(17000);
        trip.setCapacity(8);
        trip.setOwnerUserId("u1");
    }

    @Test
    void getAll_bezOwner_vratiVsechny() {
        when(tripRepo.findAll()).thenReturn(List.of(trip));

        List<Trip> result = tripService.getAll(null);

        assertThat(result).hasSize(1);
        verify(tripRepo).findAll();
        verify(tripRepo, never()).findByOwnerUserId(any());
    }

    @Test
    void getAll_sOwner_filtrujePodleOwner() {
        when(tripRepo.findByOwnerUserId("u1")).thenReturn(List.of(trip));

        List<Trip> result = tripService.getAll("u1");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getOwnerUserId()).isEqualTo("u1");
        verify(tripRepo).findByOwnerUserId("u1");
        verify(tripRepo, never()).findAll();
    }

    @Test
    void getById_nalezeny_vratiTrip() {
        when(tripRepo.findById("t1")).thenReturn(Optional.of(trip));

        Trip result = tripService.getById("t1");

        assertThat(result.getId()).isEqualTo("t1");
        assertThat(result.getTitle()).isEqualTo("Korfu – rekreace");
    }

    @Test
    void getById_nenalezen_hodi404() {
        when(tripRepo.findById("neexistuje")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tripService.getById("neexistuje"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void search_sKeywordem_vratiStrankovanyVysledek() {
        Pageable pageable = PageRequest.of(0, 5);
        Page<Trip> page = new PageImpl<>(List.of(trip), pageable, 1);
        when(tripRepo.searchAvailable(eq("korfu"), eq("RELAX"), eq(pageable))).thenReturn(page);

        Page<Trip> result = tripService.search("korfu", "Relax", pageable);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getTotalPages()).isEqualTo(1);
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Korfu – rekreace");
        verify(tripRepo).searchAvailable("korfu", "RELAX", pageable);
    }

    @Test
    void search_prazdnyKeyword_pouzijePrazdnyRetezec() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Trip> emptyPage = Page.empty(pageable);
        when(tripRepo.searchAvailable(eq(""), eq(""), eq(pageable))).thenReturn(emptyPage);

        Page<Trip> result = tripService.search(null, null, pageable);

        assertThat(result.getTotalElements()).isEqualTo(0);
        verify(tripRepo).searchAvailable("", "", pageable);
    }

    @Test
    void create_novaPlavba_ulozisSpravnymOwnerem() {
        TripRequest req = new TripRequest(
                "Sicílie – sopky v moři", "Palermo", "Itálie",
                TripType.ADVENTURE, "2026-06-27", "2026-07-04",
                19500, 8, 0, true,
                java.util.List.of("Stromboli", "Aeolské ostrovy"), "Plavba kolem Sicílie.", null, null);

        when(tripRepo.save(any(Trip.class))).thenAnswer(inv -> {
            Trip t = inv.getArgument(0);
            t.setId("t-new");
            return t;
        });

        Trip result = tripService.create(req, "u1");

        assertThat(result.getId()).isEqualTo("t-new");
        assertThat(result.getTitle()).isEqualTo("Sicílie – sopky v moři");
        assertThat(result.getOwnerUserId()).isEqualTo("u1");
        assertThat(result.getType()).isEqualTo(TripType.ADVENTURE);
        verify(tripRepo).save(any(Trip.class));
    }

    @Test
    void create_ownerIdNull_pouzijezTela() {
        TripRequest req = new TripRequest(
                "Test", "Test", "CZ",
                TripType.RELAX, "2026-01-01", "2026-01-08",
                10000, 4, 0, false,
                null, null, null, "owner-from-body");

        when(tripRepo.save(any(Trip.class))).thenAnswer(inv -> inv.getArgument(0));

        Trip result = tripService.create(req, null);

        assertThat(result.getOwnerUserId()).isEqualTo("owner-from-body");
    }

    @Test
    void update_aktualizujeZmenenaPole() {
        Trip patch = new Trip();
        patch.setTitle("Nový název");
        patch.setLocation("Split");
        patch.setCountry("Chorvatsko");
        patch.setType(TripType.RELAX);
        patch.setStartDate("2026-07-01");
        patch.setEndDate("2026-07-08");
        patch.setPriceCzk(18000);
        patch.setCapacity(6);

        when(tripRepo.findById("t1")).thenReturn(Optional.of(trip));
        when(tripRepo.save(any(Trip.class))).thenAnswer(inv -> inv.getArgument(0));

        Trip result = tripService.update("t1", patch);

        assertThat(result.getTitle()).isEqualTo("Nový název");
        assertThat(result.getLocation()).isEqualTo("Split");
        assertThat(result.getPriceCzk()).isEqualTo(18000);
        verify(tripRepo).save(trip);
    }

    @Test
    void delete_existujiciTrip_smaze() {
        when(tripRepo.existsById("t1")).thenReturn(true);

        tripService.delete("t1");

        verify(tripRepo).deleteById("t1");
    }

    @Test
    void delete_neexistujiciTrip_hodi404() {
        when(tripRepo.existsById("neexistuje")).thenReturn(false);

        assertThatThrownBy(() -> tripService.delete("neexistuje"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);

        verify(tripRepo, never()).deleteById(any());
    }
}
