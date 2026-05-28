package com.sailconnect.controller;

import com.sailconnect.dto.UpdateUserRequest;
import com.sailconnect.dto.UserResponse;
import com.sailconnect.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Uživatelé", description = "Správa uživatelských profilů")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final AuthService authService;

    public UserController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(summary = "Detail uživatele")
    @ApiResponse(responseCode = "200", description = "Profil uživatele")
    @ApiResponse(responseCode = "404", description = "Uživatel neexistuje")
    @GetMapping("/{id}")
    public UserResponse getUser(@PathVariable String id) {
        return authService.getUser(id);
    }

    @Operation(
        summary     = "Úprava profilu uživatele",
        description = "Aktualizuje jméno, email, heslo nebo roli. Pole s hodnotou null se ignorují."
    )
    @ApiResponse(responseCode = "200", description = "Profil aktualizován")
    @ApiResponse(responseCode = "400", description = "Neplatná vstupní data")
    @ApiResponse(responseCode = "404", description = "Uživatel neexistuje")
    @PutMapping("/{id}")
    public UserResponse updateUser(@PathVariable String id, @Valid @RequestBody UpdateUserRequest patch) {
        return authService.updateUser(id, patch);
    }
}
