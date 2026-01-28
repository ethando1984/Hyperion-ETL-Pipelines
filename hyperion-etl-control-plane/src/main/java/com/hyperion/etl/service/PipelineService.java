package com.hyperion.etl.service;

import com.hyperion.etl.domain.Pipeline;
import com.hyperion.etl.domain.PipelineEdge;
import com.hyperion.etl.domain.PipelineNode;
import com.hyperion.etl.domain.PipelineStatus;
import com.hyperion.etl.dto.PipelineGraphRequest;
import com.hyperion.etl.dto.PipelineRequest;
import com.hyperion.etl.mapper.PipelineEdgeMapper;
import com.hyperion.etl.mapper.PipelineMapper;
import com.hyperion.etl.mapper.PipelineNodeMapper;
import com.hyperion.etl.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for managing pipelines
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PipelineService {

    private final PipelineMapper pipelineMapper;
    private final PipelineNodeMapper nodeMapper;
    private final PipelineEdgeMapper edgeMapper;
    private final DAGValidator dagValidator;

    /**
     * Create a new pipeline
     */
    @Transactional
    public Pipeline createPipeline(PipelineRequest request) {
        String currentUser = SecurityUtils.requireCurrentUser();

        // Check for duplicate name in domain
        if (pipelineMapper.existsByDomainAndName(request.domain(), request.name())) {
            throw new IllegalArgumentException(
                    String.format("Pipeline '%s' already exists in domain '%s'", request.name(), request.domain()));
        }

        Pipeline pipeline = Pipeline.createDraft(
                request.domain(),
                request.name(),
                request.description(),
                currentUser);

        pipelineMapper.insert(pipeline);
        log.info("Created pipeline: id={}, domain={}, name={}", pipeline.id(), pipeline.domain(), pipeline.name());

        return pipeline;
    }

    /**
     * Update pipeline metadata
     */
    @Transactional
    public Pipeline updatePipeline(UUID id, PipelineRequest request) {
        Pipeline existing = getPipelineById(id);

        Pipeline updated = new Pipeline(
                existing.id(),
                request.domain(),
                request.name(),
                request.description(),
                existing.status(), // Keep existing status
                existing.version() + 1,
                existing.createdAt(),
                Instant.now(),
                existing.createdBy());

        pipelineMapper.update(updated);
        log.info("Updated pipeline: id={}", id);

        return updated;
    }

    @Transactional
    public void syncGraph(UUID pipelineId, PipelineGraphRequest graphRequest) {
        // Convert DTOs to domain objects
        List<PipelineNode> nodes = graphRequest.nodes().stream()
                .map(n -> n.toDomain(pipelineId))
                .collect(Collectors.toList());

        // Create a map from frontend node IDs to database UUIDs
        java.util.Map<String, UUID> nodeIdMap = new java.util.HashMap<>();
        for (int i = 0; i < graphRequest.nodes().size(); i++) {
            nodeIdMap.put(graphRequest.nodes().get(i).id(), nodes.get(i).id());
        }

        List<PipelineEdge> edges = graphRequest.edges() != null
                ? graphRequest.edges().stream()
                        .map(e -> e.toDomain(
                                pipelineId,
                                nodeIdMap.get(e.fromNodeId()),
                                nodeIdMap.get(e.toNodeId())))
                        .collect(Collectors.toList())
                : List.of();

        // Validate DAG
        DAGValidator.ValidationResult validation = dagValidator.validate(nodes, edges);
        if (!validation.isValid()) {
            throw new IllegalArgumentException("Invalid pipeline graph: " + validation.errorMessage());
        }

        // Delete existing nodes and edges (cascade will handle edges)
        nodeMapper.deleteByPipelineId(pipelineId);
        edgeMapper.deleteByPipelineId(pipelineId);

        // Insert new nodes and edges
        if (!nodes.isEmpty()) {
            nodeMapper.batchInsert(nodes);
        }
        if (!edges.isEmpty()) {
            edgeMapper.batchInsert(edges);
        }

        log.info("Synced graph for pipeline {}: {} nodes, {} edges", pipelineId, nodes.size(), edges.size());
    }

    /**
     * Validate pipeline graph
     */
    public DAGValidator.ValidationResult validatePipeline(UUID pipelineId) {
        List<PipelineNode> nodes = nodeMapper.findByPipelineId(pipelineId);
        List<PipelineEdge> edges = edgeMapper.findByPipelineId(pipelineId);

        return dagValidator.validate(nodes, edges);
    }

    /**
     * Get pipeline by ID
     */
    public Pipeline getPipelineById(UUID id) {
        return pipelineMapper.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pipeline not found: " + id));
    }

    /**
     * Get all pipelines with optional filters
     */
    public List<Pipeline> getAllPipelines(String domain, PipelineStatus status) {
        return pipelineMapper.findAll(domain, status);
    }

    /**
     * Get pipeline nodes
     */
    public List<PipelineNode> getPipelineNodes(UUID pipelineId) {
        return nodeMapper.findByPipelineId(pipelineId);
    }

    /**
     * Get pipeline edges
     */
    public List<PipelineEdge> getPipelineEdges(UUID pipelineId) {
        return edgeMapper.findByPipelineId(pipelineId);
    }

    /**
     * Delete pipeline (with audit logging)
     */
    @Transactional
    public void deletePipeline(UUID id) {
        Pipeline pipeline = getPipelineById(id);
        pipelineMapper.deleteById(id);

        log.warn("AUDIT: Pipeline deleted - id={}, domain={}, name={}, deletedBy={}",
                id, pipeline.domain(), pipeline.name(), SecurityUtils.getCurrentUserEmail().orElse("UNKNOWN"));
    }

    /**
     * Activate pipeline (mark as ready for execution)
     */
    @Transactional
    public Pipeline activatePipeline(UUID id) {
        Pipeline pipeline = getPipelineById(id);

        // Validate before activating
        DAGValidator.ValidationResult validation = validatePipeline(id);
        if (!validation.isValid()) {
            throw new IllegalArgumentException("Cannot activate invalid pipeline: " + validation.errorMessage());
        }

        Pipeline activated = pipeline.activate();
        pipelineMapper.update(activated);

        log.info("Activated pipeline: id={}", id);
        return activated;
    }
}
