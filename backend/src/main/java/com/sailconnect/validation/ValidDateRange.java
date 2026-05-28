package com.sailconnect.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Vlastní validační anotace pro ověření, že datum ukončení plavby
 * není dřívější než datum zahájení.
 *
 * <p>Používá se na úrovni třídy (typ DTO), protože porovnává dvě pole najednou.
 * Validátor je implementován ve třídě {@link DateRangeValidator}.
 *
 * <p>Příklad použití:
 * <pre>{@code
 * @ValidDateRange
 * public record TripRequest(String startDate, String endDate, ...) {}
 * }</pre>
 */
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = DateRangeValidator.class)
@Documented
public @interface ValidDateRange {

    String message() default "Datum ukončení musí být stejné nebo pozdější než datum zahájení";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
