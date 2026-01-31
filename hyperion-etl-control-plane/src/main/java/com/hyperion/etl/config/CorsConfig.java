package com.hyperion.etl.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * CORS configuration to allow frontend access
 * 
 * Development mode: Uses wildcard patterns for localhost
 * Production mode: Set ALLOWED_ORIGINS environment variable
 * 
 * This configuration is used by Spring Security's CORS support.
 */
@Configuration
public class CorsConfig {

        @Value("${cors.allowed-origins:}")
        private String allowedOrigins;

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();

                // Allow credentials (required for authentication cookies/headers)
                config.setAllowCredentials(true);

                // Configure allowed origins
                if (allowedOrigins != null && !allowedOrigins.isEmpty()) {
                        // Production: Use specific origins from environment
                        config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
                } else {
                        // Development: Allow all localhost ports
                        config.setAllowedOriginPatterns(Arrays.asList(
                                        "http://localhost:*",
                                        "http://127.0.0.1:*"));
                }

                // Allow all headers
                config.setAllowedHeaders(List.of("*"));

                // Allow all HTTP methods (including PATCH for partial updates)
                config.setAllowedMethods(Arrays.asList(
                                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

                // Expose headers that frontend might need to read
                config.setExposedHeaders(Arrays.asList(
                                "Authorization", // For JWT tokens
                                "Content-Type", // Response content type
                                "X-Total-Count", // Pagination: total records
                                "Location", // Created resource location
                                "X-Request-Id", // Request tracing
                                "X-Page-Number", // Pagination: current page
                                "X-Page-Size" // Pagination: page size
                ));

                // Max age for preflight cache (1 hour)
                config.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);

                return source;
        }
}
