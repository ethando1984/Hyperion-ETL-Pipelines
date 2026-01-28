package com.hyperion.etl.domain;

import java.util.UUID;

/**
 * PipelineEdge - Represents a connection between two nodes in the pipeline
 * graph
 * 
 * Edges define the data flow direction in the ETL pipeline.
 * Valid edge types are enforced by DAG validation:
 * - SOURCE → TRANSFORM
 * - TRANSFORM → TRANSFORM
 * - TRANSFORM → SINK
 * 
 * @param id         Unique identifier
 * @param pipelineId Parent pipeline ID
 * @param fromNodeId Source node ID
 * @param toNodeId   Target node ID
 */
public record PipelineEdge(
        UUID id,
        UUID pipelineId,
        UUID fromNodeId,
        UUID toNodeId) {
    /**
     * Create a new pipeline edge
     */
    public static PipelineEdge create(UUID pipelineId, UUID fromNodeId, UUID toNodeId) {
        return new PipelineEdge(
                UUID.randomUUID(),
                pipelineId,
                fromNodeId,
                toNodeId);
    }
}
