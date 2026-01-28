# OIDC Integration với oidc-client-ts

## ✅ Hoàn Thành

Canvas đã được tích hợp với **oidc-client-ts** - thư viện chuẩn cho OpenID Connect và OAuth2.

## 🏗️ Architecture

```
┌─────────────────────┐
│   React Canvas      │
│  (localhost:5173)   │
│                     │
│  1. User clicks     │
│     "Sign In"       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Hyperion IAM       │
│  (localhost:8080)   │
│                     │
│  2. Shows login     │
│     form            │
│  3. User enters     │
│     credentials     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  /callback          │
│                     │
│  4. Receives code   │
│  5. Exchange for    │
│     access_token    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  /builder           │
│                     │
│  6. Authenticated!  │
└─────────────────────┘
```

## 🔐 OAuth2 Flow: Authorization Code + PKCE

**PKCE (Proof Key for Code Exchange)** - Secure cho SPA:
- Không cần client_secret
- Code verifier + code challenge
- Bảo vệ khỏi authorization code interception

### Flow Chi Tiết

```
1. User clicks "Sign In"
   ↓
2. Generate code_verifier (random string)
   ↓
3. Create code_challenge = SHA256(code_verifier)
   ↓
4. Redirect to IAM:
   http://localhost:8080/oauth2/authorize?
     client_id=hyperion-etl-canvas&
     response_type=code&
     redirect_uri=http://localhost:5173/callback&
     scope=openid profile email pipeline:read pipeline:write&
     code_challenge=<hash>&
     code_challenge_method=S256
   ↓
5. IAM shows login page
   ↓
6. User enters credentials
   ↓
7. IAM redirects back:
   http://localhost:5173/callback?code=AUTH_CODE_123
   ↓
8. Exchange code for token:
   POST /oauth2/token
   Body:
     grant_type=authorization_code&
     code=AUTH_CODE_123&
     redirect_uri=http://localhost:5173/callback&
     client_id=hyperion-etl-canvas&
     code_verifier=<original_verifier>
   ↓
9. Receive tokens:
   {
     "access_token": "eyJhbGci...",
     "id_token": "eyJhbGci...",
     "refresh_token": "refresh_...",
     "expires_in": 3600
   }
   ↓
10. Store in SessionStorage
    ↓
11. Redirect to /builder
```

## 📁 Files Created/Updated

### 1. `contexts/AuthContext.tsx`
- UserManager configuration
- Auto token renewal
- Event listeners (token expiring, expired)
- Silent renew support

**Key Features:**
```typescript
- automaticSilentRenew: true  // Auto refresh before expiry
- response_type: 'code'        // Authorization Code
- scope: 'openid profile email pipeline:*'
- loadUserInfo: true           // Get user profile
```

### 2. `pages/LoginPage.tsx`
- Single "Sign In" button
- Redirects to IAM via `userManager.signinRedirect()`
- No password input needed
- Professional OIDC flow

### 3. `pages/CallbackPage.tsx`
- Handles OAuth redirect
- Calls `signinRedirectCallback()`
- Extracts tokens from URL
- Redirects to home

### 4. `App.tsx`
- Added `/callback` route
- Loading state during auth check
- Protected routes with isLoading support

### 5. `services/api.ts`
- Gets token from oidc session storage
- Auto-inject Bearer token
- Handle 401 → redirect to login

## 🚀 Usage

### Starting the App

```bash
# Ensure backend running
# IAM: localhost:8080
# Control Plane: localhost:8083

cd hyperion-etl-canvas
npm run dev
# → http://localhost:5173
```

### Login Flow

1. Navigate to `http://localhost:5173`
2. Auto redirect to `/login`
3. Click **"Sign In with Hyperion IAM"**
4. Redirected to `localhost:8080/oauth2/authorize`
5. Enter credentials on IAM page
6. IAM redirects to `/callback?code=...`
7. Callback page exchanges code → token
8. Auto redirect to `/builder`
9. ✅ Authenticated!

### Using Auth in Components

```typescript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, logout, isAuthenticated } = useAuth();
  
  return (
    <div>
      {isAuthenticated && (
        <>
          <p>Welcome {user?.profile.email}</p>
          <button onClick={logout}>Sign Out</button>
        </>
      )}
    </div>
  );
}
```

### Accessing User Info

```typescript
const { user } = useAuth();

// Standard OIDC claims
user?.profile.sub        // User ID
user?.profile.email      // Email
user?.profile.name       // Full name

// Access token
user?.access_token       // JWT for API calls

// Token info
user?.expires_at         // Expiry timestamp
user?.expired            // Boolean
```

## ⚙️ Configuration

### OIDC Settings

Edit `contexts/AuthContext.tsx`:

```typescript
const oidcConfig: UserManagerSettings = {
  authority: 'http://localhost:8080',  // IAM server
  client_id: 'hyperion-etl-canvas',    // Client ID
  redirect_uri: window.location.origin + '/callback',
  scope: 'openid profile email pipeline:read pipeline:write',
  
  // Advanced
  automaticSilentRenew: true,  // Auto refresh
  loadUserInfo: true,          // Get profile
  response_type: 'code',       // Auth code flow
};
```

### Backend Requirements

IAM phải support:
1. **Authorization endpoint**: `/oauth2/authorize`
2. **Token endpoint**: `/oauth2/token`
3. **UserInfo endpoint**: `/oauth2/userinfo`
4. **JWKS endpoint**: `/.well-known/jwks.json`
5. **Discovery**: `/.well-known/openid-configuration`

### CORS Configuration

IAM cần allow:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
```

## 🔄 Token Management

### Auto Renewal

```typescript
// oidc-client-ts tự động:
1. Monitor token expiry
2. 60s trước khi expired → silent renew
3. Load hidden iframe
4. Renew token without user interaction
5. Update session storage
6. Trigger userLoaded event
```

### Manual Logout

```typescript
const { logout } = useAuth();

// Clears session + notifies IAM
await logout();
// → Redirects to IAM logout
// → IAM redirects back to app
```

## 📊 Session Storage

oidc-client-ts lưu vào SessionStorage:

```javascript
// Key format
`oidc.user:${authority}:${client_id}`

// Example
sessionStorage.getItem('oidc.user:http://localhost:8080:hyperion-etl-canvas')

// Value
{
  "access_token": "eyJ...",
  "id_token": "eyJ...",
  "refresh_token": "ref...",
  "token_type": "Bearer",
  "scope": "openid profile email...",
  "profile": {
    "sub": "user-123",
    "email": "admin@hyperion.com",
    "name": "Admin User"
  },
  "expires_at": 1706400000
}
```

## 🐛 Troubleshooting

### Issue: Redirect Loop

**Cause**: IAM not configured correctly

**Fix**: Check redirect_uri registered in IAM client:
```
http://localhost:5173/callback
```

### Issue: CORS Error

**Cause**: IAM blocking requests from frontend origin

**Fix**: Enable CORS in IAM for `http://localhost:5173`

### Issue: Token Not Sent

**Cause**: API client can't find token

**Debug**:
```javascript
// Browser console
sessionStorage.getItem('oidc.user:http://localhost:8080:hyperion-etl-canvas')
// Should return JSON
```

### Issue: Silent Renew Fails

**Cause**: Missing silent_redirect_uri

**Fix**: Create `public/silent-renew.html`:
```html
<script src="oidc-client-ts.min.js"></script>
<script>
  new UserManager().signinSilentCallback();
</script>
```

## ✨ Best Practices

✅ **Use SessionStorage** - Tokens cleared on tab close  
✅ **Enable AutoRenew** - Seamless UX  
✅ **PKCE Flow** - Secure for SPA  
✅ **Short-lived Tokens** - 1 hour max  
✅ **Validate on Backend** - Never trust frontend  

## 📚 Resources

- [oidc-client-ts Docs](https://github.com/authts/oidc-client-ts)
- [OAuth 2.0 PKCE](https://oauth.net/2/pkce/)
- [OpenID Connect](https://openid.net/connect/)

## 🎯 Summary

✅ **Professional OIDC integration**  
✅ **Authorization Code + PKCE**  
✅ **Auto token renewal**  
✅ **Secure SPA authentication**  
✅ **Industry standard**  

🚀 **Production-ready OAuth2!**
