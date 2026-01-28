# Hyperion-ETL Pipelines

Enterprise-grade ETL orchestration platform using **Data Mesh architecture**, powered by Java 21 & Spring Boot 3.x.

## 🎯 Architecture Overview

```
React ETL Canvas (UI)
      ↓ (JWT from Hyperion-IAM)
Control Plane (Orchestration)
      ↓ (Kafka Events)
Domain ETL Services (Execution)
```

### Key Features

- ✅ **Data Mesh Architecture** - Decentralized domain ownership
- ✅ **Permission-Based RBAC** - No tenant isolation (OAuth2/JWT only)
- ✅ **Event-Driven Execution** - Kafka-based async orchestration
- ✅ **DAG Validation** - Cycle detection, edge compatibility
- ✅ **Virtual Threads** - Java 21 async execution
- ✅ **OpenAPI Documentation** - Auto-generated Swagger UI

---

## 📦 Project Structure

```
hyperion-etl-pipelines/
├── hyperion-etl-control-plane/    # Orchestration service
│   ├── src/main/java/com/hyperion/etl/
│   │   ├── api/                   # REST controllers
│   │   ├── domain/                # Domain models (records)
│   │   ├── service/               # Business logic
│   │   ├── mapper/                # MyBatis mappers
│   │   ├── security/              # OAuth2 + Permission evaluator
│   │   ├── events/                # Kafka event schemas
│   │   └── config/                # Configuration
│   └── src/main/resources/
│       ├── db/changelog/          # Liquibase migrations
│       └── mapper/                # MyBatis XML mappers
├── finance-etl-service/           # Example domain service
├── hyperion-etl-canvas/           # React UI (drag-drop DAG editor)
└── docker-compose.yml
```

---

## 🚀 Quick Start

### Prerequisites

- Java 21+
- PostgreSQL 16+
- Apache Kafka 3.5+
- Maven 3.9+

### 1. Start Infrastructure

```bash
docker-compose up -d postgres kafka zookeeper
```

### 2. Run Control Plane

```bash
cd hyperion-etl-control-plane
mvn spring-boot:run
```

The service will start on **http://localhost:8083**

- Swagger UI: http://localhost:8083/swagger-ui.html
- Health Check: http://localhost:8083/actuator/health

### 3. Run React Canvas (Optional)

```bash
cd hyperion-etl-canvas
npm install
npm run dev
```

---

## 🔐 Authentication & Permissions

All endpoints require **OAuth2 JWT** from **Hyperion-IAM** (port 8080).

### Required JWT Claims

```json
{
  "sub": "user@email.com",
  "userId": "uuid",
  "permissions": [
    "etl:pipeline:WRITE",
    "etl:run:RUN",
    "*:READ"
  ]
}
```

### Permission Catalog

| Resource | Actions | Example |
|----------|---------|---------|
| `etl:pipeline` | READ, WRITE, DELETE | `etl:pipeline:WRITE` |
| `etl:run` | RUN, STOP, READ | `etl:run:RUN` |
| `etl:log` | READ | `etl:log:READ` |
| `etl:node` | VALIDATE | `etl:node:VALIDATE` |
| `etl:schema` | READ, WRITE | `etl:schema:WRITE` |

**Wildcard Support**:
- `*:*` - Full access
- `etl:pipeline:*` - All actions on pipelines
- `*:READ` - Read any resource

---

## 📊 API Examples

### Create Pipeline

```bash
curl -X POST http://localhost:8083/api/pipelines \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "finance",
    "name": "Daily Revenue ETL",
    "description": "Aggregates daily revenue"
  }'
```

### Sync Graph from Canvas

```bash
curl -X PUT http://localhost:8083/api/pipelines/{id}/graph \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d @examples/finance-daily-etl.json
```

### Validate Pipeline

```bash
curl -X POST http://localhost:8083/api/pipelines/{id}/validate \
  -H "Authorization: Bearer <JWT>"
```

### Run Pipeline

```bash
curl -X POST http://localhost:8083/api/pipelines/{id}/run \
  -H "Authorization: Bearer <JWT>"
```

### Get Run Status

```bash
curl http://localhost:8083/api/runs/{runId} \
  -H "Authorization: Bearer <JWT>"
```

---

## 🧠 DAG Validation Rules

1. **No Cycles** - Pipeline must be a DAG (Directed Acyclic Graph)
2. **Required Nodes** - At least 1 SOURCE and 1 SINK
3. **Edge Compatibility**:
   - ✅ SOURCE → TRANSFORM
   - ✅ TRANSFORM → TRANSFORM
   - ✅ TRANSFORM → SINK
   - ❌ SOURCE → SOURCE
   - ❌ SINK → *

---

## 🔁 Execution Flow

1. User clicks **Run** in React Canvas
2. Control Plane:
   - Validates DAG structure
   - Checks `etl:run:RUN` permission
   - Creates `PipelineRun` record
   - Emits Kafka events in topological order
3. Domain ETL Service (e.g., `finance-etl`):
   - Consumes `etl.node.execute` events
   - Executes node logic (read data, transform, write)
   - Publishes `etl.node.completed` or `etl.node.failed`
4. Control Plane updates run status

---

## 🔌 Kafka Topics

| Topic | Purpose |
|-------|---------|
| `etl.pipeline.run` | Pipeline execution started |
| `etl.node.execute` | Node execution command |
| `etl.node.completed` | Node execution success |
| `etl.node.failed` | Node execution failure |
| `etl.data.product.published` | Data product ready |

---

## 🗄️ Database Schema

Tables:
- `pipelines` - Pipeline definitions
- `pipeline_nodes` - Nodes in graph
- `pipeline_edges` - Edges connecting nodes
- `pipeline_runs` - Execution instances
- `execution_logs` - Structured logs per run

Migrations managed by **Liquibase** in `src/main/resources/db/changelog/`

---

## 📈 Observability

### Metrics (Prometheus)

- `etl.run.duration` - Pipeline execution time
- `etl.node.failure.rate` - Node failure rate
- `etl.runs.active` - Currently running pipelines

Access metrics: http://localhost:8083/actuator/prometheus

### Structured Logging

JSON logs with MDC context:
```json
{
  "timestamp": "2026-01-28T15:30:00Z",
  "level": "INFO",
  "runId": "uuid",
  "nodeId": "uuid",
  "domain": "finance",
  "message": "Node execution completed"
}
```

---

## 🧪 Testing

```bash
# Unit + Integration Tests
mvn clean verify

# Run with test containers
mvn verify -Dspring.profiles.active=test
```

---

## 🌐 Deployment

### Environment Variables

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/hyperion_etl
SPRING_KAFKA_BOOTSTRAP_SERVERS=localhost:9092
SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUER_URI=http://localhost:8080
```

### Docker Build

```bash
docker build -t hyperion-etl-control-plane:latest ./hyperion-etl-control-plane
docker-compose up -d
```

---

## 🎨 React Canvas Integration

The UI already exists in `hyperion-etl-canvas/`. Key integration points:

1. **Graph Sync**: PUT `/api/pipelines/{id}/graph`
2. **Validation**: POST `/api/pipelines/{id}/validate`
3. **Execution**: POST `/api/pipelines/{id}/run`
4. **Status Polling**: GET `/api/runs/{id}`

---

## 📚 Additional Resources

- [OpenAPI Docs](http://localhost:8083/swagger-ui.html)
- [Health Check](http://localhost:8083/actuator/health)
- [Metrics](http://localhost:8083/actuator/prometheus)

---

## 🔒 Security Notes

- **No tenant isolation** - All authorization via permissions
- **Audit logging** - RUN/DELETE actions logged with user
- **JWT validation** - All requests require valid token from Hyperion-IAM
- **CORS enabled** - Configured for React Canvas (ports 3000, 5173)

---

## 📝 License

Proprietary - Hyperion Platform
