package org.hartford.surehealth.repository;

import org.hartford.surehealth.entity.InsurancePlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InsurancePlanRepository extends JpaRepository<InsurancePlan,Long> {
    List<InsurancePlan> findByActiveTrue();
}



