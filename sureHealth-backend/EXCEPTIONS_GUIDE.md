# SureHealth Custom Exceptions Guide

## Overview
This document explains all custom exceptions in the SureHealth application, when they are thrown, and how they are handled.

---

## 1. InvalidCredentialsException

**HTTP Status:** `401 UNAUTHORIZED`

**Purpose:** Thrown when authentication fails due to incorrect username/password or user not found.

**Where It's Used:**
- **AuthService.login()** - When username/password authentication fails
- **AuthService.changePassword()** - When old password doesn't match or user not found

**Example Scenarios:**
```java
// Scenario 1: Wrong password
POST /api/auth/login
{
  "username": "admin",
  "password": "wrongpassword"
}
// Response: 401 - "Invalid username or password"

// Scenario 2: User doesn't exist
POST /api/auth/login
{
  "username": "nonexistent",
  "password": "password123"
}
// Response: 401 - "User not found"

// Scenario 3: Wrong old password during password change
POST /api/auth/change-password
{
  "oldPassword": "wrongold",
  "newPassword": "newpass123"
}
// Response: 401 - "Old password is incorrect"
```

**Response Format:**
```json
{
  "status": 401,
  "message": "Invalid username or password",
  "timestamp": "2026-03-11T14:30:00"
}
```

---

## 2. ResourceNotFoundException

**HTTP Status:** `404 NOT FOUND`

**Purpose:** Thrown when a requested resource (entity) doesn't exist in the database.

**Where It's Used:**
- **CorporateService.getUserByUsername()** - User not found
- **CorporateService.suspendCorporateClient()** - Corporate client not found
- **EmployeeController.getEmployeeById()** - Employee not found
- **PolicyController.getPolicyById()** - Policy not found
- **ClaimController.getClaimById()** - Claim not found

**Example Scenarios:**
```java
// Scenario 1: Employee doesn't exist
GET /api/employee/99999
// Response: 404 - "Employee not found with id: 99999"

// Scenario 2: Policy doesn't exist
GET /api/policy/88888
// Response: 404 - "Policy not found with id: 88888"

// Scenario 3: Corporate client doesn't exist
PUT /api/corporate/77777/suspend
// Response: 404 - "Corporate Client not found with id: 77777"
```

**Response Format:**
```json
{
  "status": 404,
  "message": "Employee not found with id: 99999",
  "timestamp": "2026-03-11T14:30:00"
}
```

---

## 3. DuplicateResourceException

**HTTP Status:** `409 CONFLICT`

**Purpose:** Thrown when trying to create a resource that already exists (violates uniqueness constraint).

**Where It's Used:**
- **CorporateService.registerCorporate()** - Username already exists or email already registered
- **AdminService.createClaimsOfficer()** - Username already exists
- **AdminService.createUnderwriter()** - Username already exists

**Example Scenarios:**
```java
// Scenario 1: Duplicate username during corporate registration
POST /api/corporate/register
{
  "username": "existing_user",
  "contactEmail": "new@email.com",
  ...
}
// Response: 409 - "Username already exists: existing_user"

// Scenario 2: Duplicate corporate email
POST /api/corporate/register
{
  "username": "new_user",
  "contactEmail": "existing@company.com",
  ...
}
// Response: 409 - "Corporate client with this email already exists"

// Scenario 3: Duplicate claims officer username
POST /api/admin/claims-officers
{
  "username": "officer1",
  ...
}
// Response: 409 - "Username already exists"
```

**Response Format:**
```json
{
  "status": 409,
  "message": "Username already exists: existing_user",
  "timestamp": "2026-03-11T14:30:00"
}
```

---

## 4. InvalidOperationException

**HTTP Status:** `400 BAD REQUEST`

**Purpose:** Thrown when a business rule is violated or an operation cannot be performed due to invalid state.

**Where It's Used:**
- **ClaimService.startReview()** - Claim not in SUBMITTED status
- **ClaimService.approveClaim()** - Claim not in UNDER_REVIEW status, or amount validation fails
- **ClaimService.rejectClaim()** - Claim not in UNDER_REVIEW status
- **PolicyService** - Policy status violations
- **EmployeeController.add()** - Employee creation failures

**Example Scenarios:**
```java
// Scenario 1: Trying to review a claim that's already approved
PUT /api/claims/123/start-review
// Response: 400 - "Only SUBMITTED claims can be reviewed"

// Scenario 2: Approving claim with amount exceeding coverage
PUT /api/claims/123/approve
{
  "approvedAmount": 1000000
}
// Response: 400 - "Approved amount exceeds remaining coverage"

// Scenario 3: Approving claim that's not under review
PUT /api/claims/123/approve
// Response: 400 - "Only claims UNDER_REVIEW can be approved"

// Scenario 4: Approved amount exceeds bill amount
PUT /api/claims/123/approve
{
  "approvedAmount": 50000
}
// (Bill amount is 30000)
// Response: 400 - "Approved amount cannot exceed bill amount"
```

**Response Format:**
```json
{
  "status": 400,
  "message": "Only SUBMITTED claims can be reviewed",
  "timestamp": "2026-03-11T14:30:00"
}
```

---

## 5. InsufficientCoverageException

**HTTP Status:** `400 BAD REQUEST`

**Purpose:** Thrown when claim amount exceeds available coverage or tenure-based limits.

**Where It's Used:**
- **ClaimService.approveClaim()** - When approved amount exceeds:
  - Employee's remaining coverage
  - Tenure-based maximum claimable amount

**Example Scenarios:**
```java
// Scenario 1: Claim exceeds remaining coverage
// Employee has ₹50,000 remaining coverage
PUT /api/claims/123/approve
{
  "approvedAmount": 75000
}
// Response: 400 - "Approved amount exceeds remaining coverage"

// Scenario 2: Claim exceeds tenure-based limit
// Employee worked 2 months (can claim only 25% of coverage)
// Coverage: ₹100,000, Max claimable: ₹25,000
PUT /api/claims/123/approve
{
  "approvedAmount": 40000
}
// Response: 400 - "Approved amount exceeds tenure-based limit: 25000"
```

**Tenure-Based Limits:**
- **< 3 months:** 25% of coverage
- **3-6 months:** 50% of coverage
- **6-12 months:** 75% of coverage
- **> 12 months:** 100% of coverage

**Response Format:**
```json
{
  "status": 400,
  "message": "Approved amount exceeds remaining coverage",
  "timestamp": "2026-03-11T14:30:00"
}
```

---

## 6. Validation Exceptions (MethodArgumentNotValidException)

**HTTP Status:** `400 BAD REQUEST`

**Purpose:** Thrown automatically by Spring when `@Valid` annotation detects validation constraint violations.

**Where It's Used:**
- All DTOs with validation annotations (@NotBlank, @Email, @Pattern, etc.)
- Triggered by `@Valid` in controller methods

**Example Scenarios:**
```java
// Scenario 1: Multiple validation errors
POST /api/corporate/register
{
  "companyName": "",
  "contactEmail": "invalid-email",
  "contactPhone": "123",
  "username": "ab",
  "password": "123"
}
// Response: 400 with field-level errors

// Scenario 2: Invalid employee data
POST /api/employee/add
{
  "fullName": "",
  "email": "not-an-email",
  "phone": "12345",
  "age": -5
}
// Response: 400 with field-level errors
```

**Response Format:**
```json
{
  "status": 400,
  "message": "Validation failed",
  "timestamp": "2026-03-11T14:30:00",
  "errors": {
    "companyName": "Company name is required",
    "contactEmail": "Invalid email format",
    "contactPhone": "Phone number must be 10 digits",
    "username": "Username must be between 3 and 50 characters",
    "password": "Password must be at least 6 characters"
  }
}
```

---

## Exception Hierarchy

```
RuntimeException (Java built-in)
│
├── InvalidCredentialsException (401)
├── ResourceNotFoundException (404)
├── DuplicateResourceException (409)
├── InvalidOperationException (400)
└── InsufficientCoverageException (400)

MethodArgumentNotValidException (Spring built-in) (400)
```

---

## Global Exception Handler

All exceptions are caught and handled by **GlobalExceptionHandler** (@RestControllerAdvice):

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(InvalidCredentialsException.class)
    // Returns 401 with error message
    
    @ExceptionHandler(ResourceNotFoundException.class)
    // Returns 404 with error message
    
    @ExceptionHandler(DuplicateResourceException.class)
    // Returns 409 with error message
    
    @ExceptionHandler(InvalidOperationException.class)
    // Returns 400 with error message
    
    @ExceptionHandler(InsufficientCoverageException.class)
    // Returns 400 with error message
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    // Returns 400 with field-level validation errors
    
    @ExceptionHandler(Exception.class)
    // Catches all other exceptions, returns 500
}
```

---

## Testing Exceptions

### Test InvalidCredentialsException
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrongpass"}'
```

### Test ResourceNotFoundException
```bash
curl -X GET http://localhost:8080/api/employee/99999 \
  -H "Authorization: Bearer <token>"
```

### Test DuplicateResourceException
```bash
# Register same username twice
curl -X POST http://localhost:8080/api/corporate/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin",...}'
```

### Test InvalidOperationException
```bash
# Try to approve already approved claim
curl -X PUT http://localhost:8080/api/claims/1/approve \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"approvedAmount":5000}'
```

### Test InsufficientCoverageException
```bash
# Approve claim with amount > remaining coverage
curl -X PUT http://localhost:8080/api/claims/1/approve \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"approvedAmount":999999}'
```

### Test Validation Exceptions
```bash
curl -X POST http://localhost:8080/api/corporate/register \
  -H "Content-Type: application/json" \
  -d '{"companyName":"","contactEmail":"invalid"}'
```

---

## Best Practices

1. **Always use specific exceptions** - Don't use generic RuntimeException
2. **Provide meaningful messages** - Include entity IDs and context
3. **Use appropriate HTTP status codes** - Follow REST conventions
4. **Validate early** - Use @Valid annotations on DTOs
5. **Handle exceptions globally** - Use @RestControllerAdvice
6. **Log exceptions** - Add logging in exception handlers for debugging
7. **Don't expose sensitive data** - Sanitize error messages

---

## Summary Table

| Exception | Status | Use Case | Example |
|-----------|--------|----------|---------|
| InvalidCredentialsException | 401 | Wrong login credentials | Invalid password |
| ResourceNotFoundException | 404 | Entity not found | Employee ID 999 doesn't exist |
| DuplicateResourceException | 409 | Unique constraint violation | Username already taken |
| InvalidOperationException | 400 | Business rule violation | Can't approve submitted claim |
| InsufficientCoverageException | 400 | Coverage limit exceeded | Claim > remaining coverage |
| MethodArgumentNotValidException | 400 | Validation constraint violation | Email format invalid |
