package com.hyperion.etl.mapper;

import com.hyperion.etl.domain.PipelineNode;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

/**
 * MyBatis mapper for PipelineNode persistence
 */
@Mapper
public interface PipelineNodeMapper {

    /**
     * Insert a new node
     */
    void insert(PipelineNode node);

    /**
     * Batch insert nodes
     */
    void batchInsert(@Param("nodes") List<PipelineNode> nodes);

    /**
     * Find all nodes for a pipeline
     */
    List<PipelineNode> findByPipelineId(@Param("pipelineId") UUID pipelineId);

    /**
     * Delete all nodes for a pipeline
     */
    void deleteByPipelineId(@Param("pipelineId") UUID pipelineId);

    /**
     * Find node by ID
     */
    PipelineNode findById(@Param("id") UUID id);
}
