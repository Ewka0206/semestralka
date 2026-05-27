package com.sailconnect.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

/**
 * Konfigurace SpringDoc OpenAPI (Swagger UI).
 *
 * <p>Swagger UI je dostupné na: <a href="http://localhost:8080/swagger-ui.html">/swagger-ui.html</a>
 * <br>OpenAPI JSON spec na: <a href="http://localhost:8080/v3/api-docs">/v3/api-docs</a>
 *
 * <p>Pro testování chráněných endpointů klikněte na tlačítko <b>Authorize</b>
 * a vložte token ve formátu {@code Bearer <váš_token>}.
 * Token získáte voláním {@code POST /api/auth/login}.
 */
@Configuration
@OpenAPIDefinition(
    info = @Info(
        title       = "SailConnect REST API",
        version     = "1.0",
        description = "REST API pro aplikaci SailConnect – propojení námořních kapitánů a posádky. "
                    + "Chráněné endpointy vyžadují JWT token (Bearer auth).",
        contact     = @Contact(name = "Eva Kratěnová")
    ),
    servers = @Server(url = "http://localhost:8080", description = "Lokální vývojový server")
)
@SecurityScheme(
    name        = "bearerAuth",
    type        = SecuritySchemeType.HTTP,
    scheme      = "bearer",
    bearerFormat = "JWT",
    description = "Vložte JWT token získaný z POST /api/auth/login"
)
public class OpenApiConfig {
}
