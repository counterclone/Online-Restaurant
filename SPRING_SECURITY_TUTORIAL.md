# 🔐 Complete Spring Security Tutorial for Your Application

## Table of Contents

1. [What is Spring Security?](#what-is-spring-security)
2. [JWT (JSON Web Tokens) Explained](#jwt-json-web-tokens-explained)
3. [Security Flow in Your Application](#security-flow-in-your-application)
4. [CustomUserDetailsService Explained](#customuserdetailsservice-explained)
5. [AuthService Explained](#authservice-explained)
6. [SecurityConfig Explained](#securityconfig-explained)
7. [JwtUtil Explained](#jwtutil-explained)
8. [JwtAuthenticationFilter Explained](#jwtauthenticationfilter-explained)
9. [ResponseEntity Explained](#responseentity-explained)
10. [Authentication Parameter Explained](#authentication-parameter-explained)
11. [@PreAuthorize Explained](#preauthorize-explained)
12. [Complete Request Flow](#complete-request-flow)

---

## What is Spring Security?

**Spring Security** is a framework that provides:

- **Authentication**: "Who are you?" (Login/Register)
- **Authorization**: "What can you do?" (Permissions/Roles)
- **Protection**: Against attacks (CSRF, XSS, etc.)

Think of it like a **bouncer at a club**:

- **Authentication** = Checking your ID (Are you really John?)
- **Authorization** = Checking if you're VIP (Can you enter VIP area?)

---

## JWT (JSON Web Tokens) Explained

### What is JWT?

JWT is like a **temporary ID card** that proves you're logged in. Instead of storing sessions on the server, the token is stored on the client (browser).

### JWT Structure

A JWT has 3 parts separated by dots (`.`):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huIiwicm9sZSI6IkNVU1RPTUVSIn0.signature
   └─ Header ─┘   └─────────── Payload ───────────┘   └─ Signature ─┘
```

1. **Header**: Algorithm used (HMAC SHA256)
2. **Payload**: Your data (username, role, email, etc.)
3. **Signature**: Secret key to verify token hasn't been tampered with

### Why JWT?

✅ **Stateless**: Server doesn't need to store sessions  
✅ **Scalable**: Works across multiple servers  
✅ **Secure**: Signed with secret key  
✅ **Portable**: Client can store it anywhere (localStorage, cookie)

### JWT in Your App

When user logs in:

```
User → Login → Server generates JWT → Client stores it
```

When user makes request:

```
Client → Sends JWT in header → Server validates → Allows/Denies
```

---

## Security Flow in Your Application

Here's the complete flow from registration to accessing protected endpoints:

```
1. User Registers/Logs In
   ↓
2. AuthService creates JWT token
   ↓
3. Client stores token (localStorage)
   ↓
4. Client makes API request with token in header
   ↓
5. JwtAuthenticationFilter intercepts request
   ↓
6. Filter validates token and loads user details
   ↓
7. @PreAuthorize checks if user has required role
   ↓
8. Controller method executes
```

---

## CustomUserDetailsService Explained

**File**: `CustomUserDetailsService.java`

### What is it?

Spring Security needs to know **how to load user information**. `CustomUserDetailsService` tells Spring Security: "When I give you a username, here's how to find that user and their roles."

### Code Breakdown

```java
@Service
public class CustomUserDetailsService implements UserDetailsService {
    // This tells Spring: "I'm the service that loads users"
}
```

### The `loadUserByUsername` Method

```java
@Override
public UserDetails loadUserByUsername(String username) {
    // Step 1: Find user in database
    User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new UsernameNotFoundException("User not found"));

    // Step 2: Build Spring Security User object
    return User.builder()
        .username(user.getUsername())           // Login name
        .password(user.getPassword())           // Hashed password
        .authorities(getAuthorities(user.getRole()))  // Roles (ROLE_ADMIN, etc.)
        .disabled(!user.getEnabled())          // Is account active?
        .build();
}
```

**What happens:**

1. Spring Security calls this method with a username
2. You look up the user in your database
3. You convert your `User` model to Spring Security's `UserDetails`
4. Spring Security uses this for authentication

### The `getAuthorities` Method

```java
private Collection<? extends GrantedAuthority> getAuthorities(String role) {
    List<GrantedAuthority> authorities = new ArrayList<>();
    authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
    return authorities;
}
```

**What it does:**

- Converts your role string (`"ADMIN"`) to Spring Security format (`"ROLE_ADMIN"`)
- Spring Security requires the `ROLE_` prefix for role-based checks

**Example:**

- Database has: `role = "ADMIN"`
- Spring Security gets: `"ROLE_ADMIN"`
- `@PreAuthorize("hasRole('ADMIN')")` checks for `"ROLE_ADMIN"`

### When is it used?

1. **During Login**: Spring Security validates password
2. **During JWT Validation**: Filter loads user details to check token
3. **During Authorization**: Spring Security checks user's roles

---

## AuthService Explained

**File**: `AuthService.java`

### What is it?

`AuthService` handles **authentication logic**: registration and login. It's the "front desk" of your security system.

### Registration Flow

```java
public Map<String, Object> register(User user) {
    // Step 1: Check if username/email already exists
    if (userRepository.existsByUsername(user.getUsername())) {
        throw new RuntimeException("Username already exists");
    }

    // Step 2: Hash the password (NEVER store plain passwords!)
    user.setPassword(passwordEncoder.encode(user.getPassword()));
    // "password123" → "$2a$10$N9qo8uLOickgx2ZMRZoMye..."

    // Step 3: Set default role if not provided
    if (user.getRole() == null || user.getRole().isEmpty()) {
        user.setRole("CUSTOMER");
    }

    // Step 4: Save user to database
    User savedUser = userRepository.save(user);

    // Step 5: Auto-create DeliveryAgent record if needed
    if ("DELIVERY_AGENT".equals(savedUser.getRole())) {
        DeliveryAgent agent = new DeliveryAgent();
        agent.setUserId(savedUser.getId());
        agent.setVehicleNumber("TBD");
        agent.setAvailable(true);
        deliveryAgentRepository.save(agent);
    }

    // Step 6: Generate JWT token
    String token = jwtUtil.generateToken(
        savedUser.getUsername(),
        savedUser.getRole(),
        savedUser.getEmail(),
        savedUser.getFirstName(),
        savedUser.getLastName()
    );

    // Step 7: Return token and user info
    Map<String, Object> response = new HashMap<>();
    response.put("token", token);
    response.put("user", createUserResponse(savedUser));
    return response;
}
```

### Login Flow

```java
public Map<String, Object> login(String username, String password) {
    // Step 1: Authenticate user (Spring Security checks password)
    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(username, password)
    );
    // This internally calls CustomUserDetailsService.loadUserByUsername()
    // and compares passwords using BCrypt

    // Step 2: Load user from database
    User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new UsernameNotFoundException("User not found"));

    // Step 3: Check if account is enabled
    if (!user.getEnabled()) {
        throw new RuntimeException("User account is disabled");
    }

    // Step 4: Generate JWT token
    String token = jwtUtil.generateToken(...);

    // Step 5: Return token and user info
    return response;
}
```

### Key Points

1. **Password Hashing**: Uses `BCryptPasswordEncoder` - passwords are NEVER stored in plain text
2. **Token Generation**: Creates JWT after successful registration/login
3. **Auto-setup**: Automatically creates DeliveryAgent record for delivery agents

---

## SecurityConfig Explained

**File**: `SecurityConfig.java`

### What is it?

`SecurityConfig` is the **main security configuration** - it tells Spring Security how to behave. Think of it as the "security rulebook" for your application.

### Key Annotations

```java
@Configuration          // This is a configuration class
@EnableWebSecurity     // Enable Spring Security
@EnableMethodSecurity  // Enable @PreAuthorize annotations
public class SecurityConfig {
```

### Components Explained

#### 1. Password Encoder

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

**What it does:**

- Encodes passwords using BCrypt algorithm
- Used when registering new users
- Used when validating passwords during login

**Example:**

- Input: `"password123"`
- Output: `"$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"`
- **One-way**: Can't reverse it (that's why we can't "decrypt" passwords)

#### 2. Authentication Provider

```java
@Bean
public DaoAuthenticationProvider authenticationProvider() {
    DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
    authProvider.setUserDetailsService(userDetailsService);  // How to load users
    authProvider.setPasswordEncoder(passwordEncoder());       // How to check passwords
    return authProvider;
}
```

**What it does:**

- Tells Spring Security:
  - "Use `CustomUserDetailsService` to load users"
  - "Use `BCryptPasswordEncoder` to check passwords"

#### 3. Authentication Manager

```java
@Bean
public AuthenticationManager authenticationManager(...) {
    return authConfig.getAuthenticationManager();
}
```

**What it does:**

- Manages authentication process
- Used by `AuthService.login()` to validate credentials

#### 4. Security Filter Chain (THE MOST IMPORTANT PART!)

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) {
    http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
        // Allow requests from Angular frontend (localhost:4200)

        .csrf(csrf -> csrf.disable())
        // Disable CSRF protection (we use JWT instead)

        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        // Don't create sessions (we use stateless JWT)

        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/auth/**").permitAll()  // Anyone can access /auth/register and /auth/login
            .anyRequest().authenticated()             // Everything else requires authentication
        )

        .authenticationProvider(authenticationProvider())
        // Use our custom authentication provider

        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        // Add our JWT filter BEFORE Spring's default authentication filter

    return http.build();
}
```

**Breaking it down:**

1. **CORS Configuration**: Allows Angular app (localhost:4200) to make requests
2. **CSRF Disabled**: JWT tokens are immune to CSRF attacks
3. **Stateless**: No server-side sessions (JWT is stateless)
4. **Authorization Rules**:
   - `/auth/**` → Anyone can access (public endpoints)
   - Everything else → Must be authenticated
5. **JWT Filter**: Intercepts every request to validate JWT token

#### 5. CORS Configuration

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200"));
    // Only allow requests from Angular app

    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    // Allow these HTTP methods

    configuration.setAllowedHeaders(Arrays.asList("*"));
    // Allow all headers (needed for Authorization header with JWT)

    configuration.setAllowCredentials(true);
    // Allow cookies/credentials

    return source;
}
```

**What is CORS?**

- **Cross-Origin Resource Sharing**
- Browser security feature that blocks requests from different origins
- Your Angular app (localhost:4200) needs permission to call backend (localhost:8080)

---

## JwtUtil Explained

**File**: `JwtUtil.java`

### What is it?

`JwtUtil` is a utility class that **creates and validates JWT tokens**. It's like a "token factory" and "token validator".

### Key Methods

#### 1. Generate Token

```java
public String generateToken(String username, String role, String email, String firstName, String lastName) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("role", role);           // Store role in token
    claims.put("email", email);         // Store email in token
    claims.put("firstName", firstName); // Store firstName in token
    claims.put("lastName", lastName);    // Store lastName in token

    return createToken(claims, username);
}
```

**What it does:**

- Takes user information
- Puts it in a "claims" map (data stored in token)
- Creates and signs the token

#### 2. Create Token (Private Method)

```java
private String createToken(Map<String, Object> claims, String subject) {
    return Jwts.builder()
        .claims(claims)                    // Add user data
        .subject(username)                 // Username is the "subject"
        .issuedAt(new Date())              // When token was created
        .expiration(new Date(System.currentTimeMillis() + expiration))  // When it expires
        .signWith(getSigningKey())         // Sign with secret key
        .compact();                        // Build the token string
}
```

**What it does:**

- Builds JWT with:
  - **Claims**: User data (role, email, etc.)
  - **Subject**: Username
  - **Issued At**: Current time
  - **Expiration**: Current time + expiration (from config)
  - **Signature**: Signed with secret key

#### 3. Extract Username

```java
public String extractUsername(String token) {
    return extractClaim(token, Claims::getSubject);
}
```

**What it does:**

- Extracts username from token
- The "subject" field contains the username

#### 4. Validate Token

```java
public Boolean validateToken(String token, String username) {
    final String extractedUsername = extractUsername(token);
    return (extractedUsername.equals(username) && !isTokenExpired(token));
}
```

**What it does:**

- Checks if:
  1. Username in token matches provided username
  2. Token hasn't expired
- Returns `true` if valid, `false` otherwise

#### 5. Extract All Claims

```java
private Claims extractAllClaims(String token) {
    return Jwts.parser()
        .verifyWith(getSigningKey())  // Verify signature with secret key
        .build()
        .parseSignedClaims(token)      // Parse the token
        .getPayload();                 // Get the data (claims)
}
```

**What it does:**

- Parses JWT token
- Verifies signature (ensures token wasn't tampered with)
- Returns all data stored in token

### Secret Key

```java
private SecretKey getSigningKey() {
    return Keys.hmacShaKeyFor(secret.getBytes());
}
```

**What it does:**

- Creates signing key from secret (stored in `application.properties`)
- Used to sign tokens (so they can't be forged)
- Used to verify tokens (to ensure they're authentic)

**Important:** The secret key must be:

- Long and random
- Kept secret (never commit to Git!)
- Same for signing and verifying

---

## JwtAuthenticationFilter Explained

**File**: `JwtAuthenticationFilter.java`

### What is it?

`JwtAuthenticationFilter` is a **filter that runs before every request**. It intercepts HTTP requests, extracts JWT tokens, validates them, and sets up Spring Security context.

### How Filters Work

```
Request → Filter 1 → Filter 2 → Filter 3 → Controller
```

Your filter runs **before** the controller, so it can:

- Check if user is authenticated
- Load user details
- Set up security context

### Code Breakdown

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    // Extends OncePerRequestFilter = runs once per HTTP request
}
```

### The `doFilterInternal` Method

This method runs **for every HTTP request**:

```java
@Override
protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) {

    // Step 1: Extract JWT token from Authorization header
    final String authorizationHeader = request.getHeader("Authorization");
    // Header looks like: "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

    String username = null;
    String jwt = null;

    if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
        jwt = authorizationHeader.substring(7);  // Remove "Bearer " prefix
        username = jwtUtil.extractUsername(jwt);  // Get username from token
    }

    // Step 2: If token exists and user not already authenticated
    if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

        // Step 3: Load user details from database
        UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
        // This calls CustomUserDetailsService.loadUserByUsername()

        // Step 4: Validate token
        if (jwtUtil.validateToken(jwt, username)) {

            // Step 5: Create authentication token
            UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(
                    userDetails,                    // User details
                    null,                           // Credentials (not needed for JWT)
                    userDetails.getAuthorities()    // User roles
                );

            // Step 6: Set request details
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // Step 7: Set authentication in Spring Security context
            SecurityContextHolder.getContext().setAuthentication(authToken);
            // Now Spring Security knows who the user is!
        }
    }

    // Step 8: Continue to next filter or controller
    chain.doFilter(request, response);
}
```

### Flow Diagram

```
1. Request arrives with "Authorization: Bearer <token>"
   ↓
2. Filter extracts token
   ↓
3. Filter extracts username from token
   ↓
4. Filter loads user details from database
   ↓
5. Filter validates token (not expired, correct username)
   ↓
6. Filter creates Authentication object with user + roles
   ↓
7. Filter sets Authentication in SecurityContext
   ↓
8. Request continues to controller
   ↓
9. @PreAuthorize can now check user's roles
```

### Why This is Important

Without this filter:

- Controllers wouldn't know who the user is
- `@PreAuthorize` wouldn't work
- `Authentication` parameter would be null

With this filter:

- Every request is authenticated
- User details are available in controllers
- Role-based access control works

---

## ResponseEntity Explained

### What is ResponseEntity?

`ResponseEntity` is Spring's way of returning **HTTP responses** with:

- Status code (200 OK, 404 Not Found, etc.)
- Headers
- Body (data)

### Basic Usage

```java
// Return 200 OK with data
return ResponseEntity.ok(data);

// Return 404 Not Found
return ResponseEntity.notFound().build();

// Return 400 Bad Request with error message
return ResponseEntity.badRequest().body(Map.of("error", "Invalid input"));
```

### Examples from Your Code

#### Example 1: Success Response

```java
@GetMapping
public ResponseEntity<List<Address>> getAddresses(Authentication authentication) {
    List<Address> addresses = addressService.getAddressesByUserId(userId);
    return ResponseEntity.ok(addresses);
    // Returns: HTTP 200 OK with addresses in body
}
```

#### Example 2: Error Response

```java
@PostMapping("/register")
public ResponseEntity<Map<String, Object>> register(@RequestBody User user) {
    try {
        Map<String, Object> response = authService.register(user);
        return ResponseEntity.ok(response);  // 200 OK
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest()   // 400 Bad Request
            .body(Map.of("error", e.getMessage()));
    }
}
```

#### Example 3: Not Found Response

```java
@GetMapping("/{id}")
public ResponseEntity<Address> getAddressById(@PathVariable Long id) {
    return addressService.getAddressById(id)
        .map(ResponseEntity::ok)              // If found: 200 OK
        .orElse(ResponseEntity.notFound().build());  // If not found: 404
}
```

### Common Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Authenticated but not authorized
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Server error

### Why Use ResponseEntity?

1. **Control**: You decide the exact HTTP status code
2. **Clarity**: Makes API responses explicit
3. **Flexibility**: Can add headers, change status codes
4. **RESTful**: Follows REST API best practices

---

## Authentication Parameter Explained

### What is Authentication?

`Authentication` is a Spring Security object that contains:

- **Principal**: The user (username)
- **Credentials**: Password (usually null for JWT)
- **Authorities**: User's roles/permissions

### How to Use It

```java
@GetMapping
@PreAuthorize("hasRole('CUSTOMER')")
public ResponseEntity<List<Address>> getAddresses(Authentication authentication) {
    // Spring Security automatically injects Authentication object
    // It's populated by JwtAuthenticationFilter
}
```

### Extracting User Information

#### Method 1: Get Username

```java
String username = authentication.getName();
// Returns: "john_doe"
```

#### Method 2: Get Authorities (Roles)

```java
Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
// Returns: [ROLE_CUSTOMER, ROLE_ADMIN, ...]
```

#### Method 3: Get Principal (UserDetails)

```java
UserDetails userDetails = (UserDetails) authentication.getPrincipal();
String username = userDetails.getUsername();
Collection<? extends GrantedAuthority> roles = userDetails.getAuthorities();
```

### Common Pattern: Get User ID

In your controllers, you often see:

```java
private Long getUserIdFromAuth(Authentication authentication) {
    String username = authentication.getName();
    User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new RuntimeException("User not found"));
    return user.getId();
}
```

**Why?**

- `Authentication` only has username, not user ID
- You need to look up user in database to get ID
- Then use ID for database queries

### When is Authentication Available?

✅ **Available when:**

- User is authenticated (has valid JWT)
- `JwtAuthenticationFilter` successfully validated token
- Request passed through security filter chain

❌ **Not available when:**

- User not logged in
- JWT token invalid/expired
- Request to public endpoint (but you can still inject it if authenticated)

### Example Usage

```java
@PostMapping
@PreAuthorize("hasRole('CUSTOMER')")
public ResponseEntity<Address> createAddress(
    @RequestBody Address address,
    Authentication authentication  // Injected by Spring Security
) {
    Long userId = getUserIdFromAuth(authentication);  // Get user ID
    address.setUserId(userId);                        // Set user ID
    return ResponseEntity.ok(addressService.createAddress(address));
}
```

---

## @PreAuthorize Explained

### What is @PreAuthorize?

`@PreAuthorize` is an annotation that **checks authorization BEFORE a method runs**. It's like a "bouncer" that checks if you have the right role.

### Basic Syntax

```java
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> createRestaurant(...) {
    // Only ADMIN can access this
}
```

### Common Expressions

#### 1. hasRole()

```java
@PreAuthorize("hasRole('ADMIN')")
// User must have ROLE_ADMIN
```

**Note:** Spring Security automatically adds `ROLE_` prefix, so:

- `hasRole('ADMIN')` checks for `ROLE_ADMIN`
- Database role: `"ADMIN"` → Spring Security: `"ROLE_ADMIN"`

#### 2. hasAnyRole()

```java
@PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'DELIVERY_AGENT')")
// User must have ONE of these roles
```

#### 3. hasAuthority()

```java
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
// Same as hasRole('ADMIN'), but explicitly includes ROLE_ prefix
```

### Examples from Your Code

#### Example 1: Admin Only

```java
@PostMapping
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<Restaurant> createRestaurant(@RequestBody Restaurant restaurant) {
    // Only ADMIN can create restaurants
}
```

#### Example 2: Multiple Roles

```java
@GetMapping
@PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'DELIVERY_AGENT')")
public ResponseEntity<List<Address>> getAddresses(Authentication authentication) {
    // All three roles can view addresses
}
```

#### Example 3: Customer Only

```java
@PostMapping
@PreAuthorize("hasRole('CUSTOMER')")
public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest) {
    // Only CUSTOMER can place orders
}
```

### How It Works

```
1. Request arrives
   ↓
2. JwtAuthenticationFilter validates token and sets Authentication
   ↓
3. @PreAuthorize checks if user has required role
   ↓
4. If YES → Method executes
   If NO → 403 Forbidden error
```

### What Happens if Authorization Fails?

```java
// User tries to access admin endpoint but is CUSTOMER
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> createRestaurant(...) {
    // This method NEVER runs
    // Spring Security throws AccessDeniedException
    // Returns: HTTP 403 Forbidden
}
```

### Enabling @PreAuthorize

You need `@EnableMethodSecurity` in `SecurityConfig`:

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity  // ← This enables @PreAuthorize
public class SecurityConfig {
    // ...
}
```

### Advanced: Using Authentication in Expression

You can also access `Authentication` in the expression:

```java
@PreAuthorize("hasRole('CUSTOMER') and authentication.name == #username")
public ResponseEntity<Profile> getProfile(@PathVariable String username) {
    // Only if user is CUSTOMER AND username matches
}
```

---

## Complete Request Flow

Let's trace a complete request from frontend to backend:

### Scenario: Customer Views Their Addresses

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. FRONTEND (Angular)                                           │
│    User clicks "View Addresses"                                 │
│    Angular service makes HTTP request:                          │ 
│    GET http://localhost:8080/api/addresses                      │
│    Headers: { "Authorization": "Bearer <jwt_token>" }           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. SPRING SECURITY FILTER CHAIN                                 │
│    Request intercepted by security filters                     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. JwtAuthenticationFilter (doFilterInternal)                  │
│    - Extracts token from "Authorization" header               │
│    - Calls jwtUtil.extractUsername(token)                      │
│    - Gets username: "john_doe"                                 │
│    - Calls userDetailsService.loadUserByUsername("john_doe")   │
│    - Loads user from database                                  │
│    - Calls jwtUtil.validateToken(token, "john_doe")            │
│    - Token is valid!                                           │
│    - Creates Authentication object with user + roles           │
│    - Sets Authentication in SecurityContext                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. SecurityConfig Authorization Check                           │
│    - Checks: Is /api/addresses public? NO                      │
│    - Checks: Is user authenticated? YES (from filter)          │
│    - Allows request to continue                                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. @PreAuthorize Check                                          │
│    - Expression: hasAnyRole('CUSTOMER', 'ADMIN', 'DELIVERY_AGENT')│
│    - Gets user's roles from Authentication: ["ROLE_CUSTOMER"]   │
│    - Checks: Does user have ROLE_CUSTOMER? YES                 │
│    - Authorization passed!                                     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. AddressController.getAddresses()                            │
│    - Spring injects Authentication parameter                   │
│    - Calls getUserIdFromAuth(authentication)                   │
│    - Gets userId: 123                                           │
│    - Calls addressService.getAddressesByUserId(123)            │
│    - Returns list of addresses                                  │
│    - Wraps in ResponseEntity.ok(addresses)                     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. RESPONSE                                                     │
│    HTTP 200 OK                                                  │
│    Body: [ { "id": 1, "street": "123 Main St", ... }, ... ]    │
│    Frontend receives addresses and displays them                │
└─────────────────────────────────────────────────────────────────┘
```

### Scenario: Unauthorized Access Attempt

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. FRONTEND                                                     │
│    Customer tries to create restaurant (admin-only)            │
│    POST http://localhost:8080/api/restaurants                   │
│    Headers: { "Authorization": "Bearer <customer_token>" }      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. JwtAuthenticationFilter                                      │
│    - Validates token: SUCCESS                                   │
│    - Sets Authentication with ROLE_CUSTOMER                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. @PreAuthorize Check                                          │
│    - Expression: hasRole('ADMIN')                               │
│    - User has: ROLE_CUSTOMER                                    │
│    - Check: Does ROLE_CUSTOMER == ROLE_ADMIN? NO                │
│    - Authorization FAILED!                                      │
│    - Throws AccessDeniedException                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. RESPONSE                                                     │
│    HTTP 403 Forbidden                                          │
│    Body: { "error": "Access Denied" }                           │
│    Frontend shows error message                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Summary: Key Concepts

### 1. Authentication vs Authorization

- **Authentication**: "Who are you?" (Login)
- **Authorization**: "What can you do?" (Permissions)

### 2. JWT Flow

1. User logs in → Server generates JWT
2. Client stores JWT
3. Client sends JWT in every request
4. Server validates JWT on every request

### 3. Security Components

- **CustomUserDetailsService**: Loads users for Spring Security
- **AuthService**: Handles registration/login
- **JwtUtil**: Creates/validates JWT tokens
- **JwtAuthenticationFilter**: Validates tokens on every request
- **SecurityConfig**: Main security configuration
- **@PreAuthorize**: Role-based access control

### 4. Request Flow

```
Request → JWT Filter → Security Config → @PreAuthorize → Controller
```

### 5. Key Files

- `SecurityConfig.java`: Main security setup
- `JwtUtil.java`: Token creation/validation
- `JwtAuthenticationFilter.java`: Request interceptor
- `CustomUserDetailsService.java`: User loading
- `AuthService.java`: Login/register logic

---

## Quick Reference

### Common Patterns

```java
// Get user ID from Authentication
private Long getUserIdFromAuth(Authentication authentication) {
    String username = authentication.getName();
    User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new RuntimeException("User not found"));
    return user.getId();
}

// Return success response
return ResponseEntity.ok(data);

// Return error response
return ResponseEntity.badRequest().body(Map.of("error", message));

// Admin only endpoint
@PreAuthorize("hasRole('ADMIN')")

// Multiple roles allowed
@PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
```

---

## Questions?

This tutorial covers all the security features in your application. If you have questions about any specific part, feel free to ask!
