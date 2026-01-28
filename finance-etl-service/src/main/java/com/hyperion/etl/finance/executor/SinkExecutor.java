package com.hyperion.etl.finance.executor;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * SINK node executor - writes data to target systems
 * 
 * Supported sink types:
 * - postgresql: Write to PostgreSQL database
 * - snowflake: Write to Snowflake (placeholder)
 * - s3: Write to S3 (future)
 */
@Component
@Slf4j
public class SinkExecutor {

    private final DataSource warehouseDataSource;

    public SinkExecutor(@Qualifier("warehouseDataSource") DataSource warehouseDataSource) {
        this.warehouseDataSource = warehouseDataSource;
    }

    /**
     * Execute SINK node
     */
    public ExecutionResult execute(JsonNode config, List<Map<String, Object>> inputData) {
        String sinkType = config.get("sinkType").asText();
        
        return switch (sinkType) {
            case "postgresql", "snowflake" -> executePostgreSQLSink(config, inputData);
            default -> throw new IllegalArgumentException("Unsupported sink type: " + sinkType);
        };
    }

    /**
     * Write to PostgreSQL/Snowflake warehouse
     */
    private ExecutionResult executePostgreSQLSink(JsonNode config, List<Map<String, Object>> inputData) {
        String table = config.get("table").asText();
        String writeMode = config.get("writeMode").asText("append"); // append or overwrite

        if (inputData.isEmpty()) {
            log.warn("No data to write to table {}", table);
            return ExecutionResult.success(0, table, "No data to write");
        }

        log.info("Writing {} records to table {} (mode: {})", inputData.size(), table, writeMode);

        try (Connection conn = warehouseDataSource.getConnection()) {
            conn.setAutoCommit(false);

            // Clear table if overwrite mode
            if ("overwrite".equalsIgnoreCase(writeMode)) {
                try (PreparedStatement stmt = conn.prepareStatement("DELETE FROM " + table)) {
                    stmt.executeUpdate();
                    log.info("Cleared table {} for overwrite", table);
                }
            }

            // Build INSERT statement
            Map<String, Object> firstRow = inputData.get(0);
            List<String> columns = firstRow.keySet().stream().toList();
            
            String columnNames = String.join(", ", columns);
            String placeholders = columns.stream().map(c -> "?").collect(Collectors.joining(", "));
            String insertSql = String.format("INSERT INTO %s (%s) VALUES (%s)", table, columnNames, placeholders);

            // Batch insert
            try (PreparedStatement stmt = conn.prepareStatement(insertSql)) {
                for (Map<String, Object> row : inputData) {
                    int paramIndex = 1;
                    for (String column : columns) {
                        stmt.setObject(paramIndex++, row.get(column));
                    }
                    stmt.addBatch();
                }

                int[] results = stmt.executeBatch();
                conn.commit();

                log.info("Successfully wrote {} records to {}", results.length, table);
                return ExecutionResult.success(results.length, table, 
                    "Wrote " + results.length + " records to " + table);
            }

        } catch (SQLException e) {
            log.error("Failed to write to table {}", table, e);
            return ExecutionResult.failure("Database write error: " + e.getMessage(), e);
        }
    }

    public record ExecutionResult(
        boolean success,
        long recordsWritten,
        String outputReference,
        String message,
        Exception error
    ) {
        public static ExecutionResult success(long recordsWritten, String outputReference, String message) {
            return new ExecutionResult(true, recordsWritten, outputReference, message, null);
        }

        public static ExecutionResult failure(String message, Exception error) {
            return new ExecutionResult(false, 0, null, message, error);
        }
    }
}
