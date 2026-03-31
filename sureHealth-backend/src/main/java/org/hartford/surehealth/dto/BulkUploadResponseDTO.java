package org.hartford.surehealth.dto;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Data
/*
    @Data is a annotation that is used to generate getters and setters for the fields of the class
*/
public class BulkUploadResponseDTO {
    private int totalRows;
    private int successCount;
    private int failureCount;
    private List<String> errors = new ArrayList<>();
    private List<Map<String, String>> credentials = new ArrayList<>();
}
