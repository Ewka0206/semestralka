package com.sailconnect.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Pomocná komponenta pro práci s JWT tokeny.
 *
 * <p>Generuje podepsané tokeny (HMAC-SHA256) a ověřuje jejich platnost.
 * Token obsahuje:
 * <ul>
 *   <li>{@code sub}  – UUID přihlášeného uživatele</li>
 *   <li>{@code role} – role uživatele ("crew" nebo "captain")</li>
 *   <li>{@code iat}  – čas vydání</li>
 *   <li>{@code exp}  – čas expirace (výchozí 24 h)</li>
 * </ul>
 */
@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms:86400000}")
    private long expirationMs;

    // ── Veřejné API ──────────────────────────────────────────────────────────

    /**
     * Vygeneruje podepsaný JWT token pro daného uživatele.
     *
     * @param userId UUID uživatele (stane se hodnotou {@code sub})
     * @param role   role uživatele ("crew" nebo "captain")
     * @return kompaktní JWT string
     */
    public String generateToken(String userId, String role) {
        log.debug("Generuji JWT token pro userId={}, role={}", userId, role);
        return Jwts.builder()
                .subject(userId)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSignKey())
                .compact();
    }

    /**
     * Ověří podpis a platnost tokenu.
     *
     * @param token JWT string
     * @return {@code true} pokud je token platný a nepršel
     */
    public boolean isValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Neplatný JWT token: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Extrahuje UUID uživatele z tokenu (claim {@code sub}).
     *
     * @param token platný JWT string
     * @return UUID uživatele
     */
    public String getUserId(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * Extrahuje roli uživatele z tokenu (claim {@code role}).
     *
     * @param token platný JWT string
     * @return role jako string ("crew" nebo "captain")
     */
    public String getRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    // ── Soukromé pomocné metody ───────────────────────────────────────────────

    /** Parsuje a ověří claims z JWT tokenu; vyhodí JwtException při chybě. */
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /** Vytvoří HMAC-SHA256 klíč z konfiguračního tajného klíče. */
    private SecretKey getSignKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}