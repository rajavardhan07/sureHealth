package org.hartford.surehealth.repository;

import org.hartford.surehealth.entity.AdminProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminProfileRepository extends JpaRepository<AdminProfile, Long> {
    Optional<AdminProfile> findByUser_Username(String username);
}
