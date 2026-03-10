# SureHealth Technology Stack

## Programming Languages and Versions

### Java 17
- **Version**: Java 17 (LTS)
- **Usage**: Primary application language
- **Features Used**: Records (via Lombok), modern language features
- **Configuration**: Set in pom.xml `<java.version>17</java.version>`

## Frameworks and Libraries

### Spring Boot 4.0.3
- **Parent**: spring-boot-starter-parent 4.0.3
- **Core Starters**:
  - `spring-boot-starter-webmvc`: REST API and MVC support
  - `spring-boot-starter-data-jpa`: JPA and Hibernate integration
  - `spring-boot-starter-security`: Security framework
  - `spring-boot-devtools`: Development-time hot reload

### Spring Security
- **Version**: Managed by Spring Boot 4.0.3
- **Features**:
  - SecurityFilterChain configuration (Spring Boot 3+ style)
  - BCrypt password encoding
  - Method-level security with @PreAuthorize
  - Custom authentication filter integration

### JWT (JSON Web Tokens)
- **Library**: io.jsonwebtoken (jjwt)
- **Version**: 0.12.3
- **Modules**:
  - `jjwt-api`: Core JWT API
  - `jjwt-impl`: JWT implementation (runtime)
  - `jjwt-jackson`: Jackson JSON processor (runtime)
- **Usage**: Stateless authentication token generation and validation

### Spring Data JPA
- **Version**: Managed by Spring Boot
- **ORM**: Hibernate
- **Features**:
  - Repository pattern with JpaRepository
  - Custom query methods by naming convention
  - Automatic schema generation

### Lombok
- **Version**: Managed by Spring Boot
- **Features Used**:
  - @Data: Getters, setters, toString, equals, hashCode
  - @RequiredArgsConstructor: Constructor injection
  - @NoArgsConstructor, @AllArgsConstructor: Entity constructors
  - @Builder: Builder pattern for entities
- **Configuration**: Annotation processor configured in maven-compiler-plugin

### SpringDoc OpenAPI
- **Library**: springdoc-openapi-starter-webmvc-ui
- **Version**: 3.0.1
- **Usage**: Automatic API documentation generation
- **Access**: Swagger UI available at `/swagger-ui.html`

## Database

### H2 Database
- **Type**: In-memory relational database
- **Version**: Managed by Spring Boot
- **Configuration**:
  - URL: `jdbc:h2:mem:surehealthdb`
  - Username: `sa`
  - Password: `sa`
  - Console: Enabled at `/h2-console`
- **Dialect**: H2Dialect
- **DDL Strategy**: `update` (auto-update schema)

## Build System

### Apache Maven
- **Version**: Managed by Maven Wrapper
- **Configuration File**: pom.xml
- **Key Plugins**:
  - `maven-compiler-plugin`: Java compilation with Lombok annotation processing
  - `spring-boot-maven-plugin`: Spring Boot packaging and execution

### Maven Wrapper
- **Files**: mvnw (Unix), mvnw.cmd (Windows)
- **Purpose**: Ensures consistent Maven version across environments
- **Configuration**: .mvn/wrapper/maven-wrapper.properties

## Development Tools

### Spring Boot DevTools
- **Scope**: runtime, optional
- **Features**:
  - Automatic application restart on code changes
  - LiveReload support
  - Development-time property defaults

### H2 Console
- **Enabled**: Yes
- **Path**: `/h2-console`
- **Usage**: Database inspection and query execution during development

## Testing Dependencies

### Spring Boot Test Starters
- `spring-boot-starter-data-jpa-test`: JPA testing support
- `spring-boot-starter-security-test`: Security testing utilities
- `spring-boot-starter-webmvc-test`: MVC and REST API testing

## Development Commands

### Build Project
```bash
mvnw clean install
```
Compiles code, runs tests, packages application

### Run Application
```bash
mvnw spring-boot:run
```
Starts embedded Tomcat server on port 8080

### Run Tests
```bash
mvnw test
```
Executes unit and integration tests

### Package Application
```bash
mvnw package
```
Creates executable JAR in target/ directory

### Run Packaged JAR
```bash
java -jar target/sureHealth-0.0.1-SNAPSHOT.jar
```
Runs the packaged application

### Clean Build Artifacts
```bash
mvnw clean
```
Removes target/ directory

## Application Configuration

### application.properties Location
`src/main/resources/application.properties`

### Key Configuration Properties
```properties
# Application
spring.application.name=sureHealth
server.port=8080

# Database
spring.datasource.url=jdbc:h2:mem:surehealthdb
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=sa

# JPA/Hibernate
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# H2 Console
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# JWT
jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
jwt.expiration=86400000
```

## Runtime Environment

### Server
- **Type**: Embedded Apache Tomcat
- **Port**: 8080
- **Context Path**: / (root)

### JVM Requirements
- **Minimum**: Java 17
- **Recommended**: Java 17 LTS

## API Documentation

### Swagger UI
- **URL**: http://localhost:8080/swagger-ui.html
- **Provider**: SpringDoc OpenAPI 3.0.1
- **Features**: Interactive API testing, schema documentation

## Security Configuration

### Password Encoding
- **Algorithm**: BCrypt
- **Provider**: Spring Security PasswordEncoder

### JWT Configuration
- **Secret**: Configured in application.properties
- **Expiration**: 86400000ms (24 hours)
- **Algorithm**: HS256 (HMAC with SHA-256)

## Project Metadata

### Maven Coordinates
- **Group ID**: org.hartford
- **Artifact ID**: sureHealth
- **Version**: 0.0.1-SNAPSHOT
- **Packaging**: JAR

### Base Package
`org.hartford.surehealth`
