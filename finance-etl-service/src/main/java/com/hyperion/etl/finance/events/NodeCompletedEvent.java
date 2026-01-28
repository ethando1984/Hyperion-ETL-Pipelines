package com.hyperion.etl.finance.events;

import java.time.Instant;
import java.util.UUID;

/**
 * Event published when a node completes successfully
 */
public record NodeCompletedEvent(
    UUID runId,
    UUID nodeId,
    String message,
    String outputReference,  // S3/warehouse location
    long recordsProcessed,
    Instant timestamp
) {
    public static NodeCompletedEvent create(
        UUID runId, 
        UUID nodeId, 
        String message,
        String outputReference,
        long recordsProcessed
    ) {
        return new NodeCompletedEvent(
            runId, 
            nodeId, 
            message,
            outputReference,
            recordsProcessed,
            Instant.now()
        );
    }
}
