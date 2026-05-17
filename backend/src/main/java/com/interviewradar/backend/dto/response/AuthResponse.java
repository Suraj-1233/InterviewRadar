package com.interviewradar.backend.dto.response;

import com.interviewradar.backend.model.User;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AuthResponse {
    private String token;
    private String tokenType;
    private UUID userId;
    private String username;
    private String email;
    private String fullName;
    private String profilePicUrl;
    private boolean isAdmin;

    public static AuthResponse of(String token, User user) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getHandle())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .profilePicUrl(user.getProfilePicUrl())
                .isAdmin(user.isAdmin())
                .build();
    }
}
