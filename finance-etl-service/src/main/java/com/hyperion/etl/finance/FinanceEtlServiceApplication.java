package com.hyperion.etl.finance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.EnableKafka;

/**
 * Finance ETL Service - Domain-owned ETL execution service
 * 
 * This service demonstrates the Data Mesh architecture where:
 * - Finance domain owns its ETL runtime
 * - Consumes events from Control Plane
 * - Executes domain-specific data transformations
 * - Publishes data products
 * 
 * Port: 8084
 * Domain: finance
 */
@SpringBootApplication
@EnableKafka
public class FinanceEtlServiceApplication {

    public static void main(String[] args) {
        java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone("UTC"));
        SpringApplication.run(FinanceEtlServiceApplication.class, args);
    }
}
