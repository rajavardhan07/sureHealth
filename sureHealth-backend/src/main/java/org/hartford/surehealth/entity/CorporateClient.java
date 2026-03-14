package org.hartford.surehealth.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CorporateClient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String companyName;
    private String industryType;

    private Integer numberOfEmployees;

    @Column(unique = true)
    private String registrationNumber;

    private String contactPerson;
    private String contactEmail;
    private String contactPhone;

    private String status = "ACTIVE"; // ACTIVE / SUSPENDED

    @OneToMany(mappedBy = "corporateClient")
    //mappedBy -> the corporateClient field in GroupPolicy is the owner of the relationship
    @JsonIgnore
    private List<GroupPolicy> policies;

    @OneToMany(mappedBy = "corporateClient")
    @JsonIgnore
    private List<Employee> employees;

}



