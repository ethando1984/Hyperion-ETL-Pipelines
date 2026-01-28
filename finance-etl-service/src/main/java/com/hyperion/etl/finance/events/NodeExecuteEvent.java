package com.hyperion.etl.finance.events;

import com.fasterxml.jackson.databind.JsonNode;

import java.time.Instant;
import java.util.UUID;

/**
 * Event consumed from Control Plane to execute a node
 * Mirrors the event schema from control-plane
 */
public record NodeExecuteEvent(
    UUID runId,
    UUID nodeId,
    UUID pipelineId,
    String domain,
    NodeType type,
    String domainService,
    JsonNode config,
    Instant timestamp
) {
    public enum NodeType {
        SOURCE, TRANSFORM, SINK
    }
}
