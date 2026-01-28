package com.hyperion.etl.domain;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.UUID;

/**
 * PipelineNode - Represents a node in the ETL pipeline graph
 * 
 * Each node represents a step in the ETL process (SOURCE, TRANSFORM, or SINK).
 * Nodes are executed by domain-specific services based on the domainService
 * field.
 * 
 * @param id            Unique identifier
 * @param pipelineId    Parent pipeline ID
 * @param type          Node type (SOURCE, TRANSFORM, SINK)
 * @param domainService Domain service that will execute this node (e.g.,
 *                      "finance-etl")
 * @param config        Node-specific configuration as JSON (schema validated)
 * @param posX          Canvas X position (for UI visualization)
 * @param posY          Canvas Y position (for UI visualization)
 */
public record PipelineNode(
        UUID id,
        UUID pipelineId,
        NodeType type,
        String domainService,
        JsonNode config,
        Integer posX,
        Integer posY) {
    /**
     * Create a new pipeline node
     */
    public static PipelineNode create(
            UUID pipelineId,
            NodeType type,
            String domainService,
            JsonNode config,
            Integer posX,
            Integer posY) {
        return new PipelineNode(
                UUID.randomUUID(),
                pipelineId,
                type,
                domainService,
                config,
                posX,
                posY);
    }
}
