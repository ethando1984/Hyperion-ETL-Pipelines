package com.hyperion.etl.events;

import java.time.Instant;
import java.util.UUID;

/**
 * Event published when a pipeline run starts
 */
public record PipelineRunEvent(
        UUID runId,
        UUID pipelineId,
        String domain,
        String triggeredBy,
        Instant timestamp) {
    public static PipelineRunEvent create(UUID runId, UUID pipelineId, String domain, String triggeredBy) {
        return new PipelineRunEvent(runId, pipelineId, domain, triggeredBy, Instant.now());
    }
}
