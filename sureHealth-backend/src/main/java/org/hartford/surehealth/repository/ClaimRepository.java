package org.hartford.surehealth.repository;

import org.hartford.surehealth.entity.Claim;
import org.hartford.surehealth.entity.ClaimStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface ClaimRepository extends JpaRepository<Claim,Long> {
    List<Claim> findByEmployeeId(Long employeeId);
    List<Claim> findByStatus(ClaimStatus status);
    List<Claim> findByAssignedOfficerId(Long officerId);
    long countByStatus(ClaimStatus status);
    long countByEmployeeId(Long employeeId);
    long countByEmployeeIdAndStatus(Long employeeId, ClaimStatus status);
    
    @Query("SELECT c FROM Claim c WHERE c.employee.corporateClient.id = :corporateId")
    long countByCorporateId(Long corporateId);
    
    @Query("SELECT COUNT(c) FROM Claim c WHERE c.status = :status AND DATE(c.reviewDate) = :date")
    long countByStatusAndReviewDate(ClaimStatus status, LocalDate date);
}


