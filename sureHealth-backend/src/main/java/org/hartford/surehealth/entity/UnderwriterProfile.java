package org.hartford.surehealth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * SHOWCASE ENTITY - Not actively used in application
 * Demonstrates role-specific profile pattern as alternative to single User table
 */
@Entity
@Table(name = "underwriter_profile")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class UnderwriterProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    private String licenseNumber;
    private String licenseState;
    private LocalDateTime licenseExpiryDate;
    private Double commissionPercentage;
    private String specialization; // e.g., "Health", "Life", "Property"
    private Integer yearsOfExperience;
    private String certifications;

    private LocalDateTime createdAt = LocalDateTime.now();
}

