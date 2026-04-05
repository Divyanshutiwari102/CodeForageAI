package com.CodeForageAI.Project.CodeForageAI.security;

import com.CodeForageAI.Project.CodeForageAI.service.AuditLogService;
import com.CodeForageAI.Project.CodeForageAI.util.TraceContext;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";
    private final AuthUtil authUtil;
    private final AuditLogService auditLogService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/api/auth/login")
                || path.startsWith("/api/auth/signup")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/swagger-ui.html")
                || path.startsWith("/api/health");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String traceId = TraceContext.getOrCreate(request.getHeader(TraceContext.TRACE_ID_HEADER));
        TraceContext.set(traceId);
        response.setHeader(TraceContext.TRACE_ID_HEADER, traceId);

        Long userId = null;

        try {
            log.info("incoming request: {} traceId={}", request.getRequestURI(), traceId);

            final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

            if (authHeader != null && authHeader.startsWith(BEARER_PREFIX)) {
                final String jwtToken = authHeader.substring(BEARER_PREFIX.length()).trim();
                if (!jwtToken.isBlank()) {
                    JwtUserPrincipal user = authUtil.verifyAccessToken(jwtToken);
                    userId = user.userId();

                    if (SecurityContextHolder.getContext().getAuthentication() == null) {
                        UsernamePasswordAuthenticationToken authenticationToken =
                                new UsernamePasswordAuthenticationToken(user, null, user.authorities());
                        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                    }
                }
            }

            filterChain.doFilter(request, response);
        } catch (ExpiredJwtException e) {
            log.warn("JWT expired: {} traceId={}", e.getMessage(), traceId);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        } catch (MalformedJwtException e) {
            log.warn("JWT malformed (likely whitespace/prefix issue): {} traceId={}", e.getMessage(), traceId);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("JWT processing failed: {} traceId={}", e.getMessage(), traceId);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        } finally {
            try {
                String method = request.getMethod();
                String action = "READ";
                if ("POST".equalsIgnoreCase(method)) action = "CREATE";
                else if ("PUT".equalsIgnoreCase(method) || "PATCH".equalsIgnoreCase(method)) action = "UPDATE";
                else if ("DELETE".equalsIgnoreCase(method)) action = "DELETE";
                auditLogService.record(
                        userId,
                        action,
                        request.getRequestURI(),
                        method,
                        response.getStatus(),
                        "Request completed",
                        traceId
                );
            } catch (Exception e) {
                log.warn("Failed to write audit log traceId={} message={}", traceId, e.getMessage());
            }
            TraceContext.clear();
        }
    }
}