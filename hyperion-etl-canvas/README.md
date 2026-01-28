# Hyperion ETL Canvas - React Frontend

Frontend React application cho Hyperion ETL Platform với OAuth2 authentication.

## Tính năng

✅ **OAuth2 Authentication** - Tích hợp với Hyperion IAM  
✅ **JWT Token Management** - Auto refresh và secure storage  
✅ **Protected Routes** - Route guards cho authenticated users  
✅ **API Client** - Axios với JWT interceptors  
✅ **Pipeline Builder** - Visual drag-and-drop interface  
✅ **Real-time Updates** - WebSocket cho pipeline status  

## Cài đặt

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## OAuth2 Flow

### 1. Login Flow

```
User → Login Page → Hyperion IAM (localhost:8080)
     ↓
JWT Token → LocalStorage
     ↓
Redirect to Dashboard
```

### 2. API Requests

```typescript
// All requests automatically include JWT
axios.get('/api/pipelines')
// Headers: Authorization: Bearer eyJhbGciOiJSUzI1Ni...
```

### 3. Token Expiry

```
API returns 401 → Auto logout → Redirect to login
```

## Configuration

Edit `.env` để thay đổi backend URLs:

```env
VITE_API_BASE_URL=http://localhost:8083/api
VITE_IAM_BASE_URL=http://localhost:8080
VITE_CLIENT_ID=hyperion-etl-canvas
```

## Demo Credentials

Để test OAuth2 flow:

- **Email**: admin@hyperion.com
- **Password**: password

## Architecture

```
src/
├── contexts/
│   └── AuthContext.tsx       # JWT & user state management
├── pages/
│   ├── LoginPage.tsx          # OAuth2 login form
│   ├── Dashboard.tsx          # Protected route
│   └── PipelineBuilder.tsx    # Main canvas
├── services/
│   └── api.ts                 # API client with interceptors
└── App.tsx                    # Routes & Auth provider
```

## API Integration

### Create Pipeline

```typescript
import { pipelineApi } from './services/api';

const pipeline = await pipelineApi.create({
  domain: 'finance',
  name: 'Daily Revenue ETL',
  description: 'Aggregate daily sales'
});
```

### Sync Graph from Canvas

```typescript
await pipelineApi.syncGraph(pipelineId, {
  nodes: [
    { id: 'node-1', type: 'SOURCE', domainService: 'finance', config: {...} }
  ],
  edges: [
    { fromNodeId: 'node-1', toNodeId: 'node-2' }
  ]
});
```

### Run Pipeline

```typescript
const run = await executionApi.runPipeline(pipelineId);
console.log('Run ID:', run.id);

// Check status
const status = await executionApi.getRun(run.id);
```

## Permissions

Canvas checks JWT permissions:

- `pipeline:read` - View pipelines
- `pipeline:write` - Create/edit pipelines
- `pipeline:execute` - Run pipelines
- `pipeline:delete` - Delete pipelines

## Development

```bash
# Run with hot reload
npm run dev
# → http://localhost:5173

# Backend must be running:
# - IAM: http://localhost:8080
# - ETL Control Plane: http://localhost:8083
```

## Production Build

```bash
npm run build
# Output: dist/

# Serve static files
npm run preview
```

## Troubleshooting

### CORS Errors

Backend phải enable CORS cho `http://localhost:5173`:

```java
@Configuration
public class CorsConfig {
  @Bean
  public CorsFilter corsFilter() {
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
    config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
    config.setAllowedHeaders(Arrays.asList("*"));
    config.setAllowCredentials(true);
    source.registerCorsConfiguration("/**", config);
    return new CorsFilter(source);
  }
}
```

### 401 Unauthorized

- Check token trong localStorage
- Verify IAM đang chạy ở port 8080
- Check JWT expiry time

### Backend Connection

```bash
# Check services are running
curl http://localhost:8080/health  # IAM
curl http://localhost:8083/actuator/health  # ETL Control Plane
```

## Screenshots

### Login Page
Modern gradient design với OAuth2 integration

### Pipeline Builder
Drag-and-drop canvas với real-time validation

### Dashboard
Statistics và pipeline monitoring

---

**Ready to build ETL pipelines!** 🚀
