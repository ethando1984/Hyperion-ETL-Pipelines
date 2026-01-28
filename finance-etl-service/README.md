# Finance ETL Service

Domain-owned ETL execution service for **Finance domain** (Data Mesh architecture).

## Purpose

This service demonstrates the Data Mesh pattern where:
- **Finance domain owns its ETL runtime**
- Consumes events from Control Plane (`etl.node.execute`)
- Executes SOURCE, TRANSFORM, and SINK nodes
- Publishes completion events and data products
- **Independent deployment and scaling**

## Architecture

```
Control Plane (8083)
      ↓ Kafka: etl.node.execute
Finance ETL Service (8084)
      ├─ SourceExecutor → Read from source DB
      ├─ TransformExecutor → Aggregate/transform
      └─ SinkExecutor → Write to warehouse
      ↓ Kafka: etl.node.completed
Control Plane receives status
```

## Supported Operations

### SOURCE Node
- **PostgreSQL**: Execute SQL query and extract data
- **REST API**: Call external APIs (placeholder)
- **S3**: Read from S3 (future)

### TRANSFORM Node
- **Aggregate**: GROUP BY with aggregations (SUM, COUNT, AVG, MAX, MIN)
- **Filter**: Filter rows by conditions (future)
- **Map**: Transform columns (future)

### SINK Node
- **PostgreSQL**: Write to warehouse with append/overwrite modes
- **Snowflake**: Same as PostgreSQL (uses JDBC)
- **S3**: Write Parquet files (future)

## Configuration

See `application.yml`:

```yaml
finance:
  etl:
    domain-name: finance
    source:
      jdbc-url: jdbc:postgresql://localhost:5432/finance_source
    warehouse:
      jdbc-url: jdbc:postgresql://localhost:5432/finance_warehouse
```

## Running

```bash
# Start service
cd finance-etl-service
mvn spring-boot:run
```

Service starts on **port 8084**.

## Example: Daily Revenue Pipeline

When Control Plane triggers execution of the example pipeline:

1. **SOURCE node**: Reads transactions from `finance_source.transactions`
2. **TRANSFORM node**: Aggregates by date (SUM, COUNT, AVG)
3. **SINK node**: Writes to `finance_warehouse.daily_revenue`

Events published:
- `etl.node.completed` (3 times, one per node)
- `etl.data.product.published` (daily_revenue data product)

## Data Products

Finance domain publishes data products like:
- `daily_revenue` - Aggregated transaction data
- `customer_lifetime_value` - Customer analytics
- `revenue_forecasts` - ML predictions

These are discoverable by other domains via the data product catalog.

## Scaling

This service can be scaled independently:
```bash
# Run 3 instances
docker-compose up -d --scale finance-etl=3
```

Kafka consumer group ensures load balancing.

## Metrics

- `finance.etl.node.execution.duration` - How long nodes take
- `finance.etl.node.failure.rate` - Failure rate per node type
- `finance.etl.records.processed` - Throughput

Access: http://localhost:8084/actuator/prometheus

## Domain Autonomy

Finance team decides:
- ✅ Source systems (their databases)
- ✅ Transformation logic (business rules)
- ✅ Storage format (warehouse schema)
- ✅ Scaling strategy
- ✅ Technology choices within domain

Control Plane **cannot** dictate these.

## Future Enhancements

- [ ] S3 source/sink support
- [ ] Real-time streaming with Kafka Streams
- [ ] Data quality validation
- [ ] Schema evolution handling
- [ ] Data lineage tracking
- [ ] Custom UDFs for transforms
