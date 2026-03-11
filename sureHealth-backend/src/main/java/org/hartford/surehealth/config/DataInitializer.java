package org.hartford.surehealth.config;

import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.entity.InsurancePlan;
import org.hartford.surehealth.enums.Role;
import org.hartford.surehealth.entity.User;
import org.hartford.surehealth.repository.InsurancePlanRepository;
import org.hartford.surehealth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final InsurancePlanRepository insurancePlanRepository;

    @Override
    public void run(String... args) {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setFirstLogin(false);
            userRepository.save(admin);
        }

        if (insurancePlanRepository.count() == 0) {
            InsurancePlan plan1 = new InsurancePlan();
            plan1.setPlanName("Basic Health Plan");
            plan1.setDescription("Essential coverage for small to medium teams. Includes basic hospitalization and accident cover.");
            plan1.setDurationMonths(12);
            plan1.setCoverageAmount(new BigDecimal("500000"));
            plan1.setPremiumPerEmployee(new BigDecimal("5000"));
            plan1.setActive(true);
            insurancePlanRepository.save(plan1);

            InsurancePlan plan2 = new InsurancePlan();
            plan2.setPlanName("Premium Health Plan");
            plan2.setDescription("Comprehensive coverage with maternity benefits, OPD cover, and higher room rent limits.");
            plan2.setDurationMonths(12);
            plan2.setCoverageAmount(new BigDecimal("1000000"));
            plan2.setPremiumPerEmployee(new BigDecimal("10000"));
            plan2.setActive(true);
            insurancePlanRepository.save(plan2);

            InsurancePlan plan3 = new InsurancePlan();
            plan3.setPlanName("Health Plus Plan");
            plan3.setDescription("Comprehensive coverage for families. Includes maternity benefits, OPD cover, and higher room rent limits.");
            plan3.setDurationMonths(12);
            plan3.setCoverageAmount(new BigDecimal("1250000"));
            plan3.setPremiumPerEmployee(new BigDecimal("12500"));
            plan3.setActive(true);
            insurancePlanRepository.save(plan3);


        }

        // Seed 3 Claims Officers
        String[] officerNames = {"officer1", "officer2", "officer3"};
        for (String name : officerNames) {
            if (userRepository.findByUsername(name).isEmpty()) {
                User officer = new User();
                officer.setUsername(name);
                officer.setPassword(passwordEncoder.encode("officer123"));
                officer.setRole(Role.CLAIMS_OFFICER);
                officer.setFirstLogin(false);
                userRepository.save(officer);
            }
        }

        // Seed 4 Underwriters
        String[] underwriterNames = {"underwriter1", "underwriter2", "underwriter3", "underwriter4"};
        for (String name : underwriterNames) {
            if (userRepository.findByUsername(name).isEmpty()) {
                User underwriter = new User();
                underwriter.setUsername(name);
                underwriter.setPassword(passwordEncoder.encode("underwriter123"));
                underwriter.setRole(Role.UNDERWRITER);
                underwriter.setFirstLogin(true);
                userRepository.save(underwriter);
            }
        }
    }
}



