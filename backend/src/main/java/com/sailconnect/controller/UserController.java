package com.sailconnect.controller;

import com.sailconnect.dto.UpdateUserRequest;
import com.sailconnect.dto.UserResponse;
import com.sailconnect.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AuthService authService;

    public UserController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/{id}")
    public UserResponse getUser(@PathVariable String id) {
        return authService.getUser(id);
    }

    @PutMapping("/{id}")
    public UserResponse updateUser(@PathVariable String id, @Valid @RequestBody UpdateUserRequest patch) {
        return authService.updateUser(id, patch);
    }
}
