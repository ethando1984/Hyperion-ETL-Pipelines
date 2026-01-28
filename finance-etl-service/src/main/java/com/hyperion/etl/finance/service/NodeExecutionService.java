package com.hyperion.etl.finance.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.hyperion.etl.finance.events.*;
import com.hyperion.etl.finance.executor.SinkExecutor;
import com.hyperion.etl.finance.executor.SourceExecutor;
import com.hyperion.etl.finance.executor.TransformExecutor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Main orchestration service for Finance ETL
 * 
 * Consumes NodeExecuteEvent from Kafka, executes the node, 
 * and publishes completion/failure events.
 * 
 * This demonstrates Data Mesh architecture:
 * - Finance domain owns execution
 * - Independent scaling
 * - Domain-specific logic
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NodeExecutionService {

    private final SourceExecutor sourceExecutor;
    private final TransformExecutor transformExecutor;
    private final SinkExecutor sinkExecutor;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${spring.kafka.topics.node-completed}")
    private String nodeCompletedTopic;

    @Value("${spring.kafka.topics.node-failed}")
    private String nodeFailedTopic;

    @Value("${spring.kafka.topics.data-product-published}")
    private String dataProductPublishedTopic;

    @Value("${finance.etl.domain-name}")
    private String domainName;

    // In-memory cache for node data (in production, use Redis or S3)
    private final Map<UUID, List<Map<String, Object>>> nodeDataCache = new HashMap<>();

    /**
     * Kafka consumer for node execution events
     * Filters only events for finance domain
     */
    @KafkaListener(
        topics = "${spring.kafka.topics.node-execute}",
        groupId = "${spring.kafka.consumer.group-id}",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleNodeExecute(NodeExecuteEvent event) {
        // Filter by domain
        if (!domainName.equals(event.domain())) {
            log.debug("Ignoring event for domain: {}", event.domain());
            return;
        }

        // Set MDC for structured logging
        MDC.put("runId", event.runId().toString());
        MDC.put("nodeId", event.nodeId().toString());
        MDC.put("domain", event.domain());

        try {
            log.info("Executing node: type={}, runId={}, nodeId={}", 
                event.type(), event.runId(), event.nodeId());

            executeNode(event);

        } catch (Exception e) {
            log.error("Node execution failed", e);
            publishFailureEvent(event, e);
        } finally {
            MDC.clear();
        }
    }

    /**
     * Execute node based on type
     */
    private void executeNode(NodeExecuteEvent event) {
        switch (event.type()) {
            case SOURCE -> executeSourceNode(event);
            case TRANSFORM -> executeTransformNode(event);
            case SINK -> executeSinkNode(event);
        }
    }

    /**
     * Execute SOURCE node
     */
    private void executeSourceNode(NodeExecuteEvent event) {
        SourceExecutor.ExecutionResult result = sourceExecutor.execute(event.config());

        if (result.success()) {
            // Cache data for downstream nodes
            nodeDataCache.put(event.nodeId(), result.data());

            // Publish success event
            NodeCompletedEvent completedEvent = NodeCompletedEvent.create(
                event.runId(),
                event.nodeId(),
                result.message(),
                "in-memory", // In production: S3 path
                result.data().size()
            );
            kafkaTemplate.send(nodeCompletedTopic, event.runId().toString(), completedEvent);
            
            log.info("SOURCE node completed: {} records extracted", result.data().size());
        } else {
            publishFailureEvent(event, result.error());
        }
    }

    /**
     * Execute TRANSFORM node
     */
    private void executeTransformNode(NodeExecuteEvent event) {
        // Get input data from cache (in production: read from S3)
        // For simplicity, assuming single input - in reality, would need to track dependencies
        List<Map<String, Object>> inputData = findInputData(event);

        if (inputData == null || inputData.isEmpty()) {
            log.warn("No input data found for TRANSFORM node {}", event.nodeId());
            publishFailureEvent(event, new IllegalStateException("No input data available"));
            return;
        }

        TransformExecutor.ExecutionResult result = transformExecutor.execute(event.config(), inputData);

        if (result.success()) {
            // Cache transformed data
            nodeDataCache.put(event.nodeId(), result.data());

            NodeCompletedEvent completedEvent = NodeCompletedEvent.create(
                event.runId(),
                event.nodeId(),
                result.message(),
                "in-memory",
                result.data().size()
            );
            kafkaTemplate.send(nodeCompletedTopic, event.runId().toString(), completedEvent);

            log.info("TRANSFORM node completed: {} records processed", result.data().size());
        } else {
            publishFailureEvent(event, result.error());
        }
    }

    /**
     * Execute SINK node
     */
    private void executeSinkNode(NodeExecuteEvent event) {
        List<Map<String, Object>> inputData = findInputData(event);

        if (inputData == null || inputData.isEmpty()) {
            log.warn("No input data found for SINK node {}", event.nodeId());
            publishFailureEvent(event, new IllegalStateException("No input data available"));
            return;
        }

        SinkExecutor.ExecutionResult result = sinkExecutor.execute(event.config(), inputData);

        if (result.success()) {
            NodeCompletedEvent completedEvent = NodeCompletedEvent.create(
                event.runId(),
                event.nodeId(),
                result.message(),
                result.outputReference(),
                result.recordsWritten()
            );
            kafkaTemplate.send(nodeCompletedTopic, event.runId().toString(), completedEvent);

            // Publish data product event
            publishDataProduct(event, result);

            log.info("SINK node completed: {} records written to {}", 
                result.recordsWritten(), result.outputReference());

            // Clean up cache
            nodeDataCache.clear();
        } else {
            publishFailureEvent(event, result.error());
        }
    }

    /**
     * Find input data for current node (simplified - assumes single input)
     */
    private List<Map<String, Object>> findInputData(NodeExecuteEvent event) {
        // In production: use DAG to find predecessor nodes and read from S3
        // For now: return first cached data
        return nodeDataCache.values().stream()
            .findFirst()
            .orElse(null);
    }

    /**
     * Publish failure event
     */
    private void publishFailureEvent(NodeExecuteEvent event, Exception error) {
        StringWriter sw = new StringWriter();
        error.printStackTrace(new PrintWriter(sw));

        NodeFailedEvent failedEvent = NodeFailedEvent.create(
            event.runId(),
            event.nodeId(),
            error.getMessage(),
            sw.toString()
        );

        kafkaTemplate.send(nodeFailedTopic, event.runId().toString(), failedEvent);
        log.error("Published failure event for node {}", event.nodeId());
    }

    /**
     * Publish data product event
     */
    private void publishDataProduct(NodeExecuteEvent event, SinkExecutor.ExecutionResult result) {
        JsonNode config = event.config();
        String productName = config.has("productName") 
            ? config.get("productName").asText() 
            : config.get("table").asText();

        DataProductPublishedEvent dataProduct = DataProductPublishedEvent.create(
            event.runId(),
            domainName,
            productName,
            result.outputReference(),
            "1.0", // Schema version
            result.recordsWritten()
        );

        kafkaTemplate.send(dataProductPublishedTopic, event.runId().toString(), dataProduct);
        log.info("Published data product: {}", productName);
    }
}
