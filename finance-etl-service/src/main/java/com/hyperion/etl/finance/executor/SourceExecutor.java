package com.hyperion.etl.finance.executor;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * SOURCE node executor - reads data from external sources
 * 
 * Supported source types:
 * - postgresql: Read from PostgreSQL database
 * - rest-api: Call REST API (future)
 * - s3: Read from S3 (future)
 */
@Component
@Slf4j
public class SourceExecutor {

    private final DataSource sourceDataSource;

    public SourceExecutor(@Qualifier("sourceDataSource") DataSource sourceDataSource) {
        this.sourceDataSource = sourceDataSource;
    }

    /**
     * Execute SOURCE node and return data
     */
    public ExecutionResult execute(JsonNode config) {
        String sourceType = config.get("sourceType").asText();
        
        return switch (sourceType) {
            case "postgresql" -> executePostgreSQLSource(config);
            case "rest-api" -> executeRestApiSource(config);
            default -> throw new IllegalArgumentException("Unsupported source type: " + sourceType);
        };
    }

    /**
     * Read from PostgreSQL database
     */
    private ExecutionResult executePostgreSQLSource(JsonNode config) {
        String query = config.get("query").asText();
        log.info("Executing PostgreSQL source query: {}", query);

        List<Map<String, Object>> rows = new ArrayList<>();
        
        try (Connection conn = sourceDataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query);
             ResultSet rs = stmt.executeQuery()) {

            int columnCount = rs.getMetaData().getColumnCount();
            
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                for (int i = 1; i <= columnCount; i++) {
                    String columnName = rs.getMetaData().getColumnName(i);
                    row.put(columnName, rs.getObject(i));
                }
                rows.add(row);
            }

            log.info("Source extracted {} records from database", rows.size());
            return ExecutionResult.success(rows, "Extracted " + rows.size() + " records");

        } catch (SQLException e) {
            log.error("Failed to execute source query", e);
            return ExecutionResult.failure("Database error: " + e.getMessage(), e);
        }
    }

    /**
     * Call REST API (placeholder)
     */
    private ExecutionResult executeRestApiSource(JsonNode config) {
        // TODO: Implement REST API source
        return ExecutionResult.success(List.of(), "REST API source not yet implemented");
    }

    /**
     * Execution result wrapper
     */
    public record ExecutionResult(
        boolean success,
        List<Map<String, Object>> data,
        String message,
        Exception error
    ) {
        public static ExecutionResult success(List<Map<String, Object>> data, String message) {
            return new ExecutionResult(true, data, message, null);
        }

        public static ExecutionResult failure(String message, Exception error) {
            return new ExecutionResult(false, List.of(), message, error);
        }
    }
}
