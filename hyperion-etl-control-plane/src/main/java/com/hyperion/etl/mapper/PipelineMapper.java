package com.hyperion.etl.mapper;

import com.hyperion.etl.domain.Pipeline;
import com.hyperion.etl.domain.PipelineStatus;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * MyBatis mapper for Pipeline persistence
 */
@Mapper
public interface PipelineMapper {

    /**
     * Insert a new pipeline
     */
    void insert(Pipeline pipeline);

    /**
     * Update an existing pipeline
     */
    void update(Pipeline pipeline);

    /**
     * Find pipeline by ID
     */
    Optional<Pipeline> findById(@Param("id") UUID id);

    /**
     * Find all pipelines (optionally filtered by domain and status)
     */
    List<Pipeline> findAll(
            @Param("domain") String domain,
            @Param("status") PipelineStatus status);

    /**
     * Delete pipeline by ID
     */
    void deleteById(@Param("id") UUID id);

    /**
     * Check if pipeline exists with given domain and name
     */
    boolean existsByDomainAndName(
            @Param("domain") String domain,
            @Param("name") String name);
}
