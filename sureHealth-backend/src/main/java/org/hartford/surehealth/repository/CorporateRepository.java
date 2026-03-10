package org.hartford.surehealth.repository;

import org.hartford.surehealth.entity.CorporateClient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CorporateRepository extends JpaRepository<CorporateClient,Long> {
    Optional<CorporateClient> findByContactEmail(String email);
}


