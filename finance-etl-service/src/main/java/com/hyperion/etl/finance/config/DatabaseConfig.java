package com.hyperion.etl.finance.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

/**
 * Database configuration for Finance domain
 * 
 * Creates two data sources:
 * - Source database (where raw data comes from)
 * - Warehouse database (where processed data is stored)
 */
@Configuration
public class DatabaseConfig {

    @Value("${finance.etl.source.jdbc-url}")
    private String sourceJdbcUrl;

    @Value("${finance.etl.source.username}")
    private String sourceUsername;

    @Value("${finance.etl.source.password}")
    private String sourcePassword;

    @Value("${finance.etl.source.maximum-pool-size}")
    private int sourceMaxPoolSize;

    @Value("${finance.etl.warehouse.jdbc-url}")
    private String warehouseJdbcUrl;

    @Value("${finance.etl.warehouse.username}")
    private String warehouseUsername;

    @Value("${finance.etl.warehouse.password}")
    private String warehousePassword;

    @Value("${finance.etl.warehouse.maximum-pool-size}")
    private int warehouseMaxPoolSize;

    /**
     * Source database connection pool
     */
    @Bean(name = "sourceDataSource")
    public DataSource sourceDataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(sourceJdbcUrl);
        config.setUsername(sourceUsername);
        config.setPassword(sourcePassword);
        config.setMaximumPoolSize(sourceMaxPoolSize);
        config.setPoolName("FinanceSourcePool");
        config.setConnectionTimeout(30000);
        return new HikariDataSource(config);
    }

    /**
     * Warehouse database connection pool
     */
    @Bean(name = "warehouseDataSource")
    @Primary
    public DataSource warehouseDataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(warehouseJdbcUrl);
        config.setUsername(warehouseUsername);
        config.setPassword(warehousePassword);
        config.setMaximumPoolSize(warehouseMaxPoolSize);
        config.setPoolName("FinanceWarehousePool");
        config.setConnectionTimeout(30000);
        return new HikariDataSource(config);
    }
}
