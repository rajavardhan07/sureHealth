package org.hartford.surehealth.repository;

import org.hartford.surehealth.entity.UnderwriterProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UnderwriterProfileRepository extends JpaRepository<UnderwriterProfile, Long> {
    Optional<UnderwriterProfile> findByUser_Username(String username);
}
