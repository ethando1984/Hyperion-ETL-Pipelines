FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy JAR file
COPY target/*.jar app.jar

# Expose port
EXPOSE 8083

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8083/actuator/health || exit 1

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]
