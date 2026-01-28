package com.hyperion.etl.events;

import java.time.Instant;
import java.util.UUID;

/**
 * Event published when a node fails during execution
 */
public record NodeFailedEvent(
        UUID runId,
        UUID nodeId,
        String errorMessage,
        Instant timestamp) {
    public static NodeFailedEvent create(UUID runId, UUID nodeId, String errorMessage) {
        return new NodeFailedEvent(runId, nodeId, errorMessage, Instant.now());
    }
}
