package com.sailconnect.dto;

import com.sailconnect.model.TripType;
import com.sailconnect.validation.ValidDateRange;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * DTO pro vytvoření nové plavby.
 *
 * <p>Obsahuje validační pravidla aplikovaná před předáním do service vrstvy:
 * <ul>
 *   <li>{@code title} – povinný, nesmí být prázdný</li>
 *   <li>{@code location} – povinný, nesmí být prázdný</li>
 *   <li>{@code type} – povinný typ plavby (RELAX, TRAINING, ADVENTURE)</li>
 *   <li>{@code startDate} / {@code endDate} – povinná data ve formátu YYYY-MM-DD</li>
 *   <li>{@code priceCzk} – nesmí být záporný</li>
 *   <li>{@code capacity} – minimálně 1 místo</li>
 * </ul>
 */
@ValidDateRange
public record TripRequest(

        @NotBlank(message = "Název plavby je povinný")
        String title,

        @NotBlank(message = "Místo odjezdu je povinné")
        String location,

        String country,

        @NotNull(message = "Typ plavby je povinný (RELAX, TRAINING, ADVENTURE)")
        TripType type,

        @NotBlank(message = "Datum zahájení je povinné (formát YYYY-MM-DD)")
        String startDate,

        @NotBlank(message = "Datum ukončení je povinné (formát YYYY-MM-DD)")
        String endDate,

        @Min(value = 0, message = "Cena nesmí být záporná")
        int priceCzk,

        @Min(value = 1, message = "Kapacita musí být alespoň 1")
        int capacity,

        int booked,

        boolean skipperIncluded,

        List<String> highlights,

        String description,

        String imageUrl,

        /** Vlastník – pokud je null, nastaví se ze JWT tokenu v controlleru. */
        String ownerUserId
) {}
