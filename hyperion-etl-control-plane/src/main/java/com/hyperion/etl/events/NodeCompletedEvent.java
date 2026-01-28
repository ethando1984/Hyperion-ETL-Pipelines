package com.hyperion.etl.events;

import java.time.Instant;
import java.util.UUID;

/**
 * Event published when a node completes successfully
 */
public record NodeCompletedEvent(
        UUID runId,
        UUID nodeId,
        String message,
        Instant timestamp) {
    public static NodeCompletedEvent create(UUID runId, UUID nodeId, String message) {
        return new NodeCompletedEvent(runId, nodeId, message, Instant.now());
    }
}
