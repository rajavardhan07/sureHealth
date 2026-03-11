package org.hartford.surehealth.repository;

import org.hartford.surehealth.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee,Long> {
    List<Employee> findByCorporateClientId(Long corporateId);
    List<Employee> findByGroupPolicyId(Long policyId);
    List<Employee> findByGroupPolicyIdIsNullAndCorporateClientId(Long corporateId);
    long countByCorporateClientId(Long corporateId);
}



