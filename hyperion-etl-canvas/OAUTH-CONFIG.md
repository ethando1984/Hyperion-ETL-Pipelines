# OAuth2 Configuration - Environment Variables

## Client Credentials

Thêm vào `.env`:

```env
VITE_OAUTH_AUTHORITY=http://localhost:8080
VITE_OAUTH_CLIENT_ID=hyperion-etl-canvas
VITE_OAUTH_CLIENT_SECRET=canvas-secret
```

## Register Client in IAM

Trong Hyperion IAM, đăng ký OAuth2 client:

```sql
-- Example client registration
INSERT INTO oauth2_registered_client (
  client_id,
  client_secret,
  redirect_uris,
  scopes,
  authorization_grant_types
) VALUES (
  'hyperion-etl-canvas',
  '{bcrypt}$2a$10$...', -- hashed: canvas-secret
  'http://localhost:5173/callback',
  'openid,profile,email,pipeline:read,pipeline:write,pipeline:execute',
  'authorization_code,refresh_token'
);
```

## Flow Summary

```
1. User clicks "Sign In"
   ↓
2. Redirect: /oauth2/authorize?
   - client_id=hyperion-etl-canvas
   - response_type=code
   - redirect_uri=http://localhost:5173/callback
   - scope=openid profile email...
   - code_challenge=<PKCE hash>
   ↓
3. User login on IAM
   ↓
4. Redirect back: /callback?code=AUTH_CODE
   ↓
5. POST /oauth2/token:
   - grant_type=authorization_code
   - code=AUTH_CODE
   - redirect_uri=http://localhost:5173/callback
   - client_id=hyperion-etl-canvas
   - client_secret=canvas-secret
   - code_verifier=<PKCE verifier>
   ↓
6. Receive access_token
```

**PKCE + Client Secret** = Confidential Client với extra security!
