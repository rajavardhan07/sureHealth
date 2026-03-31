// Enums
export enum Role {
  ADMIN = 'ADMIN',
  HR = 'HR',
  EMPLOYEE = 'EMPLOYEE',
  CLAIMS_OFFICER = 'CLAIMS_OFFICER',
  UNDERWRITER = 'UNDERWRITER'
}

export enum PolicyStatus {
  PENDING_ADMIN_APPROVAL = 'PENDING_ADMIN_APPROVAL',
  PENDING_UNDERWRITER_REVIEW = 'PENDING_UNDERWRITER_REVIEW',
  PENDING_HR_APPROVAL = 'PENDING_HR_APPROVAL',
  INFO_REQUIRED = 'INFO_REQUIRED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED'
}

export enum ClaimStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  INFO_REQUIRED = 'INFO_REQUIRED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED'
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

export enum NotificationType {
  INFO = 'INFO',
  ALERT = 'ALERT',
  SUCCESS = 'SUCCESS'
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

export interface PolicyUpdateDTO {
  status?: string;
  billingCycle?: string;
  basePremium?: number;
  customPremiumPerEmployee?: number;
  waitingPeriodDays?: number;
  startDate?: string;
  endDate?: string;
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
  claimType: string;
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
  phoneNumber?: string;
  licenseNumber?: string;
  commissionPercentage?: number;
}

export interface UnderwriterCreateDTO {
  username: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  licenseNumber?: string;
  commissionPercentage?: number;
}

export interface ClaimsOfficerDashboardDTO {
  totalClaims: number;
  pendingClaims: number;
  approvedToday: number;
  rejectedToday: number;
  issuesRaised: number;
  averageProcessingTime: string;
}

export interface UnderwriterDashboardDTO {
  totalAssigned: number;
  pendingReviews: number;
  approvedPolicies: number;
  issuesRaised: number;
}

export interface AdminDashboardDTO {
  totalClients: number;
  totalUnderwriters: number;
  totalClaimsOfficers: number;
  totalPlans: number;
  activePolicies: number;
  totalEmployees: number;
  pendingClaims: number;
  totalRevenue: number;
  totalClaims: number;
  claimsByStatus: { [key: string]: number };
  policiesByStatus: { [key: string]: number };
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
  industryType?: string;
  numberOfEmployees?: number;
}

export interface InsurancePlan {
  id: number;
  planName: string;
  coverageAmount: number;
  premiumPerEmployee: number;
  description: string;
  durationMonths: number;
  waitingPeriodDays: number;
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
  basePremium?: number;
  waitingPeriodDays?: number;
  customPremiumPerEmployee?: number;
  underwriterComment?: string;
  employees?: Employee[];
}

export interface Employee {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  age?: number;
  gender?: string;
  department?: string;
  designation?: string;
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
  fullName: string;
  phoneNumber?: string;
  licenseNumber?: string;
  commissionPercentage?: number;
  firstLogin: boolean;
  corporateClient?: CorporateClient;
  active?: boolean;
  suspended?: boolean;
  department?: string;
  employee?: Employee;
  createdAt: string;
}

export interface OfficerUpdateDTO {
  fullName: string;
  phoneNumber: string;
  department: string;
  licenseNumber?: string;
  commissionPercentage?: number;
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
  claimType: string;
  submissionDate: string;
}

export interface PremiumInvoice {
  id: number;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  status: InvoiceStatus;
  groupPolicy: GroupPolicy;
  paymentDate?: string;
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

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

