package com.hyperion.etl.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.Optional;

/**
 * Security utility for extracting user information from JWT
 */
public class SecurityUtils {

    /**
     * Get the current authenticated user's email (from 'sub' claim)
     */
    public static Optional<String> getCurrentUserEmail() {
        return getJwt().map(jwt -> jwt.getClaimAsString("sub"));
    }

    /**
     * Get the current authenticated user's ID (from 'userId' claim)
     */
    public static Optional<String> getCurrentUserId() {
        return getJwt().map(jwt -> jwt.getClaimAsString("userId"));
    }

    /**
     * Get the JWT from the security context
     */
    private static Optional<Jwt> getJwt() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            return Optional.of(jwtAuth.getToken());
        }

        return Optional.empty();
    }

    /**
     * Get current user identifier (email) or throw exception if not authenticated
     */
    public static String requireCurrentUser() {
        return getCurrentUserEmail()
                .orElseThrow(() -> new IllegalStateException("No authenticated user found"));
    }
}
