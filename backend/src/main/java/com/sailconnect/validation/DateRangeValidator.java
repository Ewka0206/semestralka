package com.sailconnect.validation;

import com.sailconnect.dto.TripRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;

/**
 * Implementace validátoru pro anotaci {@link ValidDateRange}.
 *
 * <p>Ověřuje, že pole {@code endDate} v {@link TripRequest} není dřívější
 * než pole {@code startDate}. Obě data musí být ve formátu {@code YYYY-MM-DD}.
 *
 * <p>Pokud je jedno z dat null nebo prázdné, validátor datum neposuzuje
 * (tuto povinnost zajistí {@code @NotBlank} na jednotlivých polích).
 */
public class DateRangeValidator implements ConstraintValidator<ValidDateRange, TripRequest> {

    /**
     * Ověří, že {@code endDate >= startDate}.
     *
     * @param req     validovaný DTO objekt plavby
     * @param context kontext validátoru (pro přidání vlastní chybové zprávy)
     * @return {@code true} pokud je rozsah dat platný, jinak {@code false}
     */
    @Override
    public boolean isValid(TripRequest req, ConstraintValidatorContext context) {
        if (req == null) return true;

        String startStr = req.startDate();
        String endStr   = req.endDate();

        // Pokud chybí data, necháme je validovat přes @NotBlank
        if (startStr == null || startStr.isBlank() || endStr == null || endStr.isBlank()) {
            return true;
        }

        try {
            LocalDate start = LocalDate.parse(startStr);
            LocalDate end   = LocalDate.parse(endStr);

            if (end.isBefore(start)) {
                // Přidáme chybovou zprávu přímo na pole endDate místo na celý objekt
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate(
                        "Datum ukončení musí být stejné nebo pozdější než datum zahájení"
                ).addPropertyNode("endDate").addConstraintViolation();
                return false;
            }
            return true;

        } catch (DateTimeParseException e) {
            // Neplatný formát data – necháme projít, @NotBlank nebo jiný validátor to zachytí
            return true;
        }
    }
}
