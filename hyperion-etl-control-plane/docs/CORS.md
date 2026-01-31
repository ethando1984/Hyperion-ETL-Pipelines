# CORS Configuration Guide

## Overview

The Hyperion ETL Control Plane has Cross-Origin Resource Sharing (CORS) configured to allow frontend applications to make API requests from different origins (domains/ports).

## Configuration Location

CORS is configured in:
- **Java Class**: `src/main/java/com/hyperion/etl/config/CorsConfig.java`
- **Application Config**: `src/main/resources/application.yml`

## Development Mode

By default, CORS allows **all localhost ports** using wildcard patterns:
- `http://localhost:*` 
- `http://127.0.0.1:*`

This means your frontend can run on any port (5173, 5175, 3000, etc.) and still access the backend API.

### Current Frontend Ports
- **Vite Dev Server**: Port 5175 (configured in `hyperion-etl-canvas/vite.config.ts`)
- **Backend API**: Port 8083 (configured in `application.yml`)

## Production Mode

For production deployments, you should restrict CORS to specific origins.

### Environment Variable

Set the `cors.allowed-origins` property with comma-separated URLs:

```bash
# Linux/Mac
export CORS_ALLOWED_ORIGINS="https://app.example.com,https://admin.example.com"

# Windows PowerShell
$env:CORS_ALLOWED_ORIGINS="https://app.example.com,https://admin.example.com"
```

### Application Properties

Or configure in `application.yml` or `application-prod.yml`:

```yaml
cors:
  allowed-origins: https://app.example.com,https://admin.example.com
```

## CORS Settings

The current CORS configuration includes:

### Allowed Methods
- `GET` - Read data
- `POST` - Create resources
- `PUT` - Update entire resources
- `PATCH` - Partial updates
- `DELETE` - Remove resources
- `OPTIONS` - Preflight requests

### Allowed Headers
- All headers (`*`)

### Exposed Headers
Headers that JavaScript can read from responses:
- `Authorization` - JWT tokens
- `Content-Type` - Response content type
- `X-Total-Count` - Pagination: total records
- `Location` - Created resource URL
- `X-Request-Id` - Request tracing
- `X-Page-Number` - Pagination: current page
- `X-Page-Size` - Pagination: page size

### Credentials
- `allowCredentials: true` - Allows cookies and authorization headers

### Preflight Cache
- `maxAge: 3600` - Browser caches preflight OPTIONS requests for 1 hour

## Security Considerations

### ⚠️ Development vs Production

**Development**: Wildcard patterns (`http://localhost:*`) are convenient but should **NEVER** be used in production.

**Production**: Always specify exact origins to prevent unauthorized access.

### HTTPS in Production

Always use HTTPS origins in production:
```yaml
# ✅ Good
cors:
  allowed-origins: https://app.example.com

# ❌ Bad (allows man-in-the-middle attacks)
cors:
  allowed-origins: http://app.example.com
```

### Credentials and Wildcards

You **cannot** use `allowCredentials: true` with wildcard origins (`*`). This is why we use:
- Wildcard patterns (`http://localhost:*`) in development
- Specific origins in production

## Testing CORS

### From Browser DevTools

```javascript
fetch('http://localhost:8083/api/pipelines', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  credentials: 'include'
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('CORS Error:', error));
```

### Expected Headers in Response

Check the Network tab in DevTools for these headers:

```
Access-Control-Allow-Origin: http://localhost:5175
Access-Control-Allow-Credentials: true
Access-Control-Expose-Headers: Authorization, Content-Type, X-Total-Count, Location, X-Request-Id, X-Page-Number, X-Page-Size
```

## Troubleshooting

### Error: "Access to fetch... has been blocked by CORS policy"

**Cause**: The frontend origin is not in the allowed origins list.

**Solution**: 
1. Check the frontend URL in the browser (e.g., `http://localhost:5175`)
2. Verify it matches the CORS configuration
3. Restart the backend after changing configuration

### Error: "Credential is not supported if the CORS header 'Access-Control-Allow-Origin' is '*'"

**Cause**: Trying to use credentials with wildcard origin.

**Solution**: Use `allowedOriginPatterns` instead of `allowedOrigins` with wildcards.

### Preflight OPTIONS Request Failing

**Cause**: OPTIONS request is being blocked by security.

**Solution**: Ensure OPTIONS is in `allowedMethods` and CORS is configured before Spring Security.

## Architecture Notes

### Why CorsFilter instead of @CrossOrigin?

We use a global `CorsFilter` bean instead of per-controller `@CrossOrigin` annotations because:

1. **Centralized Configuration**: Single source of truth
2. **Environment-based**: Easy to change between dev/prod
3. **Preflight Handling**: Properly handles OPTIONS requests
4. **Security Integration**: Works seamlessly with Spring Security

### Filter Order

The CORS filter runs **before** Spring Security, allowing preflight OPTIONS requests to succeed without authentication.

## Related Files

- `src/main/java/com/hyperion/etl/config/CorsConfig.java` - CORS configuration class
- `src/main/java/com/hyperion/etl/security/SecurityConfig.java` - Security configuration (CORS disabled here since CorsFilter handles it)
- `src/main/resources/application.yml` - Application properties
- `hyperion-etl-canvas/vite.config.ts` - Frontend port configuration

## References

- [Spring CORS Documentation](https://docs.spring.io/spring-framework/reference/web/webmvc-cors.html)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [OWASP CORS Security](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
