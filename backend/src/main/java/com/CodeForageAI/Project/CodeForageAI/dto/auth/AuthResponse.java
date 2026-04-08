package com.CodeForageAI.Project.CodeForageAI.dto.auth;

public record AuthResponse(
        String token,
        UserProfileResponse user
) {

}
