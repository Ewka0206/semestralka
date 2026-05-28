package com.sailconnect.service;

import com.sailconnect.dto.TripRequest;
import com.sailconnect.model.Trip;
import com.sailconnect.repository.TripRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

/**
 * Business logika pro správu nabídek plaveb.
 *
 * <p>Obsahuje standardní CRUD operace a pokročilé vyhledávání
 * přes {@link TripRepository#searchAvailable}.
 */
@Service
public class TripService {

    private static final Logger log = LoggerFactory.getLogger(TripService.class);

    private final TripRepository tripRepo;

    public TripService(TripRepository tripRepo) {
        this.tripRepo = tripRepo;
    }

    /** Vrátí všechny plavby, volitelně filtrované podle vlastníka. */
    public List<Trip> getAll(String owner) {
        if (owner != null && !owner.isBlank()) {
            log.debug("Načítám plavby pro ownerId={}", owner);
            return tripRepo.findByOwnerUserId(owner);
        }
        log.debug("Načítám všechny plavby");
        return tripRepo.findAll();
    }

    /**
     * Vyhledává dostupné plavby podle všech dostupných filtrů přímo v databázi.
     *
     * <p>Hledá v polích title, location a country. Vrací pouze plavby
     * s dostatečným počtem volných míst, seřazené podle data zahájení.
     *
     * @param keyword      hledaný výraz (null nebo prázdný = ignorovat)
     * @param typeStr      typ plavby jako string ("Training", "Relax", "Adventure") nebo null
     * @param country      přesný název státu nebo null/prázdný = bez filtru
     * @param dateFrom     datum zahájení od (YYYY-MM-DD) nebo null/prázdný = bez filtru
     * @param dateTo       datum zahájení do (YYYY-MM-DD) nebo null/prázdný = bez filtru
     * @param maxPrice     maximální cena v Kč; null nebo záporná = bez filtru
     * @param minFreeSpots minimální počet volných míst; null = 1 (alespoň jedno)
     * @param pageable     stránkovací parametry ({@code page} od 0, {@code size} počet na stránku)
     * @return stránka dostupných plaveb včetně metadat (totalElements, totalPages…)
     */
    public Page<Trip> search(String keyword, String typeStr,
                             String country, String dateFrom, String dateTo,
                             Integer maxPrice, Integer minFreeSpots,
                             Pageable pageable) {
        String kw      = (keyword == null) ? "" : keyword.trim();
        String type    = (typeStr == null  || typeStr.isBlank())  ? "" : typeStr.trim().toUpperCase();
        String ctr     = (country == null  || country.isBlank())  ? "" : country.trim();
        String from    = (dateFrom == null || dateFrom.isBlank()) ? "" : dateFrom.trim();
        String to      = (dateTo == null   || dateTo.isBlank())   ? "" : dateTo.trim();
        int    maxP    = (maxPrice == null    || maxPrice < 0)    ? -1 : maxPrice;
        int    minFree = (minFreeSpots == null || minFreeSpots < 1) ? 1 : minFreeSpots;

        log.info("Vyhledávání plaveb: keyword='{}', type={}, country='{}', od={}, do={}, maxCena={}, minVolnych={}, stránka {}/{}",
                kw, type, ctr, from, to, maxP, minFree, pageable.getPageNumber(), pageable.getPageSize());
        Page<Trip> results = tripRepo.searchAvailable(kw, type, ctr, from, to, maxP, minFree, pageable);
        log.debug("Nalezeno {} plaveb celkem, {} stránek",
                results.getTotalElements(), results.getTotalPages());
        return results;
    }

    /** Vrátí plavbu podle ID nebo vyhodí 404. */
    public Trip getById(String id) {
        log.debug("Načítám plavbu id={}", id);
        return tripRepo.findById(id)
                .orElseThrow(() -> {
                    log.warn("Plavba nenalezena: id={}", id);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND);
                });
    }

    /**
     * Vytvoří novou plavbu z validovaného {@link TripRequest} DTO.
     *
     * @param req     validovaná vstupní data plavby
     * @param ownerId ID vlastníka z JWT tokenu; pokud null, použije se hodnota z požadavku
     * @return uložená plavba
     */
    public Trip create(TripRequest req, String ownerId) {
        Trip trip = new Trip();
        trip.setTitle(req.title());
        trip.setLocation(req.location());
        trip.setCountry(req.country());
        trip.setType(req.type());
        trip.setStartDate(req.startDate());
        trip.setEndDate(req.endDate());
        trip.setPriceCzk(req.priceCzk());
        trip.setCapacity(req.capacity());
        trip.setBooked(req.booked());
        trip.setSkipperIncluded(req.skipperIncluded());
        trip.setHighlights(req.highlights() != null ? req.highlights() : new ArrayList<>());
        trip.setDescription(req.description());
        trip.setImageUrl(req.imageUrl());
        // JWT principal má prioritu před hodnotou z těla požadavku
        trip.setOwnerUserId(ownerId != null ? ownerId : req.ownerUserId());

        Trip saved = tripRepo.save(trip);
        log.info("Nová plavba vytvořena: id={}, title='{}', ownerId={}",
                saved.getId(), saved.getTitle(), saved.getOwnerUserId());
        return saved;
    }

    /** Částečně aktualizuje plavbu (null pole se ignorují). */
    public Trip update(String id, Trip patch) {
        Trip trip = getById(id);
        if (patch.getTitle()       != null) trip.setTitle(patch.getTitle());
        if (patch.getLocation()    != null) trip.setLocation(patch.getLocation());
        if (patch.getCountry()     != null) trip.setCountry(patch.getCountry());
        if (patch.getType()        != null) trip.setType(patch.getType());
        if (patch.getStartDate()   != null) trip.setStartDate(patch.getStartDate());
        if (patch.getEndDate()     != null) trip.setEndDate(patch.getEndDate());
        trip.setPriceCzk(patch.getPriceCzk());
        trip.setCapacity(patch.getCapacity());
        trip.setBooked(patch.getBooked());
        trip.setSkipperIncluded(patch.isSkipperIncluded());
        if (patch.getHighlights()  != null) trip.setHighlights(patch.getHighlights());
        if (patch.getDescription() != null) trip.setDescription(patch.getDescription());
        if (patch.getImageUrl()    != null) trip.setImageUrl(patch.getImageUrl());
        log.info("Plavba aktualizována: id={}", id);
        return tripRepo.save(trip);
    }

    /** Smaže plavbu nebo vyhodí 404, pokud neexistuje. */
    public void delete(String id) {
        if (!tripRepo.existsById(id)) {
            log.warn("Pokus o smazání neexistující plavby: id={}", id);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        tripRepo.deleteById(id);
        log.info("Plavba smazána: id={}", id);
    }
}
