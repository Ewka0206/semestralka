package com.sailconnect.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "E-mail je povinný")
        @Email(message = "Neplatný formát e-mailu")
        String email,

        @NotBlank(message = "Heslo je povinné")
        String password
) {}
