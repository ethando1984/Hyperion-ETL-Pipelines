package com.hyperion.etl.domain;

/**
 * ETL node types in the pipeline graph
 */
public enum NodeType {
    /**
     * Source node - reads data from external systems
     * (e.g., database, API, file storage)
     */
    SOURCE,

    /**
     * Transform node - processes and transforms data
     * (e.g., aggregation, filtering, enrichment)
     */
    TRANSFORM,

    /**
     * Sink node - writes data to target systems
     * (e.g., data warehouse, data lake, API)
     */
    SINK
}
