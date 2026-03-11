package org.hartford.surehealth.repository;

import org.hartford.surehealth.entity.GroupPolicy;
import org.hartford.surehealth.enums.PolicyStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupPolicyRepository extends JpaRepository<GroupPolicy,Long> {
    List<GroupPolicy> findByStatus(PolicyStatus status);
    List<GroupPolicy> findByCorporateClientId(Long corporateId);
    long countByStatus(PolicyStatus status);
    long countByCorporateClientId(Long corporateId);
    long countByCorporateClientIdAndStatus(Long corporateId, PolicyStatus status);
    List<GroupPolicy> findByAssignedUnderwriterId(Long underwriterId);
    List<GroupPolicy> findByAssignedUnderwriterIdAndStatus(Long underwriterId, PolicyStatus status);
}



