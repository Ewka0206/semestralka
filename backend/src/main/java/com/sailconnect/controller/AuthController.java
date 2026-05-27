package com.sailconnect.controller;

import com.sailconnect.dto.LoginRequest;
import com.sailconnect.dto.LoginResponse;
import com.sailconnect.dto.RegisterRequest;
import com.sailconnect.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * Endpointy pro autentizaci uživatelů.
 *
 * <p>Po úspěšném přihlášení nebo registraci vrátí JWT token,
 * který je nutné přikládat ke chráněným požadavkům v hlavičce
 * {@code Authorization: Bearer <token>}.
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autentizace", description = "Registrace a přihlášení uživatelů")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(
        summary = "Přihlášení uživatele",
        description = "Ověří přihlašovací údaje a vrátí JWT token platný 24 hodin.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Přihlášení úspěšné – vrátí token a data uživatele",
                         content = @Content(schema = @Schema(implementation = LoginResponse.class))),
            @ApiResponse(responseCode = "400", description = "Chybějící nebo nevalidní vstupní data"),
            @ApiResponse(responseCode = "401", description = "Nesprávný e-mail nebo heslo")
        }
    )
    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @Operation(
        summary = "Registrace nového uživatele",
        description = "Vytvoří nový účet a okamžitě vrátí JWT token.",
        responses = {
            @ApiResponse(responseCode = "201", description = "Registrace úspěšná – vrátí token a data uživatele",
                         content = @Content(schema = @Schema(implementation = LoginResponse.class))),
            @ApiResponse(responseCode = "400", description = "Validační chyba vstupních dat"),
            @ApiResponse(responseCode = "409", description = "E-mail je již zaregistrován")
        }
    )
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public LoginResponse register(@Valid @RequestBody RegisterRequest req) {
        return authService.register(req);
    }
}
