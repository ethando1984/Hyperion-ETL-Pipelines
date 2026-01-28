# Quick Fix: Manual OAuth Endpoints

Nếu IAM không support OpenID Connect discovery, uncomment section này trong `AuthContext.tsx`:

```typescript
const oidcConfig: UserManagerSettings = {
  authority: 'http://localhost:8080',
  
  // MANUAL CONFIGURATION - uncomment nếu auto-discovery fails
  metadata: {
    authorization_endpoint: 'http://localhost:8080/oauth/authorize',  // Thử /oauth hoặc /oauth2
    token_endpoint: 'http://localhost:8080/oauth/token',
    userinfo_endpoint: 'http://localhost:8080/oauth/userinfo',
    end_session_endpoint: 'http://localhost:8080/oauth/logout',
  },
  
  client_id: 'hyperion-etl-canvas',
  // ... rest of config
};
```

## Test Endpoints

```bash
# Test which path works:
curl http://localhost:8080/.well-known/openid-configuration
# Nếu 404 → cần manual config

# Test authorize endpoint:
curl -I http://localhost:8080/oauth/authorize
curl -I http://localhost:8080/oauth2/authorize
# URL nào trả về 302 redirect hoặc 200 → đúng path
```

## Common Paths

**Spring Authorization Server (old):**
- `/oauth/authorize`
- `/oauth/token`

**Spring Authorization Server (new):**
- `/oauth2/authorize`
- `/oauth2/token`

**Keycloak:**
- `/realms/{realm}/protocol/openid-connect/auth`
- `/realms/{realm}/protocol/openid-connect/token`
