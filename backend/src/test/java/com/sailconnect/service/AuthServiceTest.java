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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    UserRepository userRepo;

    @Mock
    BCryptPasswordEncoder encoder;

    @Mock
    JwtUtil jwtUtil;

    @InjectMocks
    AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId("u1");
        testUser.setEmail("efka@email.cz");
        testUser.setName("Efka");
        testUser.setPassword("$2a$hashed");
        testUser.setRole(UserRole.CREW);
        testUser.setCreatedAt("2026-01-01T00:00:00Z");
        testUser.setUpdatedAt("2026-01-01T00:00:00Z");
    }

    @Test
    void login_spravneUdaje_vratiLoginResponseSTokenem() {
        when(userRepo.findByEmailIgnoreCase("efka@email.cz")).thenReturn(Optional.of(testUser));
        when(encoder.matches("heslo123", "$2a$hashed")).thenReturn(true);
        when(jwtUtil.generateToken("u1", "crew")).thenReturn("mock.jwt.token");

        LoginResponse result = authService.login(new LoginRequest("efka@email.cz", "heslo123"));

        assertThat(result.id()).isEqualTo("u1");
        assertThat(result.email()).isEqualTo("efka@email.cz");
        assertThat(result.role()).isEqualTo("crew");
        assertThat(result.token()).isEqualTo("mock.jwt.token");
    }

    @Test
    void login_spatneHeslo_hodi401() {
        when(userRepo.findByEmailIgnoreCase("efka@email.cz")).thenReturn(Optional.of(testUser));
        when(encoder.matches("spatne", "$2a$hashed")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new LoginRequest("efka@email.cz", "spatne")))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void login_neznameEmail_hodi401() {
        when(userRepo.findByEmailIgnoreCase(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(new LoginRequest("neznamy@email.cz", "heslo")))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void login_nullEmail_hodi400() {
        assertThatThrownBy(() -> authService.login(new LoginRequest(null, "heslo")))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void register_nullEmail_hodi400() {
        assertThatThrownBy(() -> authService.register(new RegisterRequest("Jméno", null, "heslo123", "crew")))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void register_novyUzivatel_uloziaVratiTokenem() {
        when(userRepo.existsByEmailIgnoreCase("nova@email.cz")).thenReturn(false);
        when(encoder.encode("heslo123")).thenReturn("$2a$hashed_new");
        when(userRepo.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId("u2");
            u.setCreatedAt("2026-01-01T00:00:00Z");
            u.setUpdatedAt("2026-01-01T00:00:00Z");
            return u;
        });
        when(jwtUtil.generateToken(any(), any())).thenReturn("mock.register.token");

        LoginResponse result = authService.register(
                new RegisterRequest("Nová", "nova@email.cz", "heslo123", "captain"));

        assertThat(result.email()).isEqualTo("nova@email.cz");
        assertThat(result.name()).isEqualTo("Nová");
        assertThat(result.role()).isEqualTo("captain");
        assertThat(result.token()).isNotBlank();
        verify(userRepo).save(any(User.class));
    }

    @Test
    void register_duplicitniEmail_hodi409() {
        when(userRepo.existsByEmailIgnoreCase("efka@email.cz")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(
                new RegisterRequest("Efka", "efka@email.cz", "heslo", "crew")))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.CONFLICT);

        verify(userRepo, never()).save(any());
    }

    @Test
    void register_rolleNull_uloziJakoCrew() {
        when(userRepo.existsByEmailIgnoreCase(any())).thenReturn(false);
        when(encoder.encode(any())).thenReturn("$2a$x");
        when(userRepo.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId("u3");
            u.setCreatedAt("2026-01-01T00:00:00Z");
            u.setUpdatedAt("2026-01-01T00:00:00Z");
            return u;
        });
        when(jwtUtil.generateToken(any(), any())).thenReturn("mock.token");

        LoginResponse result = authService.register(
                new RegisterRequest("Test", "test@email.cz", "heslo", null));

        assertThat(result.role()).isEqualTo("crew");
    }

    @Test
    void updateUser_aktualizujeJmenoAEmail() {
        when(userRepo.findById("u1")).thenReturn(Optional.of(testUser));
        when(userRepo.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponse result = authService.updateUser("u1",
                new UpdateUserRequest("Nové jméno", "nove@email.cz", null, null));

        assertThat(result.name()).isEqualTo("Nové jméno");
        assertThat(result.email()).isEqualTo("nove@email.cz");
    }

    @Test
    void updateUser_nenajdeUzivatele_hodi404() {
        when(userRepo.findById("neexistuje")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.updateUser("neexistuje",
                new UpdateUserRequest("X", "x@x.cz", null, null)))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }
}
