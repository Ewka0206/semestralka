package com.sailconnect.service;

import com.sailconnect.dto.LoginRequest;
import com.sailconnect.dto.RegisterRequest;
import com.sailconnect.dto.UpdateUserRequest;
import com.sailconnect.dto.UserResponse;
import com.sailconnect.model.User;
import com.sailconnect.model.UserRole;
import com.sailconnect.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepo;
    private final BCryptPasswordEncoder encoder;

    public AuthService(UserRepository userRepo, BCryptPasswordEncoder encoder) {
        this.userRepo = userRepo;
        this.encoder = encoder;
    }

    public UserResponse login(LoginRequest req) {
        User user = userRepo.findByEmailIgnoreCase(req.email().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!encoder.matches(req.password(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        return UserResponse.from(user);
    }

    public UserResponse register(RegisterRequest req) {
        if (userRepo.existsByEmailIgnoreCase(req.email().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        User user = new User();
        user.setEmail(req.email().trim().toLowerCase());
        user.setName(req.name().trim());
        user.setPassword(encoder.encode(req.password()));
        user.setRole(UserRole.fromJson(req.role() != null ? req.role() : "crew"));

        return UserResponse.from(userRepo.save(user));
    }

    public UserResponse getUser(String userId) {
        return UserResponse.from(
                userRepo.findById(userId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND))
        );
    }

    public UserResponse updateUser(String userId, UpdateUserRequest patch) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (patch.name() != null) user.setName(patch.name().trim());
        if (patch.email() != null) user.setEmail(patch.email().trim().toLowerCase());
        if (patch.password() != null) user.setPassword(encoder.encode(patch.password()));
        if (patch.role() != null) user.setRole(UserRole.fromJson(patch.role()));

        return UserResponse.from(userRepo.save(user));
    }
}
