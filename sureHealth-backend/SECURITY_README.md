# Spring Security with JWT Authentication - Implementation Guide

## Overview
This project implements stateless JWT authentication with role-based authorization for a Corporate Health Insurance system.

## Architecture

### Security Components

1. **JwtUtil** (`util/JwtUtil.java`)
   - Generates JWT tokens with username and role claims
   - Validates tokens and extracts user information
   - Token expiration: 24 hours (configurable)

2. **JwtAuthenticationFilter** (`config/JwtAuthenticationFilter.java`)
   - Intercepts every request
   - Extracts and validates JWT from Authorization header
   - Sets authentication in SecurityContext

3. **SecurityConfig** (`config/SecurityConfig.java`)
   - Configures SecurityFilterChain (Spring Boot 3+ style)
   - Defines URL-based access rules
   - Disables CSRF for REST API
   - Stateless session management

4. **CustomUserDetailsService** (`service/CustomUserDetailsService.java`)
   - Loads user from database
   - Converts to Spring Security UserDetails

5. **AuthController** (`controller/AuthController.java`)
   - POST /api/auth/login - Returns JWT token

## Roles and Permissions

### Role Hierarchy
- **ADMIN**: Full system access
- **HR**: Corporate HR operations
- **EMPLOYEE**: Employee self-service

### URL Access Rules

| URL | Method | Role | Description |
|-----|--------|------|-------------|
| `/api/corporate/register` | POST | PUBLIC | Register new corporate client |
| `/api/auth/login` | POST | PUBLIC | User login |
| `/api/policy/approve/{id}` | PUT | ADMIN | Approve policy |
| `/api/policy/reject/{id}` | PUT | ADMIN | Reject policy |
| `/api/claim/approve/{id}` | PUT | ADMIN | Approve claim |
| `/api/claim/reject/{id}` | PUT | ADMIN | Reject claim |
| `/api/policy/request` | POST | HR | Request new policy |
| `/api/employee/add` | POST | HR | Add employee |
| `/api/claim/file` | POST | EMPLOYEE | File claim |

## Authentication Flow

1. User sends credentials to `/api/auth/login`
2. AuthenticationManager validates credentials
3. JWT token generated with username and role
4. Client stores token
5. Client includes token in Authorization header: `Bearer <token>`
6. JwtAuthenticationFilter validates token on each request
7. SecurityContext updated with authentication
8. Role-based authorization applied

## Configuration

### application.properties
```properties
jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
jwt.expiration=86400000
```

### Password Encoding
- BCryptPasswordEncoder used for all passwords
- Applied in CorporateService and EmployeeService

## Testing

### Default Users

**Admin User** (created on startup):
- Username: `admin`
- Password: `admin123`
- Role: `ADMIN`

### Login Request
```bash
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### Login Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin",
  "role": "ADMIN"
}
```

### Using JWT Token
```bash
GET http://localhost:8080/api/policy/approve/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Security Features

✅ Stateless authentication (JWT)  
✅ BCrypt password encoding  
✅ Role-based authorization  
✅ Method-level security with @PreAuthorize  
✅ URL-based access control  
✅ CSRF disabled (REST API)  
✅ Custom UserDetailsService  
✅ JWT filter for token validation  
✅ Spring Boot 3+ SecurityFilterChain  
✅ H2 console access enabled  

## Dependencies Added

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
```

## Testing Workflow

1. **Register Corporate** (creates HR user)
```bash
POST /api/corporate/register
{
  "companyName": "TechCorp",
  "registrationNumber": "REG123",
  "contactPerson": "John Doe",
  "contactEmail": "john@techcorp.com",
  "contactPhone": "1234567890",
  "username": "hr_techcorp",
  "password": "password123"
}
```

2. **Login as HR**
```bash
POST /api/auth/login
{
  "username": "hr_techcorp",
  "password": "password123"
}
```

3. **Request Policy** (HR role required)
```bash
POST /api/policy/request
Authorization: Bearer <HR_TOKEN>
{
  "corporateId": 1,
  "planId": 1,
  "numberOfEmployees": 50
}
```

4. **Login as Admin**
```bash
POST /api/auth/login
{
  "username": "admin",
  "password": "admin123"
}
```

5. **Approve Policy** (ADMIN role required)
```bash
PUT /api/policy/approve/1
Authorization: Bearer <ADMIN_TOKEN>
```

6. **Add Employee** (HR role required)
```bash
POST /api/employee/add
Authorization: Bearer <HR_TOKEN>
{
  "fullName": "Jane Smith",
  "email": "jane@techcorp.com",
  "phone": "9876543210",
  "corporateId": 1,
  "policyId": 1
}
```

7. **Login as Employee**
```bash
POST /api/auth/login
{
  "username": "jane@techcorp.com",
  "password": "default123"
}
```

8. **File Claim** (EMPLOYEE role required)
```bash
POST /api/claim/file
Authorization: Bearer <EMPLOYEE_TOKEN>
{
  "employeeId": 1,
  "claimAmount": 5000,
  "claimReason": "Medical treatment"
}
```

## Error Handling

- **401 Unauthorized**: Invalid or missing JWT token
- **403 Forbidden**: Valid token but insufficient permissions
- **InvalidCredentialsException**: Wrong username/password

## Notes

- JWT secret should be changed in production
- Token expiration is 24 hours by default
- H2 console accessible at `/h2-console`
- All passwords are BCrypt encoded
- No deprecated classes used (Spring Boot 3+ compatible)
