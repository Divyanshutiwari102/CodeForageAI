package com.CodeForageAI.Project.CodeForageAI.controller;

import com.CodeForageAI.Project.CodeForageAI.dto.auth.AuthResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.auth.LoginRequest;
import com.CodeForageAI.Project.CodeForageAI.dto.auth.SignupRequest;
import com.CodeForageAI.Project.CodeForageAI.dto.auth.UserProfileResponse;
import com.CodeForageAI.Project.CodeForageAI.security.AuthUtil;
import com.CodeForageAI.Project.CodeForageAI.security.AuthConstants;
import com.CodeForageAI.Project.CodeForageAI.service.AuthService;
import com.CodeForageAI.Project.CodeForageAI.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class AuthController {
    private static final long AUTH_COOKIE_MAX_AGE_SECONDS = 60L * 60 * 24;

    AuthService authService;
    UserService userService;
    AuthUtil authUtil;
    @Value("${auth.cookie.secure:true}")
    boolean cookieSecure;
    @Value("${auth.cookie.same-site:Lax}")
    String cookieSameSite;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.signup(request);
        addAuthCookie(response, authResponse.token());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request);
        addAuthCookie(response, authResponse.token());
        return ResponseEntity.ok(authResponse);
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getProfile() {
        Long userId = authUtil.getCurrentUserId();
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    private void addAuthCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from(AuthConstants.AUTH_TOKEN_COOKIE_NAME, token)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .sameSite(cookieSameSite)
                .maxAge(AUTH_COOKIE_MAX_AGE_SECONDS)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
