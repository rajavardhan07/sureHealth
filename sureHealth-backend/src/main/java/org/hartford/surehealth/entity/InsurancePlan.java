package org.hartford.surehealth.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InsurancePlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String planName;

    private BigDecimal coverageAmount;

    private BigDecimal premiumPerEmployee;
    
    private String description;
    
    private Integer durationMonths;
    
    private Integer waitingPeriodDays = 0;

    private Boolean active = true;

    @OneToMany(mappedBy = "insurancePlan")
    @JsonIgnore
    private List<GroupPolicy> policies;
}



