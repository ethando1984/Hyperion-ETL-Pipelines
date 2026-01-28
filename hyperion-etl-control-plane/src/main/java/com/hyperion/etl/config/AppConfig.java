package com.hyperion.etl.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Application-wide configuration
 */
@Configuration
@EnableKafka
public class AppConfig {

    /**
     * Virtual Thread Executor for async ETL execution
     */
    @Bean(name = "etlExecutor")
    public ExecutorService etlExecutor() {
        return Executors.newVirtualThreadPerTaskExecutor();
    }
}
