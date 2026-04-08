package com.CodeForageAI.Project.CodeForageAI.security;

import org.springframework.security.core.GrantedAuthority;

import java.util.List;

public record JwtUserPrincipal(
        Long userId,
        String username,
        String role,
        List<GrantedAuthority> authorities
) {
}
