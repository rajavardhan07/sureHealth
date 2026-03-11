package org.hartford.surehealth.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hartford.surehealth.enums.PaymentMode;

import java.math.BigDecimal;

@Data
public class PaymentDTO {
    @NotNull(message = "Invoice ID is required")
    public Long invoiceId;
    
    @NotNull(message = "Amount paid is required")
    @DecimalMin(value = "0.01", message = "Amount paid must be greater than 0")
    public BigDecimal amountPaid;
    
    @NotNull(message = "Payment mode is required")
    public PaymentMode paymentMode;
}

