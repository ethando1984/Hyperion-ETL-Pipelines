package com.hyperion.etl.api;

import com.hyperion.etl.domain.Pipeline;
import com.hyperion.etl.domain.PipelineEdge;
import com.hyperion.etl.domain.PipelineNode;
import com.hyperion.etl.domain.PipelineStatus;
import com.hyperion.etl.dto.PipelineGraphRequest;
import com.hyperion.etl.dto.PipelineRequest;
import com.hyperion.etl.service.DAGValidator;
import com.hyperion.etl.service.PipelineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST API for managing ETL pipelines
 */
@RestController
@RequestMapping("/api/pipelines")
@RequiredArgsConstructor
@Tag(name = "Pipelines", description = "Pipeline management API")
@SecurityRequirement(name = "oauth2")
public class PipelineController {

    private final PipelineService pipelineService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'etl:pipeline:WRITE')")
    @Operation(summary = "Create a new pipeline", description = "Requires etl:pipeline:WRITE permission")
    public Pipeline createPipeline(@Valid @RequestBody PipelineRequest request) {
        return pipelineService.createPipeline(request);
    }

    @GetMapping
    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'etl:pipeline:READ')")
    @Operation(summary = "List all pipelines", description = "Requires etl:pipeline:READ permission")
    public List<Pipeline> listPipelines(
            @RequestParam(required = false) String domain,
            @RequestParam(required = false) PipelineStatus status) {
        return pipelineService.getAllPipelines(domain, status);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'etl:pipeline:READ')")
    @Operation(summary = "Get pipeline by ID", description = "Requires etl:pipeline:READ permission")
    public Pipeline getPipeline(@PathVariable UUID id) {
        return pipelineService.getPipelineById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'etl:pipeline:WRITE')")
    @Operation(summary = "Update pipeline metadata", description = "Requires etl:pipeline:WRITE permission")
    public Pipeline updatePipeline(
            @PathVariable UUID id,
            @Valid @RequestBody PipelineRequest request) {
        return pipelineService.updatePipeline(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'etl:pipeline:DELETE')")
    @Operation(summary = "Delete pipeline", description = "Requires etl:pipeline:DELETE permission")
    public void deletePipeline(@PathVariable UUID id) {
        pipelineService.deletePipeline(id);
    }

    @PutMapping("/{id}/graph")
    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'etl:pipeline:WRITE')")
    @Operation(summary = "Sync pipeline graph from React Canvas", description = "Replaces nodes and edges with new graph data. Requires etl:pipeline:WRITE permission")
    public void syncGraph(
            @PathVariable UUID id,
            @Valid @RequestBody PipelineGraphRequest graphRequest) {
        pipelineService.syncGraph(id, graphRequest);
    }

    @GetMapping("/{id}/graph")
    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'etl:pipeline:READ')")
    @Operation(summary = "Get pipeline graph", description = "Returns nodes and edges for canvas visualization")
    public Map<String, Object> getGraph(@PathVariable UUID id) {
        List<PipelineNode> nodes = pipelineService.getPipelineNodes(id);
        List<PipelineEdge> edges = pipelineService.getPipelineEdges(id);

        return Map.of(
                "nodes", nodes,
                "edges", edges);
    }

    @PostMapping("/{id}/validate")
    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'etl:node:VALIDATE')")
    @Operation(summary = "Validate pipeline DAG", description = "Checks for cycles, edge compatibility, and required nodes")
    public Map<String, Object> validatePipeline(@PathVariable UUID id) {
        DAGValidator.ValidationResult result = pipelineService.validatePipeline(id);

        return Map.of(
                "valid", result.isValid(),
                "errorMessage", result.errorMessage() != null ? result.errorMessage() : "");
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'etl:pipeline:WRITE')")
    @Operation(summary = "Activate pipeline", description = "Validates and marks pipeline as ACTIVE (ready for execution)")
    public Pipeline activatePipeline(@PathVariable UUID id) {
        return pipelineService.activatePipeline(id);
    }
}
