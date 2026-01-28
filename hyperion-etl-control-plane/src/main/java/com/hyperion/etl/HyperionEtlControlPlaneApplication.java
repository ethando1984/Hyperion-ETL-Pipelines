package com.hyperion.etl;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Hyperion ETL Control Plane - Main Application
 * 
 * Enterprise-grade ETL orchestration platform using Data Mesh architecture.
 * This service acts as the control plane, orchestrating ETL executions across
 * domain-specific services via Kafka events.
 * 
 * Key Features:
 * - OAuth2/JWT security from Hyperion-IAM
 * - Permission-based RBAC (no tenant isolation)
 * - Event-driven execution via Kafka
 * - DAG validation for pipeline graphs
 * - Virtual Threads for async execution (Java 21)
 */
@SpringBootApplication
public class HyperionEtlControlPlaneApplication {

    public static void main(String[] args) {
        java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone("UTC"));
        SpringApplication.run(HyperionEtlControlPlaneApplication.class, args);
    }
}
