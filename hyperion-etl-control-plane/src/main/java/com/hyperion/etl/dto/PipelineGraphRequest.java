package com.hyperion.etl.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hyperion.etl.domain.NodeType;
import com.hyperion.etl.domain.PipelineEdge;
import com.hyperion.etl.domain.PipelineNode;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

/**
 * Request DTO for syncing pipeline graph from React Canvas
 */
public record PipelineGraphRequest(
        @NotEmpty(message = "Nodes cannot be empty") @Valid List<NodeRequest> nodes,

        @NotEmpty(message = "Edges cannot be empty") @Valid List<EdgeRequest> edges) {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Node in the graph
     */
    public record NodeRequest(
            String id, // Frontend ID (string UUID or temp ID)
            @NotNull NodeType type,
            @NotNull String domainService,
            @NotNull JsonNode config,
            Double posX,
            Double posY) {
        public PipelineNode toDomain(UUID pipelineId) {
            return new PipelineNode(
                    UUID.randomUUID(), // Generate new UUID for database
                    pipelineId,
                    type,
                    domainService,
                    config,
                    posX != null ? posX.intValue() : null,
                    posY != null ? posY.intValue() : null);
        }
    }

    /**
     * Edge connecting two nodes
     */
    public record EdgeRequest(
            String id,
            @NotNull String fromNodeId,
            @NotNull String toNodeId) {
        public PipelineEdge toDomain(UUID pipelineId, UUID fromUUID, UUID toUUID) {
            return new PipelineEdge(
                    UUID.randomUUID(),
                    pipelineId,
                    fromUUID,
                    toUUID);
        }
    }
}
