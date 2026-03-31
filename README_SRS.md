# Software Requirements Specification (SRS) - SureHealth

## 1. Introduction
### 1.1 Purpose
The purpose of this document is to provide a comprehensive overview of the **SureHealth** Health Insurance Management System. It outlines the functional and non-functional requirements, system architecture, and user workflows.

### 1.2 Scope
SureHealth is a web-based platform designed to streamline the health insurance lifecycle, from policy enrollment and quote generation to claim submission and processing. It serves multiple stakeholders including Employees, Corporate HR, Underwriters, Claims Officers, and Administrators.

### 1.3 Definitions, Acronyms, and Abbreviations
*   **SRS**: Software Requirements Specification
*   **HR**: Human Resources (Corporate Client representative)
*   **JWT**: JSON Web Token (for authentication)
*   **DTO**: Data Transfer Object
*   **API**: Application Programming Interface

---

## 2. Overall Description

### 2.1 Product Perspective
SureHealth is a modern health insurance application built with a **Spring Boot** backend and an **Angular** frontend. It follows a microservices-ready layered architecture (Controller -> Service -> Repository).

### 2.2 User Classes and Characteristics
*   **Employee**: The end-user who holds the insurance. Can file claims and view their policy details.
*   **Corporate HR**: Manages insurance for their company's employees. Can request group policies and manage enrollments.
*   **Underwriter**: Evaluates policy requests, performs risk assessment, and approves/rejects policies.
*   **Claims Officer**: Reviews submitted claims, validates bills, and processes approvals or rejections.
*   **Administrator**: Manages the entire system, including insurance plans, users, and overall system configuration.

### 2.3 Operating Environment
*   **Backend**: Java 17+, Maven, Spring Boot 3.x.
*   **Frontend**: Angular 16+, TypeScript, Tailwind CSS.
*   **Database**: Relational Database (H2/PostgreSQL).

---

## 3. System Features & Controllers

### 3.1 Identity & Access Management
**Controller**: `AuthController`, `CorporateController`
*   **Registration**: Support for Corporate Client registration and Employee onboarding.
*   **Authentication**: Secure login using JWT-based authentication.
*   **Profile Management**: Users can update their personal information and view their role-specific dashboards.

### 3.2 Insurance Policy Management
**Controller**: `PolicyController`, `InsurancePlanController`
*   **Plan Management**: Admin can create and modify insurance plans (Base Premium, Coverage limits).
*   **Quote Generation**: HR can request quotes based on employee count and selected plans.
*   **Underwriting Flow**:
    1. HR requests a policy.
    2. System assigns an Underwriter (least load).
    3. Underwriter performs risk analysis.
    4. Policy is Approved/Rejected and activated upon payment.

### 3.3 Claims Management
**Controller**: `ClaimController`
*   **Claim Submission**: Employees can file claims by providing bill amounts and uploading supporting documents.
*   **Review Queue**: Claims are assigned to Claims Officers for review.
*   **Processing**: Officers can approve, reject, or request more information for a claim.
*   **Automation**: System automatically updates the remaining coverage amount upon claim approval.

### 3.4 Billing & Payments
**Controller**: `InvoiceController`, `PaymentController`
*   **Invoicing**: Automatic generation of invoices for active policies.
*   **Payment Processing**: Integration for handling premium payments and claim settlements.

### 3.5 Notifications & Dashboard
**Controller**: `NotificationController`, `DashboardController`
*   **Real-time Alerts**: System notifications for status changes (e.g., "Policy Approved", "Claim Rejected").
*   **Metrics**: Dashboards displaying key performance indicators (KPIs) like total claims processed, active policies, and system health.

---

## 4. External Interface Requirements

### 4.1 User Interfaces
*   **Admin Portal**: Management of plans and system users.
*   **HR Dashboard**: Employee enrollment and policy tracking.
*   **Employee Portal**: Claim submission form and policy overview.
*   **Officer/Underwriter Queue**: Specialized lists for task processing.

### 4.2 Software Interfaces
*   **RESTful APIs**: Backend exposes JSON endpoints for all frontend operations.
*   **Spring Security**: Handles authorization and protection of internal routes.

---

## 5. Non-functional Requirements

### 5.1 Performance
*   System should handle concurrent claim submissions with response times < 2s.
*   Heavy calculations (like risk assessment) should be optimized.

### 5.2 Security
*   Password hashing using BCrypt.
*   Role-Based Access Control (RBAC) enforced at both frontend (Guards) and backend (`@PreAuthorize`).
*   Data integrity for financial records (Claims/Invoices).

### 5.3 Scalability
*   Stateless backend design allows for horizontal scaling.

---

## 6. UML Logic Summary (Based on Diagrams)

### 6.1 Policy Enrollment Sequence
*   HR selects plan -> System calculates quote -> HR submits request -> Underwriter reviews -> Approval -> HR Pays Premium -> Policy Active.

### 6.2 Claim Lifecycle
*   **SUBMITTED** -> **UNDER_REVIEW** -> **APPROVED** (Coverage Updated) / **REJECTED** / **MORE_INFO_REQUIRED**.

### 6.3 Activity Flow
*   The system ensures a strict state machine for policies and claims, preventing unauthorized transitions (e.g., cannot approve a claim if policy is not active).
