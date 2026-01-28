package com.hyperion.etl.finance.events;

import java.time.Instant;
import java.util.UUID;

/**
 * Event published when a data product is ready
 */
public record DataProductPublishedEvent(
    UUID runId,
    String domain,
    String productName,
    String location,
    String schemaVersion,
    long recordCount,
    Instant timestamp
) {
    public static DataProductPublishedEvent create(
        UUID runId,
        String domain,
        String productName,
        String location,
        String schemaVersion,
        long recordCount
    ) {
        return new DataProductPublishedEvent(
            runId,
            domain,
            productName,
            location,
            schemaVersion,
            recordCount,
            Instant.now()
        );
    }
}
