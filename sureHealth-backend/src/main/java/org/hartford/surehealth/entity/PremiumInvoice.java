package org.hartford.surehealth.entity;

import org.hartford.surehealth.enums.InvoiceStatus;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PremiumInvoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String invoiceNumber;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private BigDecimal totalAmount;
    private LocalDate paymentDate;

    @Enumerated(EnumType.STRING)
    private InvoiceStatus status = InvoiceStatus.UNPAID;

    @ManyToOne
    @JoinColumn(name = "policy_id")
    private GroupPolicy groupPolicy;

    @OneToMany(mappedBy = "invoice")
    @JsonIgnore
    private List<Payment> payments;
}

