package com.sailconnect.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sailconnect.dto.ErrorResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Konfigurace Spring Security – stateless JWT ochrana endpointů.
 *
 * <h3>Pravidla přístupu:</h3>
 * <ul>
 *   <li>Veřejné (bez autentizace): POST /api/auth/**, GET /api/trips/**, GET /api/trip-types, Swagger UI, Actuator</li>
 *   <li>Pouze CAPTAIN: DELETE /api/trips/** (smazání nabídky)</li>
 *   <li>Jakýkoli přihlášený uživatel (CREW nebo CAPTAIN): vše ostatní</li>
 * </ul>
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final ObjectMapper objectMapper;

    public SecurityConfig(JwtFilter jwtFilter, ObjectMapper objectMapper) {
        this.jwtFilter = jwtFilter;
        this.objectMapper = objectMapper;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // JWT je stateless – zakázat CSRF a sessions
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // CORS – použije CorsConfigurationSource bean z CorsConfig
            .cors(cors -> {})

            // Vlastní 401 odpověď ve formátu ErrorResponse (místo Spring výchozí HTML stránky)
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(401);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setCharacterEncoding("UTF-8");
                    objectMapper.writeValue(response.getWriter(),
                            ErrorResponse.of(401, "Přístup odepřen – chybí nebo neplatný Bearer token."));
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(403);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setCharacterEncoding("UTF-8");
                    objectMapper.writeValue(response.getWriter(),
                            ErrorResponse.of(403, "Přístup odepřen – nedostatečná oprávnění (vyžadována role CAPTAIN)."));
                })
            )

            // Pravidla přístupu k endpointům
            .authorizeHttpRequests(auth -> auth

                // ── Veřejné endpointy ──────────────────────────────────────
                .requestMatchers(HttpMethod.POST,  "/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET,   "/api/trips/**").permitAll()
                .requestMatchers(HttpMethod.GET,   "/api/trip-types").permitAll()

                // Swagger UI + OpenAPI
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html",
                                 "/v3/api-docs/**").permitAll()

                // Spring Boot Actuator (health, metrics)
                .requestMatchers("/actuator/**").permitAll()

                // Statické obrázky
                .requestMatchers("/images/**").permitAll()

                // ── Pouze CAPTAIN ──────────────────────────────────────────
                // Jen kapitáni mohou mazat plavby
                .requestMatchers(HttpMethod.DELETE, "/api/trips/**").hasRole("CAPTAIN")

                // ── Jakýkoli přihlášený uživatel ───────────────────────────
                .anyRequest().authenticated()
            )

            // JWT filter spustit před standardním auth filtrem Spring Security
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
