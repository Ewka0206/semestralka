package com.sailconnect.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Servlet filter pro ověření JWT tokenů.
 *
 * <p>Spouští se jednou pro každý HTTP požadavek (extends {@link OncePerRequestFilter}).
 * Pokud hlavička {@code Authorization: Bearer <token>} obsahuje platný JWT,
 * nastaví {@link org.springframework.security.core.context.SecurityContext}
 * se jménem (userId) a rolí uživatele. Neplatný nebo chybějící token požadavek
 * neblokuje – Spring Security rozhodne o přístupu na základě nastavení {@link SecurityConfig}.
 */
@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtFilter.class);
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith(BEARER_PREFIX)) {
            String token = authHeader.substring(BEARER_PREFIX.length());

            if (jwtUtil.isValid(token)) {
                String userId = jwtUtil.getUserId(token);
                String role   = jwtUtil.getRole(token);

                // Nastavit Spring Security kontext – Spring MVC ho automaticky injektuje jako Authentication
                var auth = new UsernamePasswordAuthenticationToken(
                        userId,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                );
                SecurityContextHolder.getContext().setAuthentication(auth);

                log.debug("JWT autentizace: userId={}, role={}, uri={}",
                        userId, role, request.getRequestURI());
            } else {
                log.warn("Odmítnut neplatný JWT token – uri={}", request.getRequestURI());
            }
        }

        filterChain.doFilter(request, response);
    }
}
