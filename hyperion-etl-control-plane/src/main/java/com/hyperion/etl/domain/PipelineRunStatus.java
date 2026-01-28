package com.hyperion.etl.domain;

/**
 * Pipeline run execution status
 */
public enum PipelineRunStatus {
    /**
     * Run has been created but not started
     */
    PENDING,

    /**
     * Run is currently executing
     */
    RUNNING,

    /**
     * Run completed successfully
     */
    SUCCESS,

    /**
     * Run failed during execution
     */
    FAILED,

    /**
     * Run was stopped by user
     */
    STOPPED
}
