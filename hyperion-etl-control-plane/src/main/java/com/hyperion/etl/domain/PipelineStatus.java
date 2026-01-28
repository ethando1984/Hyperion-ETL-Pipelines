package com.hyperion.etl.domain;

/**
 * Pipeline execution status
 */
public enum PipelineStatus {
    /**
     * Pipeline is being created/edited, not ready for execution
     */
    DRAFT,
    
    /**
     * Pipeline is validated and ready for execution
     */
    ACTIVE,
    
    /**
     * Pipeline is archived and cannot be executed
     */
    ARCHIVED
}
