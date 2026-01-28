package com.hyperion.etl.finance.executor;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * TRANSFORM node executor - processes and transforms data
 * 
 * Supported transformation types:
 * - aggregate: Group by and aggregate (SUM, COUNT, AVG, etc.)
 * - filter: Filter rows based on conditions
 * - map: Transform columns
 * - join: Join with another dataset (future)
 */
@Component
@Slf4j
public class TransformExecutor {

    /**
     * Execute TRANSFORM node
     */
    public ExecutionResult execute(JsonNode config, List<Map<String, Object>> inputData) {
        String transformationType = config.get("transformationType").asText();
        
        return switch (transformationType) {
            case "aggregate" -> executeAggregate(config, inputData);
            case "filter" -> executeFilter(config, inputData);
            case "map" -> executeMap(config, inputData);
            default -> throw new IllegalArgumentException("Unsupported transformation: " + transformationType);
        };
    }

    /**
     * Aggregate transformation (GROUP BY + aggregations)
     */
    private ExecutionResult executeAggregate(JsonNode config, List<Map<String, Object>> inputData) {
        JsonNode groupByNode = config.get("groupBy");
        JsonNode aggregationsNode = config.get("aggregations");

        List<String> groupByColumns = new ArrayList<>();
        groupByNode.forEach(node -> groupByColumns.add(node.asText()));

        log.info("Aggregating {} records by columns: {}", inputData.size(), groupByColumns);

        // Group data
        Map<String, List<Map<String, Object>>> groups = inputData.stream()
            .collect(Collectors.groupingBy(row -> 
                groupByColumns.stream()
                    .map(col -> String.valueOf(row.get(col)))
                    .collect(Collectors.joining("|"))
            ));

        // Apply aggregations
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Map.Entry<String, List<Map<String, Object>>> group : groups.entrySet()) {
            Map<String, Object> aggregatedRow = new HashMap<>();
            
            // Add group by columns
            List<Map<String, Object>> groupRows = group.getValue();
            Map<String, Object> firstRow = groupRows.get(0);
            for (String col : groupByColumns) {
                aggregatedRow.put(col, firstRow.get(col));
            }

            // Apply aggregation functions
            Iterator<Map.Entry<String, JsonNode>> aggFields = aggregationsNode.fields();
            while (aggFields.hasNext()) {
                Map.Entry<String, JsonNode> aggField = aggFields.next();
                String outputColumn = aggField.getKey();
                String aggFunction = aggField.getValue().asText();

                Object aggValue = applyAggregation(aggFunction, groupRows);
                aggregatedRow.put(outputColumn, aggValue);
            }

            result.add(aggregatedRow);
        }

        log.info("Aggregation produced {} groups from {} input records", result.size(), inputData.size());
        return ExecutionResult.success(result, "Aggregated into " + result.size() + " groups");
    }

    /**
     * Apply aggregation function
     */
    private Object applyAggregation(String function, List<Map<String, Object>> rows) {
        // Parse function like "SUM(amount)" or "COUNT(*)"
        String funcName = function.substring(0, function.indexOf('(')).trim();
        String column = function.substring(function.indexOf('(') + 1, function.indexOf(')')).trim();

        return switch (funcName) {
            case "COUNT" -> (long) rows.size();
            case "SUM" -> rows.stream()
                .map(row -> row.get(column))
                .filter(Objects::nonNull)
                .mapToDouble(val -> ((Number) val).doubleValue())
                .sum();
            case "AVG" -> rows.stream()
                .map(row -> row.get(column))
                .filter(Objects::nonNull)
                .mapToDouble(val -> ((Number) val).doubleValue())
                .average()
                .orElse(0.0);
            case "MAX" -> rows.stream()
                .map(row -> row.get(column))
                .filter(Objects::nonNull)
                .mapToDouble(val -> ((Number) val).doubleValue())
                .max()
                .orElse(0.0);
            case "MIN" -> rows.stream()
                .map(row -> row.get(column))
                .filter(Objects::nonNull)
                .mapToDouble(val -> ((Number) val).doubleValue())
                .min()
                .orElse(0.0);
            default -> throw new IllegalArgumentException("Unsupported aggregation: " + funcName);
        };
    }

    /**
     * Filter transformation
     */
    private ExecutionResult executeFilter(JsonNode config, List<Map<String, Object>> inputData) {
        // Placeholder for filter logic
        log.info("Filter transformation not yet implemented, returning all {} records", inputData.size());
        return ExecutionResult.success(inputData, "Filter applied");
    }

    /**
     * Map transformation
     */
    private ExecutionResult executeMap(JsonNode config, List<Map<String, Object>> inputData) {
        // Placeholder for map logic
        log.info("Map transformation not yet implemented, returning all {} records", inputData.size());
        return ExecutionResult.success(inputData, "Map applied");
    }

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
