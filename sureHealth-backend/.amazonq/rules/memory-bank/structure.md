# SureHealth Project Structure

## Directory Organization

```
sureHealth/
├── src/
│   ├── main/
│   │   ├── java/org/hartford/surehealth/
│   │   │   ├── config/              # Security and application configuration
│   │   │   ├── controller/          # REST API endpoints
│   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   ├── entity/              # JPA entities and enums
│   │   │   ├── exceptions/          # Custom exception classes
│   │   │   ├── repository/          # Spring Data JPA repositories
│   │   │   ├── service/             # Business logic layer
│   │   │   ├── util/                # Utility classes (JWT)
│   │   │   └── SureHealthApplication.java
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── static/              # Static web resources
│   │       └── templates/           # Template files
│   └── test/
│       └── java/                    # Test classes
├── .amazonq/rules/memory-bank/      # Project documentation
├── pom.xml                          # Maven configuration
└── Documentation files (*.md)
```

## Core Components and Relationships

### 1. Configuration Layer (config/)
**Purpose**: Application-wide configuration and security setup

- **SecurityConfig.java**: Defines SecurityFilterChain with URL-based access rules, CSRF configuration, and authentication manager setup
- **JwtAuthenticationFilter.java**: Intercepts requests to validate JWT tokens and set security context
- **DataInitializer.java**: CommandLineRunner that creates default admin user on application startup

**Relationships**: Configuration layer initializes security infrastructure used by all controllers and services

### 2. Controller Layer (controller/)
**Purpose**: REST API endpoints exposing business functionality

- **AuthController.java**: Handles authentication (`/api/auth/login`)
- **CorporateController.java**: Corporate client registration (`/api/corporate/register`)
- **PolicyController.java**: Policy management endpoints with admin-only approval/rejection
- **EmployeeController.java**: Employee enrollment by HR
- **ClaimController.java**: Claim submission and admin processing

**Relationships**: Controllers receive HTTP requests, delegate to services, return DTOs

### 3. Service Layer (service/)
**Purpose**: Business logic and transaction management

- **CustomUserDetailsService.java**: Loads user details for Spring Security authentication
- **CorporateService.java**: Corporate client business logic
- **PolicyService.java**: Policy request and approval workflows
- **EmployeeService.java**: Employee enrollment and credential generation
- **ClaimService.java**: Claim submission and processing logic

**Relationships**: Services orchestrate business operations, interact with repositories, enforce business rules

### 4. Repository Layer (repository/)
**Purpose**: Data access abstraction using Spring Data JPA

- **UserRepository.java**: User authentication queries
- **CorporateRepository.java**: Corporate client data access
- **GroupPolicyRepository.java**: Policy data persistence
- **EmployeeRepository.java**: Employee data management
- **ClaimRepository.java**: Claim data operations
- **InsurancePlanRepository.java**: Insurance plan catalog access

**Relationships**: Repositories provide CRUD operations and custom queries to service layer

### 5. Entity Layer (entity/)
**Purpose**: JPA entities representing database schema

**Core Entities**:
- **User.java**: Authentication entity with username, password, role
- **CorporateClient.java**: Corporate client profile
- **GroupPolicy.java**: Insurance policy with status and relationships
- **Employee.java**: Employee profile linked to corporate and policy
- **Claim.java**: Insurance claim with amount and status
- **InsurancePlan.java**: Insurance plan catalog

**Enums**:
- **Role.java**: ADMIN, HR, EMPLOYEE
- **PolicyStatus.java**: PENDING, ACTIVE, REJECTED
- **ClaimStatus.java**: PENDING, APPROVED, REJECTED

**Relationships**: Entities have JPA relationships (@ManyToOne, @OneToMany) forming the domain model

### 6. DTO Layer (dto/)
**Purpose**: Data transfer objects for API requests/responses

- **LoginRequestDTO.java** / **LoginResponseDTO.java**: Authentication payloads
- **CorporateRegisterDTO.java**: Corporate registration data
- **PolicyRequestDTO.java**: Policy request payload
- **EmployeeCreateDTO.java**: Employee enrollment data
- **ClaimCreateDTO.java**: Claim submission data

**Relationships**: DTOs decouple API contracts from internal entity structure

### 7. Utility Layer (util/)
**Purpose**: Cross-cutting utility functions

- **JwtUtil.java**: JWT token generation, validation, and claims extraction

**Relationships**: Utilities used by filters and services for token operations

### 8. Exception Layer (exceptions/)
**Purpose**: Custom exception handling

- **InvalidCredentialsException.java**: Authentication failure exception

**Relationships**: Thrown by services, handled by Spring exception handlers

## Architectural Patterns

### Layered Architecture
The application follows a strict layered architecture:
```
Controller → Service → Repository → Database
     ↓          ↓
    DTO      Entity
```

### Dependency Injection
- All components use constructor injection via Lombok's @RequiredArgsConstructor
- Spring manages component lifecycle and dependencies

### Repository Pattern
- Spring Data JPA repositories abstract data access
- Custom query methods defined by method naming conventions

### DTO Pattern
- Separate DTOs for API layer prevent entity exposure
- Services map between DTOs and entities

### Security Filter Chain
- JWT filter executes before controller layer
- SecurityContext populated with authenticated user
- @PreAuthorize annotations enforce method-level security

### Command Pattern
- DataInitializer implements CommandLineRunner for startup tasks

## Data Flow Example: Employee Files Claim

1. **Request**: POST `/api/claim/file` with ClaimCreateDTO
2. **Filter**: JwtAuthenticationFilter validates token, sets authentication
3. **Controller**: ClaimController.fileClaim() receives request
4. **Authorization**: @PreAuthorize checks EMPLOYEE role
5. **Service**: ClaimService processes business logic
6. **Repository**: ClaimRepository persists claim entity
7. **Response**: HTTP 200 with success message

## Configuration Management

### Application Properties
- Database: H2 in-memory database (surehealthdb)
- JPA: Hibernate with auto-update DDL
- Security: JWT secret and expiration configuration
- Server: Port 8080

### Maven Dependencies
- Spring Boot 4.0.3 (parent)
- Spring Security with JWT (jjwt 0.12.3)
- Spring Data JPA with H2 database
- Lombok for boilerplate reduction
- SpringDoc OpenAPI for API documentation
