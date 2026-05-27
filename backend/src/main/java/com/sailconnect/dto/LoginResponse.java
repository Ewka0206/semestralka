package com.sailconnect.dto;

/**
 * Odpověď na úspěšné přihlášení nebo registraci.
 *
 * <p>Obsahuje JWT token, který je nutné přikládat k chráněným požadavkům
 * v hlavičce {@code Authorization: Bearer <token>}.
 */
public record LoginResponse(
        /** JWT Bearer token platný 24 hodin. */
        String token,
        String id,
        String email,
        String name,
        String role,
        String createdAt,
        String updatedAt
) {
    /** Vytvoří LoginResponse z UserResponse a vygenerovaného tokenu. */
    public static LoginResponse from(UserResponse user, String token) {
        return new LoginResponse(
                token,
                user.id(),
                user.email(),
                user.name(),
                user.role(),
                user.createdAt(),
                user.updatedAt()
        );
    }
}
