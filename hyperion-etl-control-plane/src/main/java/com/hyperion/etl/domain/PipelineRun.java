package com.hyperion.etl.domain;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.Instant;
import java.util.UUID;

/**
 * PipelineRun - Represents an execution instance of a pipeline
 * 
 * Tracks the execution state, timing, and outcome of a pipeline run.
 * Each run is orchestrated by the control plane and executed by domain
 * services.
 * 
 * @param id           Unique identifier
 * @param pipelineId   Pipeline being executed
 * @param status       Current execution status
 * @param startedAt    Timestamp when execution started
 * @param finishedAt   Timestamp when execution finished (null if still running)
 * @param triggeredBy  User who triggered the run (from JWT sub claim)
 * @param errorMessage Error message if run failed
 */
public record PipelineRun(
        UUID id,
        UUID pipelineId,
        PipelineRunStatus status,

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "UTC") Instant startedAt,

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "UTC") Instant finishedAt,

        String triggeredBy,
        String errorMessage) {
    /**
     * Create a new pending run
     */
    public static PipelineRun createPending(UUID pipelineId, String triggeredBy) {
        return new PipelineRun(
                UUID.randomUUID(),
                pipelineId,
                PipelineRunStatus.PENDING,
                null,
                null,
                triggeredBy,
                null);
    }

    /**
     * Start the run
     */
    public PipelineRun start() {
        return new PipelineRun(
                id,
                pipelineId,
                PipelineRunStatus.RUNNING,
                Instant.now(),
                null,
                triggeredBy,
                null);
    }

    /**
     * Mark run as successful
     */
    public PipelineRun complete() {
        return new PipelineRun(
                id,
                pipelineId,
                PipelineRunStatus.SUCCESS,
                startedAt,
                Instant.now(),
                triggeredBy,
                null);
    }

    /**
     * Mark run as failed
     */
    public PipelineRun fail(String errorMessage) {
        return new PipelineRun(
                id,
                pipelineId,
                PipelineRunStatus.FAILED,
                startedAt,
                Instant.now(),
                triggeredBy,
                errorMessage);
    }

    /**
     * Mark run as stopped
     */
    public PipelineRun stop() {
        return new PipelineRun(
                id,
                pipelineId,
                PipelineRunStatus.STOPPED,
                startedAt,
                Instant.now(),
                triggeredBy,
                null);
    }
}
