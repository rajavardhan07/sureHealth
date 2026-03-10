# SureHealth - Corporate Health Insurance Management System

## Project Purpose
SureHealth is a comprehensive corporate health insurance management platform that streamlines the administration of group health insurance policies for corporate clients and their employees. The system facilitates policy management, employee enrollment, and claims processing with role-based access control and secure authentication.

## Value Proposition
- **Centralized Management**: Single platform for corporate clients to manage group health insurance policies and employee enrollments
- **Automated Workflows**: Streamlined policy approval, employee onboarding, and claims processing workflows
- **Secure Access**: JWT-based authentication with role-based authorization ensuring data security and proper access control
- **Real-time Processing**: Immediate policy requests, employee additions, and claim submissions with status tracking
- **Compliance Ready**: Built-in audit trails and secure data handling for regulatory compliance

## Key Features and Capabilities

### Corporate Client Management
- Corporate client registration and profile management
- Multiple insurance plan selection and customization
- Group policy request and approval workflow
- Employee roster management and tracking

### Policy Administration
- Group policy creation and management
- Policy status tracking (PENDING, ACTIVE, REJECTED)
- Admin approval/rejection workflow
- Insurance plan catalog with coverage details

### Employee Management
- Employee enrollment by HR representatives
- Default credential generation for first-time access
- Employee profile and policy association
- Role-based employee access to claims

### Claims Processing
- Employee claim submission with amount and description
- Claim status tracking (PENDING, APPROVED, REJECTED)
- Admin review and approval workflow
- Claim history and audit trail

### Security and Authentication
- JWT-based stateless authentication
- BCrypt password encryption
- Role-based authorization (ADMIN, HR, EMPLOYEE)
- Method-level and URL-level security controls
- Default admin account for system initialization

## Target Users and Use Cases

### System Administrators (ADMIN Role)
- **Use Cases**: 
  - Approve or reject corporate policy requests
  - Review and process employee claims
  - Monitor system-wide policy and claim status
  - Manage insurance plan catalog
- **Access Level**: Full system access with approval authority

### HR Representatives (HR Role)
- **Use Cases**:
  - Register corporate client accounts
  - Request group insurance policies for their organization
  - Add and manage employee enrollments
  - Track policy status for their corporate client
- **Access Level**: Corporate-specific management capabilities

### Employees (EMPLOYEE Role)
- **Use Cases**:
  - File insurance claims for medical expenses
  - Track personal claim status and history
  - View associated policy information
  - Update personal profile information
- **Access Level**: Self-service claim submission and tracking

## Business Workflow
1. HR registers corporate client and requests group policy
2. Admin reviews and approves/rejects policy request
3. HR adds employees to approved policy
4. Employees receive credentials and can file claims
5. Admin reviews and processes employee claims
6. System maintains complete audit trail of all transactions
