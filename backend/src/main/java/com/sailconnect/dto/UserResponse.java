package com.sailconnect.dto;

import com.sailconnect.model.User;

public record UserResponse(
        String id,
        String email,
        String name,
        String role,
        String createdAt,
        String updatedAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole().toJson(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
