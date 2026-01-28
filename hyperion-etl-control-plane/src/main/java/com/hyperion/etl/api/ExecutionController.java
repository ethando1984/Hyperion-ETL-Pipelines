package com.hyperion.etl.api;

import com.hyperion.etl.domain.PipelineRun;
import com.hyperion.etl.service.ExecutionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST API for pipeline execution
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Execution", description = "Pipeline execution API")
@SecurityRequirement(name = "oauth2")
public class ExecutionController {

    private final ExecutionService executionService;

    @PostMapping("/pipelines/{id}/run")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'etl:run:RUN')")
    @Operation(summary = "Run a pipeline", description = "Triggers async pipeline execution. Requires etl:run:RUN permission")
    public PipelineRun runPipeline(@PathVariable UUID id) {
        return executionService.runPipeline(id);
    }

    @GetMapping("/runs/{id}")
    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'etl:run:READ')")
    @Operation(summary = "Get run status", description = "Retrieves execution status. Requires etl:run:READ permission")
    public PipelineRun getRun(@PathVariable UUID id) {
        return executionService.getRunById(id);
    }

    @GetMapping("/pipelines/{id}/runs")
    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'etl:run:READ')")
    @Operation(summary = "List pipeline runs", description = "Get all runs for a pipeline")
    public List<PipelineRun> listRuns(@PathVariable UUID id) {
        return executionService.getRunsForPipeline(id);
    }

    @PostMapping("/runs/{id}/stop")
    @PreAuthorize("@permissionEvaluator.hasPermission(authentication, 'etl:run:STOP')")
    @Operation(summary = "Stop a running pipeline", description = "Stops pipeline execution. Requires etl:run:STOP permission")
    public PipelineRun stopRun(@PathVariable UUID id) {
        return executionService.stopRun(id);
    }
}
