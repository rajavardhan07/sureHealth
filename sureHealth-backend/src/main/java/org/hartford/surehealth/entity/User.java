package org.hartford.surehealth.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "app_user")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class User {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(unique = true)
//    private String userName;
//
//    private String password;
//
//    private String role; // can be Admin/Hr/Employee
//
//    private Boolean active = true;
//
//    private LocalDateTime createdAt = LocalDateTime.now();
//
//    @OneToOne
//    @JoinColumn(name = "employee_id")
//    private Employee employee;
//
//    @ManyToOne
//    @JoinColumn(name = "corporate_id")
//    private CorporateClient corporateClient;


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String username;

    private String password;

    private String fullName;
    private String phoneNumber;
    private String licenseNumber;
    private Double commissionPercentage;

    @Enumerated(EnumType.STRING)
    private Role role;

    private Boolean firstLogin = true;

    private LocalDateTime createdAt = LocalDateTime.now();
    @OneToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @ManyToOne
    @JoinColumn(name = "corporate_id")
    private CorporateClient corporateClient;

}


