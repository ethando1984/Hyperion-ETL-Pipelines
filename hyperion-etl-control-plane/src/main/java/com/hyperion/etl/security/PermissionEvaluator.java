package com.hyperion.etl.security;

import org.springframework.security.access.expression.method.MethodSecurityExpressionOperations;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.Collection;

/**
 * Custom Permission Evaluator for @PreAuthorize annotations
 * 
 * Supports wildcard permissions:
 * - *:* = full access to everything
 * - resource:* = all actions on specific resource (e.g., etl:pipeline:*)
 * - *:action = specific action on any resource (e.g., *:READ)
 * - resource:action = exact match (e.g., etl:pipeline:WRITE)
 * 
 * Usage in controllers:
 * @PreAuthorize("@permissionEvaluator.hasPermission(authentication,
 * 'etl:pipeline:WRITE')")
 */
@Component("permissionEvaluator")
public class PermissionEvaluator
        implements org.springframework.security.access.PermissionEvaluator {

    @Override
    public boolean hasPermission(
            Authentication authentication,
            Object targetDomainObject,
            Object permission) {
        if (authentication == null || permission == null) {
            return false;
        }

        String requiredPermission = permission.toString();
        return checkPermission(authentication.getAuthorities(), requiredPermission);
    }

    @Override
    public boolean hasPermission(
            Authentication authentication,
            Serializable targetId,
            String targetType,
            Object permission) {
        return hasPermission(authentication, null, permission);
    }

    /**
     * Check if user has the required permission with wildcard support
     */
    private boolean checkPermission(
            Collection<? extends GrantedAuthority> authorities,
            String requiredPermission) {
        // Parse required permission
        String[] requiredParts = requiredPermission.split(":");
        if (requiredParts.length != 2) {
            return false;
        }

        String requiredResource = requiredParts[0];
        String requiredAction = requiredParts[1];

        for (GrantedAuthority authority : authorities) {
            String grantedPermission = authority.getAuthority();

            // Remove PERMISSION_ prefix added by JwtAuthenticationConverter
            if (grantedPermission.startsWith("PERMISSION_")) {
                grantedPermission = grantedPermission.substring("PERMISSION_".length());
            }

            String[] grantedParts = grantedPermission.split(":");
            if (grantedParts.length != 2) {
                continue;
            }

            String grantedResource = grantedParts[0];
            String grantedAction = grantedParts[1];

            // Check wildcard patterns
            if ("*".equals(grantedResource) && "*".equals(grantedAction)) {
                // *:* matches everything
                return true;
            }

            if (grantedResource.equals(requiredResource) && "*".equals(grantedAction)) {
                // resource:* matches all actions on that resource
                return true;
            }

            if ("*".equals(grantedResource) && grantedAction.equals(requiredAction)) {
                // *:action matches that action on any resource
                return true;
            }

            if (grantedResource.equals(requiredResource) && grantedAction.equals(requiredAction)) {
                // Exact match
                return true;
            }
        }

        return false;
    }
}
