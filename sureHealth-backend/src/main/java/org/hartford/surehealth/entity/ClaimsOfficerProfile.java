package org.hartford.surehealth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "claims_officer_profile")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class ClaimsOfficerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    private String department;
    private String specialization; // e.g., "Medical Claims", "Dental Claims"
    private Integer claimsProcessedCount;
    private Double averageProcessingTime; // in hours
    private String certifications;
    private Integer yearsOfExperience;

    private LocalDateTime createdAt = LocalDateTime.now();
}

