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
@Table(name = "admin_profile")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class AdminProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    private String department;
//  private String accessLevel; // e.g., "SUPER_ADMIN", "SYSTEM_ADMIN"
    private Boolean canManageUsers;
    private Boolean canManagePolicies;
    private Boolean canManageClaims;
    private LocalDateTime lastLoginAt;

    private LocalDateTime createdAt = LocalDateTime.now();
}

