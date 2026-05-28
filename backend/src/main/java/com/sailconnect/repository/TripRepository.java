package com.sailconnect.repository;

import com.sailconnect.model.Trip;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Repozitář pro přístup k entitám {@link Trip}.
 *
 * <p>Rozšiřuje {@link JpaRepository} o vlastní dotazy pro filtrování a vyhledávání.
 */
public interface TripRepository extends JpaRepository<Trip, String> {

    /** Vrátí všechny plavby zadaného vlastníka. */
    List<Trip> findByOwnerUserId(String ownerUserId);

    /**
     * Složený vyhledávací dotaz se stránkováním – filtruje plavby přímo v databázi.
     *
     * <p>Nativní SQL dotaz kombinující:
     * <ul>
     *   <li>Full-text vyhledávání (LIKE) přes sloupce {@code title}, {@code location}, {@code country}.</li>
     *   <li>Filtrování dle typu plavby (prázdný řetězec = bez filtru).</li>
     *   <li>Filtrování dle státu – přesná shoda (prázdný řetězec = bez filtru).</li>
     *   <li>Filtrování dle rozsahu data zahájení {@code dateFrom}–{@code dateTo} (prázdný řetězec = bez filtru).</li>
     *   <li>Filtrování dle maximální ceny v Kč (záporná hodnota = bez filtru).</li>
     *   <li>Minimální počet volných míst {@code (capacity - booked) >= minFreeSpots}; výchozí 1.</li>
     *   <li>Výsledky seřazené vzestupně dle data zahájení.</li>
     * </ul>
     *
     * @param keyword      hledaný výraz nebo prázdný řetězec (ignoruje filtr)
     * @param type         typ plavby jako uppercase string ("RELAX", "TRAINING", "ADVENTURE")
     *                     nebo prázdný řetězec (ignoruje filtr)
     * @param country      přesný název státu nebo prázdný řetězec (ignoruje filtr)
     * @param dateFrom     nejdřívější datum zahájení (YYYY-MM-DD) nebo prázdný řetězec
     * @param dateTo       nejpozdější datum zahájení (YYYY-MM-DD) nebo prázdný řetězec
     * @param maxPrice     maximální cena v Kč; záporná hodnota = bez filtru
     * @param minFreeSpots minimální počet volných míst; výchozí 1 (=alespoň jedno volné místo)
     * @param pageable     stránkovací parametry
     * @return stránka dostupných plaveb splňujících kritéria
     */
    @Query(
        value = """
            SELECT * FROM trips
            WHERE (:keyword = ''
                   OR LOWER(title)    LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(location) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(country)  LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:type    = '' OR type    = :type)
              AND (:country = '' OR country = :country)
              AND (:dateFrom = '' OR start_date >= :dateFrom)
              AND (:dateTo   = '' OR start_date <= :dateTo)
              AND (:maxPrice < 0  OR price_czk  <= :maxPrice)
              AND (capacity - booked) >= :minFreeSpots
            ORDER BY start_date ASC
            """,
        countQuery = """
            SELECT COUNT(*) FROM trips
            WHERE (:keyword = ''
                   OR LOWER(title)    LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(location) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(country)  LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:type    = '' OR type    = :type)
              AND (:country = '' OR country = :country)
              AND (:dateFrom = '' OR start_date >= :dateFrom)
              AND (:dateTo   = '' OR start_date <= :dateTo)
              AND (:maxPrice < 0  OR price_czk  <= :maxPrice)
              AND (capacity - booked) >= :minFreeSpots
            """,
        nativeQuery = true)
    Page<Trip> searchAvailable(@Param("keyword")      String keyword,
                               @Param("type")         String type,
                               @Param("country")      String country,
                               @Param("dateFrom")     String dateFrom,
                               @Param("dateTo")       String dateTo,
                               @Param("maxPrice")     int maxPrice,
                               @Param("minFreeSpots") int minFreeSpots,
                               Pageable pageable);
}
