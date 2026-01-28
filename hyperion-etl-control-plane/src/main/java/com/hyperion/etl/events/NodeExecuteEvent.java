package com.hyperion.etl.events;

import com.fasterxml.jackson.databind.JsonNode;
import com.hyperion.etl.domain.NodeType;

import java.time.Instant;
import java.util.UUID;

/**
 * Event published when a node should be executed
 * Consumed by domain-specific ETL services
 */
public record NodeExecuteEvent(
        UUID runId,
        UUID nodeId,
        UUID pipelineId,
        String domain,
        NodeType type,
        String domainService,
        JsonNode config,
        Instant timestamp) {
    public static NodeExecuteEvent create(
            UUID runId,
            UUID nodeId,
            UUID pipelineId,
            String domain,
            NodeType type,
            String domainService,
            JsonNode config) {
        return new NodeExecuteEvent(
                runId,
                nodeId,
                pipelineId,
                domain,
                type,
                domainService,
                config,
                Instant.now());
    }
}
