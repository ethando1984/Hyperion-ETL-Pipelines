package com.hyperion.etl.domain;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.Instant;
import java.util.UUID;

/**
 * Pipeline - Core ETL pipeline definition
 * 
 * Represents a complete ETL workflow graph owned by a domain.
 * Each pipeline consists of nodes (SOURCE, TRANSFORM, SINK) connected by edges.
 * 
 * @param id          Unique identifier
 * @param domain      Domain owning this pipeline (e.g., "finance", "marketing")
 * @param name        Human-readable pipeline name
 * @param description Pipeline description
 * @param status      Current status (DRAFT, ACTIVE, ARCHIVED)
 * @param version     Version number (incremented on each update)
 * @param createdAt   Timestamp when pipeline was created
 * @param updatedAt   Timestamp when pipeline was last updated
 * @param createdBy   User who created the pipeline (from JWT sub claim)
 */
public record Pipeline(
        UUID id,
        String domain,
        String name,
        String description,
        PipelineStatus status,
        Integer version,

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "UTC") Instant createdAt,

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "UTC") Instant updatedAt,

        String createdBy) {
    /**
     * Create a new draft pipeline
     */
    public static Pipeline createDraft(String domain, String name, String description, String createdBy) {
        Instant now = Instant.now();
        return new Pipeline(
                UUID.randomUUID(),
                domain,
                name,
                description,
                PipelineStatus.DRAFT,
                1,
                now,
                now,
                createdBy);
    }

    /**
     * Mark pipeline as active (ready for execution)
     */
    public Pipeline activate() {
        return new Pipeline(
                id,
                domain,
                name,
                description,
                PipelineStatus.ACTIVE,
                version,
                createdAt,
                Instant.now(),
                createdBy);
    }

    /**
     * Archive pipeline (cannot be executed)
     */
    public Pipeline archive() {
        return new Pipeline(
                id,
                domain,
                name,
                description,
                PipelineStatus.ARCHIVED,
                version,
                createdAt,
                Instant.now(),
                createdBy);
    }
}
