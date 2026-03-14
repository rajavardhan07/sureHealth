package org.hartford.surehealth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;


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
    // Each AdminProfile is linked to exactly one User with ADMIN role
    private User user;
    private Boolean canManageUsers;
    private Boolean canManagePolicies;
    private Boolean canManageClaims;
    private LocalDateTime lastLoginAt;

    private LocalDateTime createdAt = LocalDateTime.now();
}

