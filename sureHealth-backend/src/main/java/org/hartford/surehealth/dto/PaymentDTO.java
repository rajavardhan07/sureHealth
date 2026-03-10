package org.hartford.surehealth.dto;

import org.hartford.surehealth.entity.PaymentMode;

import java.math.BigDecimal;

public class PaymentDTO {
    public Long invoiceId;
    public BigDecimal amountPaid;
    public PaymentMode paymentMode;
}
