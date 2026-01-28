package com.hyperion.etl.mapper;

import com.hyperion.etl.domain.PipelineRun;
import com.hyperion.etl.domain.PipelineRunStatus;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * MyBatis mapper for PipelineRun persistence
 */
@Mapper
public interface PipelineRunMapper {

    /**
     * Insert a new run
     */
    void insert(PipelineRun run);

    /**
     * Update an existing run
     */
    void update(PipelineRun run);

    /**
     * Find run by ID
     */
    Optional<PipelineRun> findById(@Param("id") UUID id);

    /**
     * Find all runs for a pipeline
     */
    List<PipelineRun> findByPipelineId(@Param("pipelineId") UUID pipelineId);

    /**
     * Find runs by status
     */
    List<PipelineRun> findByStatus(@Param("status") PipelineRunStatus status);
}
