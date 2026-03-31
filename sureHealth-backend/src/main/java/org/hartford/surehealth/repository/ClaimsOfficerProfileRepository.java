package org.hartford.surehealth.repository;

import org.hartford.surehealth.entity.ClaimsOfficerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClaimsOfficerProfileRepository extends JpaRepository<ClaimsOfficerProfile, Long> {
    Optional<ClaimsOfficerProfile> findByUser_Username(String username);
}
