package com.hyperion.etl.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

/**
 * JWT Authentication Converter
 * 
 * Extracts permissions from JWT claims and converts them to GrantedAuthority.
 * 
 * Expected JWT structure:
 * {
 * "sub": "user@email.com",
 * "userId": "uuid",
 * "permissions": ["etl:pipeline:WRITE", "etl:run:RUN", "*:*"]
 * }
 */
public class JwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private static final String PERMISSIONS_CLAIM = "permissions";

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Collection<GrantedAuthority> authorities = extractAuthorities(jwt);
        return new JwtAuthenticationToken(jwt, authorities);
    }

    private Collection<GrantedAuthority> extractAuthorities(Jwt jwt) {
        List<String> permissions = jwt.getClaimAsStringList(PERMISSIONS_CLAIM);

        if (permissions == null || permissions.isEmpty()) {
            return List.of();
        }

        return permissions.stream()
                .map(permission -> new SimpleGrantedAuthority("PERMISSION_" + permission))
                .collect(Collectors.toList());
    }
}
