package com.sailconnect.exception;

import com.sailconnect.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.stream.Collectors;

/**
 * Centrální handler výjimek – zajišťuje konzistentní formát chybových odpovědí API.
 *
 * <p>Všechny odpovědi mají jednotnou strukturu {@link ErrorResponse}:
 * {@code { status, message, errors }}.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** Validační chyby Bean Validation (@Valid) – vrátí 400 s mapou chybných polí. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Neplatná hodnota",
                        (a, b) -> a
                ));
        log.warn("Validační chyba: {}", fieldErrors);
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(400, "Neplatné vstupní údaje.", fieldErrors));
    }

    /** Business výjimky s HTTP stavovým kódem (404, 401, 409 …). */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatus(ResponseStatusException ex) {
        int status = ex.getStatusCode().value();
        String message = ex.getReason() != null ? ex.getReason() : ex.getStatusCode().toString();
        if (status >= 500) {
            log.error("Serverová chyba {}: {}", status, message);
        } else if (status >= 400) {
            log.warn("Klientská chyba {}: {}", status, message);
        }
        return ResponseEntity.status(ex.getStatusCode())
                .body(ErrorResponse.of(status, message));
    }

    /** Neplatné argumenty (např. neznámá role) – vrátí 400. */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("IllegalArgument: {}", ex.getMessage());
        return ResponseEntity.badRequest()
                .body(ErrorResponse.of(400, ex.getMessage()));
    }

    /** Zachytí všechny ostatní neošetřené výjimky – vrátí 500. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        log.error("Neočekávaná chyba: {}", ex.getMessage(), ex);
        return ResponseEntity.internalServerError()
                .body(ErrorResponse.of(500, "Interní chyba serveru."));
    }
}
