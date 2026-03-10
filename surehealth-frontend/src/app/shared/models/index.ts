// Enums
export enum Role {
  ADMIN = 'ADMIN',
  HR = 'HR',
  EMPLOYEE = 'EMPLOYEE',
  CLAIMS_OFFICER = 'CLAIMS_OFFICER'
}

export enum PolicyStatus {
  PENDING_ADMIN_APPROVAL = 'PENDING_ADMIN_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum ClaimStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum InvoiceStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE'
}

export enum PaymentMode {
  UPI = 'UPI',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CARD = 'CARD'
}

export enum PaymentStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY'
}

// DTOs
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
}

export interface CorporateRegisterDTO {
  companyName: string;
  registrationNumber: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  username: string;
  password: string;
}

export interface PolicyRequestDTO {
  corporateId: number;
  planId: number;
}

export interface EmployeeCreateDTO {
  corporateId: number;
  policyId: number;
  fullName: string;
  email: string;
  phone: string;
}

export interface ClaimCreateDTO {
  employeeId: number;
  policyId: number;
  billAmount: number;
  hospitalName: string;
  diagnosis: string;
  treatmentDate: string;
  billNumber: string;
}

export interface ClaimApprovalDTO {
  approvedAmount: number;
}

export interface ClaimRejectionDTO {
  rejectionReason: string;
}

export interface PaymentDTO {
  invoiceId: number;
  amountPaid: number;
  paymentMode: PaymentMode;
}

export interface ChangePasswordDTO {
  oldPassword: string;
  newPassword: string;
}

export interface ClaimsOfficerCreateDTO {
  username: string;
  password: string;
  fullName: string;
}

export interface UnderwriterCreateDTO {
  username: string;
  password: string;
  fullName: string;
}

export interface ClaimsOfficerDashboardDTO {
  totalClaims: number;
  pendingClaims: number;
  approvedToday: number;
  rejectedToday: number;
}

// Entities
export interface CorporateClient {
  id: number;
  companyName: string;
  registrationNumber: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  status: string;
}

export interface InsurancePlan {
  id: number;
  planName: string;
  coverageAmount: number;
  premiumPerEmployee: number;
  description: string;
  durationMonths: number;
  active: boolean;
}

export interface GroupPolicy {
  id: number;
  policyNumber: string;
  startDate: string;
  endDate: string;
  status: PolicyStatus;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  corporateClient: CorporateClient;
  insurancePlan: InsurancePlan;
  assignedUnderwriter?: User;
}

export interface Employee {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  joinDate: string;
  coverageAmount: number;
  remainingCoverage: number;
  employmentStatus: string;
  corporateClient: CorporateClient;
  groupPolicy: GroupPolicy;
}

export interface User {
  id: number;
  username: string;
  role: Role;
  firstLogin: boolean;
  createdAt: string;
  employee?: Employee;
  corporateClient?: CorporateClient;
}

export interface Claim {
  id: number;
  claimNumber: string;
  billAmount: number;
  approvedAmount: number;
  hospitalName: string;
  diagnosis: string;
  treatmentDate: string;
  billNumber: string;
  status: ClaimStatus;
  employee: Employee;
  groupPolicy: GroupPolicy;
  assignedOfficer?: User;
  reviewedBy?: User;
  reviewDate?: string;
  rejectionReason?: string;
}

export interface PremiumInvoice {
  id: number;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  status: InvoiceStatus;
  groupPolicy: GroupPolicy;
}

export interface Payment {
  id: number;
  paymentReferenceNumber: string;
  paymentDate: string;
  amountPaid: number;
  paymentMode: PaymentMode;
  status: PaymentStatus;
  invoice: PremiumInvoice;
}
