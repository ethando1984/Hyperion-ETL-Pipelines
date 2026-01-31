package com.hyperion.etl.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Security Configuration for Hyperion ETL Control Plane
 * 
 * OAuth2 and method-level security DISABLED for development.
 * 
 * Note: CORS is configured in CorsConfig.java
 * 
 * TODO: Re-enable when OAuth2 server is available:
 * - Uncomment @EnableMethodSecurity
 * - Uncomment OAuth2 configuration in application.yml
 * - Update securityFilterChain to require authentication
 */
@Configuration
@EnableWebSecurity
// Method security disabled for development - re-enable when auth server is
// ready
// @EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
            CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                // CORS is configured in CorsConfig.java via CorsConfigurationSource bean
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        // Allow all requests for development (OAuth2 disabled)
                        // TODO: Re-enable authentication when auth server is available
                        .anyRequest().permitAll());

        // OAuth2 Resource Server disabled for development
        // Uncomment when auth server is running:
        // .oauth2ResourceServer(oauth2 -> oauth2
        // .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        return new JwtAuthenticationConverter();
    }

    @Bean
    public PermissionEvaluator permissionEvaluator() {
        return new PermissionEvaluator();
    }
}
