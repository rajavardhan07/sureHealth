package org.hartford.surehealth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ClaimRejectionDTO {
    @NotBlank(message = "Rejection reason is required")
    private String rejectionReason;
}

