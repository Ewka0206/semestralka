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
     * Složený vyhledávací dotaz se stránkováním – prohledává více polí a filtruje dostupné plavby.
     *
     * <p>Nativní SQL dotaz kombinující:
     * <ul>
     *   <li>Full-text vyhledávání (LIKE) přes sloupce {@code title}, {@code location}, {@code country}.</li>
     *   <li>Filtrování dle typu plavby (prázdný řetězec = bez filtru).</li>
     *   <li>Pouze plavby s alespoň jedním volným místem ({@code capacity > booked}).</li>
     *   <li>Výsledky seřazené vzestupně dle data zahájení.</li>
     *   <li>Stránkování přes {@link Pageable} – {@code page} (od 0) a {@code size}.</li>
     * </ul>
     *
     * @param keyword  hledaný výraz nebo prázdný řetězec (ignoruje filtr)
     * @param type     typ plavby jako uppercase string ("RELAX", "TRAINING", "ADVENTURE")
     *                 nebo prázdný řetězec (ignoruje filtr)
     * @param pageable stránkovací parametry
     * @return stránka dostupných plaveb splňujících kritéria
     */
    @Query(
        value = """
            SELECT * FROM trips
            WHERE (:keyword = ''
                   OR LOWER(title)    LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(location) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(country)  LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:type = '' OR type = :type)
              AND capacity > booked
            ORDER BY start_date ASC
            """,
        countQuery = """
            SELECT COUNT(*) FROM trips
            WHERE (:keyword = ''
                   OR LOWER(title)    LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(location) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(country)  LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:type = '' OR type = :type)
              AND capacity > booked
            """,
        nativeQuery = true)
    Page<Trip> searchAvailable(@Param("keyword") String keyword,
                               @Param("type")    String type,
                               Pageable pageable);
}
