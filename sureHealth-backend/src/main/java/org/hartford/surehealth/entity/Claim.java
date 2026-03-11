package org.hartford.surehealth.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Claim {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String claimNumber;

    private BigDecimal billAmount;

    private BigDecimal approvedAmount;

    private String hospitalName;

    private String diagnosis;

    private LocalDate treatmentDate;

    private String billNumber;

    @Enumerated(EnumType.STRING)
    private ClaimStatus status = ClaimStatus.SUBMITTED;

    @ManyToOne
    private Employee employee;

    @ManyToOne
    private GroupPolicy groupPolicy;

    @ManyToOne
    @JoinColumn(name = "assigned_officer_id")
    private User assignedOfficer;

    @ManyToOne
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    private LocalDateTime reviewDate;

    private String rejectionReason;

    @Lob
    @Column(length = 20971520) // 20MB
    private byte[] claimReportFile;
    private String claimReportFileName;

    private String claimType;
    private LocalDateTime submissionDate = LocalDateTime.now();
}


