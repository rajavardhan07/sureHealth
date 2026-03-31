package org.hartford.surehealth.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.hartford.surehealth.dto.BulkUploadResponseDTO;
import org.hartford.surehealth.dto.EmployeeCreateDTO;
import org.hartford.surehealth.dto.EmployeeEditDTO;
import org.hartford.surehealth.entity.Employee;
import org.hartford.surehealth.entity.User;
import org.hartford.surehealth.exceptions.InvalidOperationException;
import org.hartford.surehealth.repository.EmployeeRepository;
import org.hartford.surehealth.repository.UserRepository;
import org.hartford.surehealth.service.EmployeeService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;

import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.ss.usermodel.*;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employee")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:4200")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('HR')")
    public Map<String, String> add(
            @Valid @ModelAttribute EmployeeCreateDTO dto,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        
        try {
            return employeeService.addEmployee(dto, file);
        } catch (Exception e) {
            throw new InvalidOperationException("Failed to add employee: " + e.getMessage());
        }
    }

    @PostMapping(value = "/edit/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('HR')")
    public Map<String, String> editEmployee(
            @PathVariable("id") Long id,
            @ModelAttribute EmployeeEditDTO dto,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        
        try {
            return employeeService.editEmployee(id, dto, file);
        } catch (Exception e) {
            throw new InvalidOperationException("Failed to edit employee: " + e.getMessage());
        }
    }

    @PostMapping(value = "/bulk-upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    /*
        what is consumes?
        consumes is a annotation that is used to specify the media type of the request
        why we are using consumes?
        because the request is a multipart/form-data request
        what is multipart/form-data?
        multipart/form-data is a media type that is used to send data to the server
        it is used to send data to the server in the form of key-value pairs
        it is also used to send files to the server
    */
    @PreAuthorize("hasRole('HR')")
    public BulkUploadResponseDTO bulkUpload(
            @RequestParam("corporateId") Long corporateId,
            @RequestParam("file") MultipartFile file) {
        
        String fileName = file.getOriginalFilename();
        if (fileName == null || !fileName.endsWith(".xlsx")) {
            BulkUploadResponseDTO errorResponse = new BulkUploadResponseDTO();
            errorResponse.getErrors().add("Only .xlsx files are accepted. Please upload an Excel file.");
            return errorResponse;
        }

        return employeeService.bulkAddEmployees(corporateId, file);
    }

    @GetMapping("/bulk-upload/template")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<byte[]> downloadTemplate() {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Employee Template");

            // Create header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Create header row
            String[] headers = {"Full Name", "Email", "Phone", "Age", "Department", "Gender", "Designation", "Join Date"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 5000);
            }

            // Add a sample row
            Row sampleRow = sheet.createRow(1);
            String[] sampleData = {"John Doe", "john.doe@company.com", "9876543210", "30", "IT", "Male", "Software Engineer", "2026-03-22"};
            for (int i = 0; i < sampleData.length; i++) {
                sampleRow.createCell(i).setCellValue(sampleData[i]);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"employee_bulk_upload_template.xlsx\"")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(out.toByteArray());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public Employee getEmployeeById(@PathVariable("id") Long id) {
        return employeeRepository.findById(id).orElseThrow();
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public Employee getMyProfile(Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        return user.getEmployee();
    }

    @GetMapping("/policy/{policyId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'UNDERWRITER')")
    public List<Employee> getEmployeesByPolicy(@PathVariable("policyId") Long policyId) {
        return employeeRepository.findByGroupPolicyId(policyId);
    }

    @GetMapping("/{id}/health-report")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'UNDERWRITER', 'CLAIMS_OFFICER')")
    public ResponseEntity<byte[]> getHealthReport(@PathVariable("id") Long id) {
        Employee emp = employeeRepository.findById(id).orElseThrow();
        if (emp.getHealthReportFile() == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + emp.getHealthReportFileName() + "\"")
            .body(emp.getHealthReportFile());
    }
}
