#!/bin/bash

# Quick start script for Hyperion-ETL platform
echo "🚀 Starting Hyperion-ETL Platform..."

# Check prerequisites
echo "📋 Checking prerequisites..."
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }
command -v mvn >/dev/null 2>&1 || { echo "❌ Maven is required but not installed. Aborting." >&2; exit 1; }
echo "✅ Prerequisites OK"

# Start infrastructure
echo "🐘 Starting PostgreSQL and Kafka..."
docker-compose up -d postgres kafka zookeeper

# Wait for services
echo "⏳ Waiting for services to be healthy..."
sleep 15

# Build all services
echo "🔨 Building services..."
mvn clean package -DskipTests

# Start Control Plane
echo "🎮 Starting Control Plane (port 8083)..."
cd hyperion-etl-control-plane
mvn spring-boot:run &
CONTROL_PLANE_PID=$!
cd ..

# Wait for Control Plane
sleep 20

# Start Finance ETL Service
echo "💰 Starting Finance ETL Service (port 8084)..."
cd finance-etl-service
mvn spring-boot:run &
FINANCE_ETL_PID=$!
cd ..

echo ""
echo "✅ Hyperion-ETL Platform is running!"
echo ""
echo "📊 Services:"
echo "   - Control Plane: http://localhost:8083"
echo "   - Swagger UI: http://localhost:8083/swagger-ui.html"
echo "   - Finance ETL: http://localhost:8084"
echo "   - Actuator: http://localhost:8083/actuator/health"
echo ""
echo "🛑 To stop, run: kill $CONTROL_PLANE_PID $FINANCE_ETL_PID"
echo "   Or press Ctrl+C"

# Wait for termination
wait
