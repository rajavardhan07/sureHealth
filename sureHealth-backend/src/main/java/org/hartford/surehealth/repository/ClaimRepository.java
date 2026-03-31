package org.hartford.surehealth.repository;

import org.hartford.surehealth.entity.Claim;
import org.hartford.surehealth.enums.ClaimStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ClaimRepository extends JpaRepository<Claim,Long> {
    List<Claim> findByEmployeeId(Long employeeId);
    List<Claim> findByEmployeeCorporateClientId(Long corporateId);
    List<Claim> findByStatus(ClaimStatus status);
    List<Claim> findByAssignedOfficerId(Long officerId);
    long countByAssignedOfficerId(Long officerId);
    long countByStatus(ClaimStatus status);
    long countByEmployeeId(Long employeeId);
    long countByEmployeeIdAndStatus(Long employeeId, ClaimStatus status);
    
    @Query("SELECT COUNT(c) FROM Claim c WHERE c.employee.corporateClient.id = :corporateId")
    long countByCorporateId(@Param("corporateId") Long corporateId);
    
    @Query("SELECT COUNT(c) FROM Claim c WHERE c.status = :status AND c.reviewDate >= :start AND c.reviewDate < :end")
    long countByStatusAndReviewDate(@Param("status") ClaimStatus status, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    long countByAssignedOfficerIdAndStatus(Long officerId, ClaimStatus status);
    List<Claim> findByAssignedOfficerIdAndStatus(Long officerId, ClaimStatus status);

    @Query("SELECT COUNT(c) FROM Claim c WHERE c.assignedOfficer.id = :officerId AND c.status = :status AND c.reviewDate >= :start AND c.reviewDate < :end")
    long countByAssignedOfficerIdAndStatusAndReviewDate(@Param("officerId") Long officerId, @Param("status") ClaimStatus status, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}



