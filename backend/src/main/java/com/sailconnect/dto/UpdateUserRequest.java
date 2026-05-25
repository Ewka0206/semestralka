package com.sailconnect.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        String name,

        @Email(message = "Neplatný formát e-mailu")
        String email,

        @Size(min = 6, message = "Heslo musí mít alespoň 6 znaků")
        String password,

        String role
) {}
