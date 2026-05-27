package com.sailconnect.service;

import com.sailconnect.config.JwtUtil;
import com.sailconnect.dto.LoginRequest;
import com.sailconnect.dto.LoginResponse;
import com.sailconnect.dto.RegisterRequest;
import com.sailconnect.dto.UpdateUserRequest;
import com.sailconnect.dto.UserResponse;
import com.sailconnect.model.User;
import com.sailconnect.model.UserRole;
import com.sailconnect.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Business logika pro autentizaci a správu uživatelských účtů.
 *
 * <p>Při úspěšném přihlášení nebo registraci vystavuje JWT token
 * s platností 24 hodin. Hesla jsou hashována pomocí BCrypt.
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepo;
    private final BCryptPasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepo, BCryptPasswordEncoder encoder, JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.encoder  = encoder;
        this.jwtUtil  = jwtUtil;
    }

    /**
     * Ověří přihlašovací údaje a vrátí JWT token spolu s daty uživatele.
     *
     * @param req přihlašovací údaje (email + heslo)
     * @return {@link LoginResponse} s JWT tokenem
     * @throws ResponseStatusException 400 při chybějících polích, 401 při neplatných údajích
     */
    public LoginResponse login(LoginRequest req) {
        if (req.email() == null || req.password() == null) {
            log.warn("Pokus o přihlášení s prázdným e-mailem nebo heslem");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "E-mail a heslo jsou povinné.");
        }

        User user = userRepo.findByEmailIgnoreCase(req.email().trim())
                .orElseThrow(() -> {
                    log.warn("Přihlášení selhalo – neznámý e-mail: {}", req.email());
                    return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
                });

        if (!encoder.matches(req.password(), user.getPassword())) {
            log.warn("Přihlášení selhalo – špatné heslo pro userId={}", user.getId());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getRole().toJson());
        log.info("Uživatel přihlášen: userId={}, role={}", user.getId(), user.getRole());
        return LoginResponse.from(UserResponse.from(user), token);
    }

    /**
     * Registruje nového uživatele a okamžitě vrátí JWT token.
     *
     * @param req registrační data (jméno, e-mail, heslo, role)
     * @return {@link LoginResponse} s JWT tokenem
     * @throws ResponseStatusException 400 při chybějících polích, 409 pokud e-mail již existuje
     */
    public LoginResponse register(RegisterRequest req) {
        if (req.email() == null || req.name() == null || req.password() == null) {
            log.warn("Registrace s neúplnými daty");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Jméno, e-mail a heslo jsou povinné.");
        }

        if (userRepo.existsByEmailIgnoreCase(req.email().trim())) {
            log.warn("Registrace selhala – e-mail již existuje: {}", req.email());
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        User user = new User();
        user.setEmail(req.email().trim().toLowerCase());
        user.setName(req.name().trim());
        user.setPassword(encoder.encode(req.password()));
        user.setRole(UserRole.fromJson(req.role() != null ? req.role() : "crew"));
        user = userRepo.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getRole().toJson());
        log.info("Nový uživatel zaregistrován: userId={}, role={}", user.getId(), user.getRole());
        return LoginResponse.from(UserResponse.from(user), token);
    }

    /**
     * Vrátí profil uživatele podle jeho ID.
     *
     * @param userId UUID uživatele
     * @return {@link UserResponse} bez tokenu
     * @throws ResponseStatusException 404 pokud uživatel neexistuje
     */
    public UserResponse getUser(String userId) {
        log.debug("Načítám profil uživatele: userId={}", userId);
        return UserResponse.from(
                userRepo.findById(userId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND))
        );
    }

    /**
     * Částečně aktualizuje profil uživatele (patch semantika – null pole se ignorují).
     *
     * @param userId UUID uživatele
     * @param patch  měněná pole
     * @return aktualizovaný {@link UserResponse}
     * @throws ResponseStatusException 404 pokud uživatel neexistuje
     */
    public UserResponse updateUser(String userId, UpdateUserRequest patch) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (patch.name()     != null) user.setName(patch.name().trim());
        if (patch.email()    != null) user.setEmail(patch.email().trim().toLowerCase());
        if (patch.password() != null) user.setPassword(encoder.encode(patch.password()));
        if (patch.role()     != null) user.setRole(UserRole.fromJson(patch.role()));

        log.info("Profil aktualizován: userId={}", userId);
        return UserResponse.from(userRepo.save(user));
    }
}
