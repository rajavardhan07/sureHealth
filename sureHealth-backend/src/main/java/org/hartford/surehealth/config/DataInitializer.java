package org.hartford.surehealth.config;

import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.entity.InsurancePlan;
import org.hartford.surehealth.enums.Role;
import org.hartford.surehealth.entity.User;
import org.hartford.surehealth.entity.AdminProfile;
import org.hartford.surehealth.entity.ClaimsOfficerProfile;
import org.hartford.surehealth.entity.UnderwriterProfile;
import org.hartford.surehealth.repository.AdminProfileRepository;
import org.hartford.surehealth.repository.ClaimsOfficerProfileRepository;
import org.hartford.surehealth.repository.UnderwriterProfileRepository;
import org.hartford.surehealth.repository.InsurancePlanRepository;
import org.hartford.surehealth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final InsurancePlanRepository insurancePlanRepository;
    private final AdminProfileRepository adminProfileRepository;
    private final ClaimsOfficerProfileRepository claimsOfficerProfileRepository;
    private final UnderwriterProfileRepository underwriterProfileRepository;
    private final org.hartford.surehealth.repository.GroupPolicyRepository groupPolicyRepository;

    @Override
    public void run(String... args) {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullName("Super Administrator");
            admin.setPhoneNumber("+1-800-555-0000");
            admin.setRole(Role.ADMIN);
            admin.setFirstLogin(false);
            userRepository.save(admin);
            
            AdminProfile adminProfile = new AdminProfile();
            adminProfile.setUser(admin);
            adminProfile.setCanManageUsers(true);
            adminProfile.setCanManagePolicies(true);
            adminProfile.setCanManageClaims(true);
            adminProfile.setCreatedAt(LocalDateTime.now());
            adminProfileRepository.save(adminProfile);
        }

        if (insurancePlanRepository.count() == 0) {
            InsurancePlan plan1 = new InsurancePlan();
            plan1.setPlanName("Basic Health Plan");
            plan1.setDescription("Essential coverage for small to medium teams. Includes basic hospitalization and accident cover.");
            plan1.setDurationMonths(12);
            plan1.setCoverageAmount(new BigDecimal("500000"));
            plan1.setPremiumPerEmployee(new BigDecimal("5000"));
            plan1.setWaitingPeriodDays(0);
            plan1.setActive(true);
            insurancePlanRepository.save(plan1);

            InsurancePlan plan2 = new InsurancePlan();
            plan2.setPlanName("Premium Health Plan");
            plan2.setDescription("Comprehensive coverage with maternity benefits, OPD cover, and higher room rent limits.");
            plan2.setDurationMonths(12);
            plan2.setCoverageAmount(new BigDecimal("1000000"));
            plan2.setPremiumPerEmployee(new BigDecimal("10000"));
            plan2.setWaitingPeriodDays(30);
            plan2.setActive(true);
            insurancePlanRepository.save(plan2);

            InsurancePlan plan3 = new InsurancePlan();
            plan3.setPlanName("Health Plus Plan");
            plan3.setDescription("Comprehensive coverage for families. Includes maternity benefits, OPD cover, and higher room rent limits.");
            plan3.setDurationMonths(12);
            plan3.setCoverageAmount(new BigDecimal("1250000"));
            plan3.setPremiumPerEmployee(new BigDecimal("12500"));
            plan3.setWaitingPeriodDays(60);
            plan3.setActive(true);
            insurancePlanRepository.save(plan3);

            InsurancePlan plan4 = new InsurancePlan();
            plan4.setPlanName("Corporate Shield");
            plan4.setDescription("Tailored for mid-size corporates. Features day-care procedures, pre & post hospitalization, and ambulance charges.");
            plan4.setDurationMonths(12);
            plan4.setCoverageAmount(new BigDecimal("750000"));
            plan4.setPremiumPerEmployee(new BigDecimal("7500"));
            plan4.setWaitingPeriodDays(15);
            plan4.setActive(true);
            insurancePlanRepository.save(plan4);

            InsurancePlan plan5 = new InsurancePlan();
            plan5.setPlanName("Enterprise Elite");
            plan5.setDescription("Enterprise-grade plan with global coverage, air ambulance, organ donor expenses, and zero co-pay hospitalization.");
            plan5.setDurationMonths(24);
            plan5.setCoverageAmount(new BigDecimal("2500000"));
            plan5.setPremiumPerEmployee(new BigDecimal("22000"));
            plan5.setWaitingPeriodDays(30);
            plan5.setActive(true);
            insurancePlanRepository.save(plan5);

            InsurancePlan plan6 = new InsurancePlan();
            plan6.setPlanName("Startup Essentials");
            plan6.setDescription("Budget-friendly group plan for startups. Covers hospitalization, day-care surgeries, and basic diagnostics.");
            plan6.setDurationMonths(6);
            plan6.setCoverageAmount(new BigDecimal("300000"));
            plan6.setPremiumPerEmployee(new BigDecimal("2500"));
            plan6.setWaitingPeriodDays(0);
            plan6.setActive(true);
            insurancePlanRepository.save(plan6);

            InsurancePlan plan7 = new InsurancePlan();
            plan7.setPlanName("Family Fortress");
            plan7.setDescription("Extends coverage to employee dependents. Includes spouse, children, and parents with shared sum insured.");
            plan7.setDurationMonths(12);
            plan7.setCoverageAmount(new BigDecimal("1500000"));
            plan7.setPremiumPerEmployee(new BigDecimal("15000"));
            plan7.setWaitingPeriodDays(30);
            plan7.setActive(true);
            insurancePlanRepository.save(plan7);

            InsurancePlan plan8 = new InsurancePlan();
            plan8.setPlanName("Executive Platinum");
            plan8.setDescription("C-suite level coverage with private room, international treatment, wellness check-ups, and mental health support.");
            plan8.setDurationMonths(12);
            plan8.setCoverageAmount(new BigDecimal("5000000"));
            plan8.setPremiumPerEmployee(new BigDecimal("45000"));
            plan8.setWaitingPeriodDays(0);
            plan8.setActive(true);
            insurancePlanRepository.save(plan8);

            InsurancePlan plan9 = new InsurancePlan();
            plan9.setPlanName("Wellness 360");
            plan9.setDescription("Holistic wellness plan covering preventive care, annual health check-ups, gym memberships, and telemedicine.");
            plan9.setDurationMonths(12);
            plan9.setCoverageAmount(new BigDecimal("800000"));
            plan9.setPremiumPerEmployee(new BigDecimal("8500"));
            plan9.setWaitingPeriodDays(15);
            plan9.setActive(true);
            insurancePlanRepository.save(plan9);

        }

        // Seed 3 Claims Officers
        String[][] officerData = {
            {"amit_sharma", "Amit Sharma", "9876543001"},
            {"priya_patel", "Priya Patel", "9876543002"},
            {"rahul_nair", "Rahul Nair", "9876543003"}
        };
        for (String[] data : officerData) {
            String username = data[0];
            if (userRepository.findByUsername(username).isEmpty()) {
                System.out.println("Initializing Claims Officer: " + username);
                User officer = new User();
                officer.setUsername(username);
                officer.setPassword(passwordEncoder.encode("officer123"));
                officer.setFullName(data[1]);
                officer.setPhoneNumber(data[2]);
                officer.setCommissionPercentage(5.0);
                officer.setRole(Role.CLAIMS_OFFICER);
                officer.setFirstLogin(false);
                userRepository.save(officer);
                
                ClaimsOfficerProfile claimsOfficerProfile = new ClaimsOfficerProfile();
                claimsOfficerProfile.setUser(officer);
                claimsOfficerProfile.setDepartment("Claims Department");
                claimsOfficerProfile.setSpecialization("General Medical Claims");
                claimsOfficerProfile.setClaimsProcessedCount(0);
                claimsOfficerProfile.setAverageProcessingTime(24.0);
                claimsOfficerProfile.setYearsOfExperience(5);
                String lic = "LIC-OFF-" + (System.currentTimeMillis() % 10000);
                claimsOfficerProfile.setLicenseNumber(lic);
                System.out.println("Set License Number for " + username + ": " + lic);
                claimsOfficerProfile.setCreatedAt(LocalDateTime.now());
                claimsOfficerProfileRepository.save(claimsOfficerProfile);
            }
        }

        // Seed 4 Underwriters
        String[][] underwriterData = {
            {"vikram_singh", "Vikram Singh", "9876544001"},
            {"ananya_iyer", "Ananya Iyer", "9876544002"},
            {"sanjay_gupta", "Sanjay Gupta", "9876544003"},
            {"neha_reddy", "Neha Reddy", "9876544004"}
        };
        for (String[] data : underwriterData) {
            String username = data[0];
            if (userRepository.findByUsername(username).isEmpty()) {
                User underwriter = new User();
                underwriter.setUsername(username);
                underwriter.setPassword(passwordEncoder.encode("underwriter123"));
                underwriter.setFullName(data[1]);
                underwriter.setPhoneNumber(data[2]);
                underwriter.setCommissionPercentage(10.5);
                underwriter.setRole(Role.UNDERWRITER);
                underwriter.setFirstLogin(true);
                userRepository.save(underwriter);
                
                UnderwriterProfile underwriterProfile = new UnderwriterProfile();
                underwriterProfile.setUser(underwriter);
                underwriterProfile.setSpecialization("Group Health Policies");
                underwriterProfile.setYearsOfExperience(3);
                underwriterProfile.setCommissionPercentage(2.5);
                underwriterProfile.setLicenseNumber("LIC-UND-" + System.currentTimeMillis() % 10000);
                underwriterProfile.setLicenseState("Default");
                underwriterProfile.setLicenseExpiryDate(LocalDateTime.now().plusYears(5));
                underwriterProfile.setCreatedAt(LocalDateTime.now());
            }
        }

        // --- Data Fix: Align all policies to 3-month billing cycle ---
        groupPolicyRepository.findAll().forEach(policy -> {
            if (policy.getStartDate() != null && policy.getNextBillingDate() != null) {
                java.time.LocalDate correctDate = policy.getStartDate().plusMonths(3);
                if (policy.getNextBillingDate().isBefore(correctDate)) {
                    System.out.println("Fixing billing date for policy " + policy.getPolicyNumber() + ": " + policy.getNextBillingDate() + " -> " + correctDate);
                    policy.setNextBillingDate(correctDate);
                    policy.setBillingCycle(org.hartford.surehealth.enums.BillingCycle.QUARTERLY);
                    groupPolicyRepository.save(policy);
                }
            }
        });
    }
}



