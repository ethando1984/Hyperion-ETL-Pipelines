package com.hyperion.etl.service;

import com.hyperion.etl.domain.Pipeline;
import com.hyperion.etl.domain.PipelineNode;
import com.hyperion.etl.domain.PipelineRun;
import com.hyperion.etl.domain.PipelineRunStatus;
import com.hyperion.etl.events.NodeExecuteEvent;
import com.hyperion.etl.events.PipelineRunEvent;
import com.hyperion.etl.mapper.PipelineRunMapper;
import com.hyperion.etl.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutorService;

/**
 * Service for orchestrating pipeline execution
 * Uses Virtual Threads for async execution
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ExecutionService {

    private final PipelineService pipelineService;
    private final PipelineRunMapper runMapper;
    private final DAGValidator dagValidator;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ExecutorService etlExecutor;

    @Value("${spring.kafka.topics.pipeline-run}")
    private String pipelineRunTopic;

    @Value("${spring.kafka.topics.node-execute}")
    private String nodeExecuteTopic;

    /**
     * Trigger pipeline execution
     */
    @Transactional
    public PipelineRun runPipeline(UUID pipelineId) {
        Pipeline pipeline = pipelineService.getPipelineById(pipelineId);

        // Validate pipeline
        DAGValidator.ValidationResult validation = pipelineService.validatePipeline(pipelineId);
        if (!validation.isValid()) {
            throw new IllegalArgumentException("Cannot run invalid pipeline: " + validation.errorMessage());
        }

        // Create run record
        String triggeredBy = SecurityUtils.requireCurrentUser();
        PipelineRun run = PipelineRun.createPending(pipelineId, triggeredBy);
        runMapper.insert(run);

        log.info("AUDIT: Pipeline run triggered - runId={}, pipelineId={}, triggeredBy={}",
                run.id(), pipelineId, triggeredBy);

        // Publish pipeline run event
        PipelineRunEvent runEvent = PipelineRunEvent.create(
                run.id(),
                pipelineId,
                pipeline.domain(),
                triggeredBy);
        kafkaTemplate.send(pipelineRunTopic, run.id().toString(), runEvent);

        // Start async execution in Virtual Thread
        etlExecutor.submit(() -> executeAsync(run, pipeline));

        return run;
    }

    /**
     * Async execution orchestration
     */
    private void executeAsync(PipelineRun run, Pipeline pipeline) {
        try {
            // Start run
            PipelineRun started = run.start();
            runMapper.update(started);

            // Get nodes and edges
            List<PipelineNode> nodes = pipelineService.getPipelineNodes(pipeline.id());
            List<UUID> executionOrder = dagValidator.topologicalSort(
                    nodes,
                    pipelineService.getPipelineEdges(pipeline.id()));

            log.info("Executing pipeline run {} with {} nodes in topological order",
                    run.id(), executionOrder.size());

            // Emit node execute events in topological order
            for (UUID nodeId : executionOrder) {
                PipelineNode node = nodes.stream()
                        .filter(n -> n.id().equals(nodeId))
                        .findFirst()
                        .orElseThrow();

                NodeExecuteEvent event = NodeExecuteEvent.create(
                        run.id(),
                        node.id(),
                        pipeline.id(),
                        pipeline.domain(),
                        node.type(),
                        node.domainService(),
                        node.config());

                kafkaTemplate.send(nodeExecuteTopic, run.id().toString(), event);
                log.debug("Emitted execute event for node {} (type={})", nodeId, node.type());
            }

            log.info("Pipeline run {} orchestration complete - nodes dispatched to domain services", run.id());

        } catch (Exception e) {
            log.error("Pipeline run {} failed during orchestration", run.id(), e);
            PipelineRun failed = run.fail(e.getMessage());
            runMapper.update(failed);
        }
    }

    /**
     * Get run by ID
     */
    public PipelineRun getRunById(UUID runId) {
        return runMapper.findById(runId)
                .orElseThrow(() -> new IllegalArgumentException("Run not found: " + runId));
    }

    /**
     * Get runs for a pipeline
     */
    public List<PipelineRun> getRunsForPipeline(UUID pipelineId) {
        return runMapper.findByPipelineId(pipelineId);
    }

    /**
     * Stop a running pipeline
     */
    @Transactional
    public PipelineRun stopRun(UUID runId) {
        PipelineRun run = getRunById(runId);

        if (run.status() != PipelineRunStatus.RUNNING) {
            throw new IllegalStateException("Can only stop RUNNING pipelines");
        }

        PipelineRun stopped = run.stop();
        runMapper.update(stopped);

        log.warn("AUDIT: Pipeline run stopped - runId={}, stoppedBy={}",
                runId, SecurityUtils.getCurrentUserEmail().orElse("UNKNOWN"));

        // TODO: Emit stop event to domain services

        return stopped;
    }
}
