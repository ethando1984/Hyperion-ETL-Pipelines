package com.hyperion.etl.mapper;

import com.hyperion.etl.domain.PipelineEdge;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

/**
 * MyBatis mapper for PipelineEdge persistence
 */
@Mapper
public interface PipelineEdgeMapper {

    /**
     * Insert a new edge
     */
    void insert(PipelineEdge edge);

    /**
     * Batch insert edges
     */
    void batchInsert(@Param("edges") List<PipelineEdge> edges);

    /**
     * Find all edges for a pipeline
     */
    List<PipelineEdge> findByPipelineId(@Param("pipelineId") UUID pipelineId);

    /**
     * Delete all edges for a pipeline
     */
    void deleteByPipelineId(@Param("pipelineId") UUID pipelineId);
}
