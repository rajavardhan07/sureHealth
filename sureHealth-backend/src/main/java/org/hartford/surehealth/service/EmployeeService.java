package org.hartford.surehealth.service;

import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.dto.BulkUploadResponseDTO;
import org.hartford.surehealth.dto.EmployeeCreateDTO;
import org.hartford.surehealth.dto.EmployeeEditDTO;
import org.hartford.surehealth.entity.CorporateClient;
import org.hartford.surehealth.entity.Employee;
import org.hartford.surehealth.entity.User;
import org.hartford.surehealth.enums.Role;
import org.hartford.surehealth.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;
import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final CorporateRepository corporateRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Map<String, String> addEmployee(EmployeeCreateDTO dto, MultipartFile file) throws Exception {
        try {
            CorporateClient corp = corporateRepository.findById(dto.corporateId).orElseThrow();

            Employee emp = new Employee();
            emp.setFullName(dto.fullName);
            emp.setEmail(dto.email);
            emp.setPhone(dto.phone);
            emp.setAge(dto.age);
            emp.setDepartment(dto.department);
            emp.setGender(dto.gender);
            emp.setDesignation(dto.designation);
            if (dto.joinDate != null && !dto.joinDate.isEmpty()) {
                emp.setJoinDate(LocalDate.parse(dto.joinDate));
            } else {
                emp.setJoinDate(LocalDate.now());
            }
            emp.setCorporateClient(corp);

            if (file != null && !file.isEmpty()) {
                emp.setHealthReportFile(file.getBytes());
                emp.setHealthReportFileName(file.getOriginalFilename());
            }

            emp.setCoverageAmount(BigDecimal.ZERO);
            emp.setRemainingCoverage(BigDecimal.ZERO);

            employeeRepository.save(emp);

            String username = dto.email;
            String password = "Welcome@123";

            User user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(Role.EMPLOYEE);
            user.setEmployee(emp);
            user.setCorporateClient(corp); // Associate user with corporate

            userRepository.save(user);
            log.info("Successfully created employee and user for: {}", username);

            Map<String, String> credentials = new HashMap<>();
            credentials.put("username", username);
            credentials.put("password", password);
            credentials.put("message", "Employee added successfully");
            return credentials;
        } catch (Exception e) {
            log.error("Error in addEmployee: {} | DTO: {}", e.getMessage(), dto, e);
            throw e;
        }
    }

    @Transactional
    public Map<String, String> editEmployee(Long id, EmployeeEditDTO dto, MultipartFile file) throws Exception {
        try {
            Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));

            emp.setFullName(dto.fullName);
            emp.setPhone(dto.phone);
            emp.setAge(dto.age);
            emp.setDepartment(dto.department);
            emp.setGender(dto.gender);
            emp.setDesignation(dto.designation);

            if (dto.joinDate != null && !dto.joinDate.isEmpty()) {
                emp.setJoinDate(LocalDate.parse(dto.joinDate));
            }

            if (file != null && !file.isEmpty()) {
                emp.setHealthReportFile(file.getBytes());
                emp.setHealthReportFileName(file.getOriginalFilename());
            }

            employeeRepository.save(emp);

            Map<String, String> res = new HashMap<>();
            res.put("message", "Employee updated successfully");
            return res;
        } catch (Exception e) {
            log.error("Error in editEmployee: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public BulkUploadResponseDTO bulkAddEmployees(Long corporateId, MultipartFile file) {
        BulkUploadResponseDTO response = new BulkUploadResponseDTO();
        List<String> errors = new ArrayList<>();
        List<Map<String, String>> credentials = new ArrayList<>();

        CorporateClient corp = corporateRepository.findById(corporateId)
                .orElseThrow(() -> new RuntimeException("Corporate client not found"));

        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            int totalRows = sheet.getLastRowNum(); // excludes header row (row 0)
            response.setTotalRows(totalRows);

            if (totalRows < 1) {
                errors.add("The file has no data rows. Please add employee data below the header row.");
                response.setErrors(errors);
                return response;
            }

            int successCount = 0;
            int failureCount = 0;

            for (int i = 1; i <= totalRows; i++) {
                Row row = sheet.getRow(i);
                if (row == null || isRowEmpty(row)) {
                    continue;
                }

                try {
                    String fullName = getCellStringValue(row.getCell(0));
                    String email = getCellStringValue(row.getCell(1));
                    String phone = getCellStringValue(row.getCell(2));
                    String ageStr = getCellStringValue(row.getCell(3));
                    String department = getCellStringValue(row.getCell(4));
                    String gender = getCellStringValue(row.getCell(5));
                    String designation = getCellStringValue(row.getCell(6));
                    String joinDateStr = getCellStringValue(row.getCell(7));

                    // Validate required fields
                    List<String> rowErrors = new ArrayList<>();
                    if (fullName == null || fullName.isBlank()) rowErrors.add("Full Name is required");
                    if (email == null || email.isBlank()) rowErrors.add("Email is required");
                    else if (!email.matches("^[\\w.-]+@[\\w.-]+\\.\\w{2,}$")) rowErrors.add("Invalid email format");
                    if (phone == null || phone.isBlank()) rowErrors.add("Phone is required");
                    else if (!phone.matches("^[0-9]{10}$")) rowErrors.add("Phone must be 10 digits");
                    if (ageStr == null || ageStr.isBlank()) rowErrors.add("Age is required");

                    Integer age = null;
                    if (ageStr != null && !ageStr.isBlank()) {
                        try {
                            age = (int) Double.parseDouble(ageStr);
                            if (age <= 0) rowErrors.add("Age must be positive");
                        } catch (NumberFormatException ex) {
                            rowErrors.add("Invalid age value");
                        }
                    }

                    // Check for duplicate email in database
                    if (email != null && !email.isBlank() && userRepository.findByUsername(email).isPresent()) {
                        rowErrors.add("Email already exists: " + email);
                    }

                    if (!rowErrors.isEmpty()) {
                        failureCount++;
                        errors.add("Row " + (i + 1) + ": " + String.join(", ", rowErrors));
                        continue;
                    }

                    // Create Employee
                    Employee emp = new Employee();
                    emp.setFullName(fullName);
                    emp.setEmail(email);
                    emp.setPhone(phone);
                    emp.setAge(age);
                    emp.setDepartment(department);
                    emp.setGender(gender);
                    emp.setDesignation(designation);

                    if (joinDateStr != null && !joinDateStr.isBlank()) {
                        try {
                            emp.setJoinDate(LocalDate.parse(joinDateStr, DateTimeFormatter.ISO_LOCAL_DATE));
                        } catch (DateTimeParseException ex) {
                            emp.setJoinDate(LocalDate.now());
                        }
                    } else {
                        emp.setJoinDate(LocalDate.now());
                    }

                    emp.setCorporateClient(corp);
                    emp.setCoverageAmount(BigDecimal.ZERO);
                    emp.setRemainingCoverage(BigDecimal.ZERO);
                    employeeRepository.save(emp);

                    // Create User
                    String username = email;
                    String password = "Welcome@123";

                    User user = new User();
                    user.setUsername(username);
                    user.setPassword(passwordEncoder.encode(password));
                    user.setRole(Role.EMPLOYEE);
                    user.setEmployee(emp);
                    user.setCorporateClient(corp);
                    userRepository.save(user);

                    Map<String, String> cred = new HashMap<>();
                    cred.put("fullName", fullName);
                    cred.put("username", username);
                    cred.put("password", password);
                    credentials.add(cred);

                    successCount++;
                    log.info("Bulk upload: created employee {}", username);

                } catch (Exception e) {
                    failureCount++;
                    errors.add("Row " + (i + 1) + ": " + e.getMessage());
                    log.error("Bulk upload error at row {}: {}", i + 1, e.getMessage());
                }
            }

            response.setSuccessCount(successCount);
            response.setFailureCount(failureCount);
            response.setErrors(errors);
            response.setCredentials(credentials);

        } catch (Exception e) {
            log.error("Failed to process bulk upload file: {}", e.getMessage(), e);
            errors.add("Failed to read file: " + e.getMessage());
            response.setErrors(errors);
        }

        return response;
    }

    private String getCellStringValue(Cell cell) {
        if (cell == null) return null;
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    LocalDate date = cell.getLocalDateTimeCellValue().toLocalDate();
                    return date.format(DateTimeFormatter.ISO_LOCAL_DATE);
                }
                double numVal = cell.getNumericCellValue();
                if (numVal == Math.floor(numVal) && !Double.isInfinite(numVal)) {
                    return String.valueOf((long) numVal);
                }
                return String.valueOf(numVal);
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case BLANK:
                return null;
            default:
                return null;
        }
    }

    private boolean isRowEmpty(Row row) {
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                String val = getCellStringValue(cell);
                if (val != null && !val.isBlank()) return false;
            }
        }
        return true;
    }
}
