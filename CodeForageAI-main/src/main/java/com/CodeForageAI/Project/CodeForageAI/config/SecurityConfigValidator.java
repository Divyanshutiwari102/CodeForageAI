package com.CodeForageAI.Project.CodeForageAI.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class SecurityConfigValidator {

    @Value("${spring.datasource.url:}")
    private String dbUrl;
    @Value("${spring.datasource.username:}")
    private String dbUser;
    @Value("${spring.datasource.password:}")
    private String dbPassword;

    @Value("${jwt.secret-key:}")
    private String jwtSecret;

    @Value("${minio.endpoint:}")
    private String minioEndpoint;
    @Value("${minio.access-key:}")
    private String minioAccessKey;
    @Value("${minio.secret-key:}")
    private String minioSecretKey;

    @Value("${payment.pricing.pro-amount-paise:0}")
    private int proAmountPaise;

    @Value("${cors.allowed-origins:}")
    private String corsAllowedOrigins;
    @Value("${auth.cookie.same-site:Lax}")
    private String authCookieSameSite;
    @Value("${auth.cookie.secure:true}")
    private boolean authCookieSecure;

    @PostConstruct
    public void validate() {
        require("spring.datasource.url", dbUrl);
        require("spring.datasource.username", dbUser);
        require("spring.datasource.password", dbPassword);
        require("jwt.secret-key", jwtSecret);
        requireMinLength("jwt.secret-key", jwtSecret, 32);
        require("minio.endpoint", minioEndpoint);
        require("minio.access-key", minioAccessKey);
        require("minio.secret-key", minioSecretKey);
        require("cors.allowed-origins", corsAllowedOrigins);
        if ("none".equalsIgnoreCase(authCookieSameSite) && !authCookieSecure) {
            throw new IllegalStateException("auth.cookie.secure must be true when auth.cookie.same-site=None");
        }
        if (proAmountPaise <= 0) {
            throw new IllegalStateException("payment.pricing.pro-amount-paise must be > 0");
        }
    }

    private void require(String name, String value) {
        if (!StringUtils.hasText(value)) {
            throw new IllegalStateException(name + " must be configured");
        }
    }

    private void requireMinLength(String name, String value, int minLength) {
        if (!StringUtils.hasText(value) || value.length() < minLength) {
            throw new IllegalStateException(name + " must be at least " + minLength + " characters");
        }
    }
}
