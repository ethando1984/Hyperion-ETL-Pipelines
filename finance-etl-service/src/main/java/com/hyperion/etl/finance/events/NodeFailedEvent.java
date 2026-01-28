package com.hyperion.etl.finance.events;

import java.time.Instant;
import java.util.UUID;

/**
 * Event published when a node execution fails
 */
public record NodeFailedEvent(
    UUID runId,
    UUID nodeId,
    String errorMessage,
    String stackTrace,
    Instant timestamp
) {
    public static NodeFailedEvent create(UUID runId, UUID nodeId, String errorMessage, String stackTrace) {
        return new NodeFailedEvent(runId, nodeId, errorMessage, stackTrace, Instant.now());
    }
}
