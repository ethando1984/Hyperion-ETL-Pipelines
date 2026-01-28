package com.hyperion.etl.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for creating/updating pipelines
 */
public record PipelineRequest(
                @NotBlank(message = "Domain is required") @Size(max = 100) String domain,

                @NotBlank(message = "Name is required") @Size(max = 200) String name,

                @Size(max = 1000) String description) {
}
