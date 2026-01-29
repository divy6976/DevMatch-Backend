# DevMatch - Developer Networking Platform

DevMatch is a Tinder-style matchmaking app for developers. Connect with like-minded coders, send requests, and build your dev network.

**Live Demo:** [Frontend](https://dev-tinder-front-end-6vd2.vercel.app/) | [Backend API](https://devtinder-backend.onrender.com)

**Frontend Repo:** [DevTinder-FrontEnd](https://github.com/divy6976/DevTinder-FrontEnd)

---

# HERO Framework - Interview Preparation Guide

## H: How It Started (Context & Motivation)

### The Story

> "I built DevMatch to solve a real problem I observed in the developer community - networking is often awkward and inefficient. Traditional platforms like LinkedIn are too formal, and dating apps don't understand tech culture. I wanted to create a Tinder-style experience specifically for developers to find collaborators, mentors, or even co-founders."

### Problem Identification
- Developers struggle to find like-minded collaborators
- Existing platforms don't cater to tech-specific matching
- Need for a swipe-based, gamified experience for developer networking

### Why I Built It
- Wanted to practice full-stack development end-to-end
- Interested in learning authentication, authorization, and session management
- Wanted to implement complex MongoDB queries with relationships
- Handle cross-origin requests and cookie-based sessions in production

### Learning Goals Achieved
- REST API design patterns
- JWT-based authentication with secure cookies
- MongoDB aggregation and relationship queries
- Production deployment with CORS handling

---

## E: Engineering (Tech Stack & Skills)

### Backend Tech Stack

| Technology | Version | Purpose | Why I Chose It |
|------------|---------|---------|----------------|
| **Node.js** | 18+ | Runtime | Non-blocking I/O, great for real-time apps |
| **Express.js** | 5.1.0 | Framework | Latest version with async error handling |
| **MongoDB** | Atlas | Database | Flexible schema for user profiles |
| **Mongoose** | 8.18.0 | ODM | Schema validation, middleware, populate |
| **JWT** | 9.0.2 | Authentication | Stateless, scalable token-based auth |
| **bcrypt** | 6.0.0 | Security | Industry-standard password hashing (10 salt rounds) |
| **cookie-parser** | 1.4.7 | Session | Secure HTTP-only cookie handling |
| **validator.js** | 13.15.15 | Validation | Robust email/URL validation |
| **CORS** | 2.8.5 | Cross-Origin | Frontend-backend communication |
| **dotenv** | 17.2.2 | Config | Environment variable management |

### Frontend Tech Stack

| Technology | Purpose |
|------------|---------|
| **React** | UI Library |
| **Vite** | Build Tool (faster than CRA) |
| **Tailwind CSS / DaisyUI** | Styling |
| **Redux Toolkit** | State Management |
| **Axios** | HTTP Client |
| **React Router** | Navigation |
| **Vercel** | Deployment |

### Architecture Overview

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   React + Vite  │────────▶│  Express API    │────────▶│  MongoDB Atlas  │
│   (Vercel)      │◀────────│  (Render)       │◀────────│                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
         │                          │
         └──────────────────────────┘
              CORS + HTTP-Only Cookies
              (credentials: true)
```

### Key Technical Decisions

**1. JWT + HTTP-Only Cookies (vs localStorage):**
```javascript
res.cookie("token", token, {
  httpOnly: true,                    // Prevents XSS attacks
  secure: isProd,                    // HTTPS only in production
  sameSite: isProd ? 'none' : 'lax', // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000,   // 7-day expiry
});
```
**Why?** localStorage is vulnerable to XSS. HTTP-only cookies can't be accessed by JavaScript.

**2. Pre-save Middleware for Password Hashing:**
```javascript
userSchema.pre("save", async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});
```
**Why?** Ensures passwords are always hashed before saving, even during password updates.

**3. Instance Methods for Token Generation:**
```javascript
userSchema.methods.getJWT = function() { 
  const token = jwt.sign({id: this._id}, "secret", {expiresIn: "7d"});
  return token;
};
```
**Why?** Encapsulates token logic within the model, following OOP principles.

**4. Schema-Level Validation:**
```javascript
password: {
  type: String,
  validate: {
    validator: function (value) {
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value);
    },
    message: "Password must include uppercase, lowercase, number, and special character"
  }
}
```
**Why?** Single source of truth for validation rules.

---

## R: Results (Features & Accomplishments)

### API Endpoints

#### Auth Router
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register new user with validation |
| POST | `/login` | Authenticate and issue JWT cookie |
| POST | `/logout` | Invalidate session cookie |

#### Profile Router
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile/view` | Get logged-in user's profile |
| PATCH | `/profile/edit` | Update profile (whitelist validation) |
| POST | `/profile/password` | Change password with old password verification |

#### Request Router
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/request/send/:status/:toUserID` | Send interested/ignore request |
| POST | `/request/review/:status/:requestId` | Accept/reject received request |

#### User Router
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user/feed` | Paginated feed of suggested users |
| GET | `/user/requests/received` | Get pending connection requests |
| GET | `/user/requests/connection` | Get all accepted connections |

### Technical Achievements

**1. Smart Feed Algorithm:**
```javascript
// Excludes: self, already connected, pending requests
const excludedUserIDs = new Set();
connections.forEach(conn => {
  excludedUserIDs.add(conn.fromUserID.toString());
  excludedUserIDs.add(conn.toUserID.toString());
});
excludedUserIDs.add(loggedUser.id);

const suggestions = await User.find({
  _id: { $nin: Array.from(excludedUserIDs) }
}).select(USER_SAFE_FIELDS).skip(skip).limit(limit);
```

**2. Bidirectional Connection Check:**
```javascript
const relation = await ConnectionRequest.findOne({
  $or: [
    { fromUserID, toUserID },
    { fromUserID: toUserID, toUserID: fromUserID }
  ]
});
```

**3. Field-Level Security:**
```javascript
const USER_SAFE_FIELDS = ["firstName", "lastName", "gender", "photoUrl", "age", "about", "skills"];
// Never exposes password or email in feed
```

**4. Pagination Support:**
```javascript
const page = parseInt(req.query.page) || 1;
let limit = parseInt(req.query.limit) || 10;
limit = limit > 50 ? 50 : limit;  // Max cap to prevent abuse
const skip = (page - 1) * limit;
```

---

## O: Opportunities Ahead (Future Improvements)

### Backend Improvements

| Feature | Description | Tech Stack |
|---------|-------------|------------|
| **Real-time Chat** | Socket.io integration for instant messaging | Socket.io, Redis |
| **Rate Limiting** | Prevent API abuse | express-rate-limit |
| **Email Verification** | OTP/Link verification on signup | Nodemailer, Redis |
| **Password Reset** | Forgot password flow | Nodemailer, JWT |
| **Image Upload** | Profile photo upload | Cloudinary, Multer |
| **Advanced Matching** | Skills-based matching algorithm | MongoDB Aggregation |
| **Notifications** | Push notifications for matches | Firebase FCM |
| **Testing** | Unit and integration tests | Jest, Supertest |
| **API Documentation** | Interactive API docs | Swagger/OpenAPI |
| **Caching** | Redis caching for feed | Redis |

### Frontend Improvements

| Feature | Description |
|---------|-------------|
| **Swipe Animations** | Tinder-like card animations (Framer Motion) |
| **Dark Mode** | Theme toggle |
| **PWA Support** | Offline capability and installable app |
| **Infinite Scroll** | For feed and connections |
| **Profile Completion** | Progress indicator |
| **Search & Filter** | Filter by skills, location |

---

# Core Concepts - Theory for Verbal Explanation

> **Note:** This section is designed for verbal explanations in interviews. No code needed - just concepts!

---

## Authentication Concepts

### What is Authentication vs Authorization?
- **Authentication:** "Who are you?" - Verifying identity (login)
- **Authorization:** "What can you do?" - Verifying permissions (can this user edit this profile?)

**In my app:** Login is authentication. The middleware checking if you're the receiver of a connection request before accepting it - that's authorization.

### What is JWT (JSON Web Token)?

**Simple Explanation:**
> "JWT is like a digital ID card. When you login, the server gives you a signed token containing your user ID. For every future request, you show this token instead of username/password. The server verifies the signature to trust it's genuine."

**Three Parts:**
1. **Header:** Algorithm used (HS256)
2. **Payload:** User data (user ID, expiry time)
3. **Signature:** Encrypted verification that payload wasn't tampered

**Why JWT over Sessions?**
| Sessions | JWT |
|----------|-----|
| Server stores session data | Server stores nothing (stateless) |
| Hard to scale (session sync needed) | Easy to scale (any server can verify) |
| Requires database lookup | Self-contained, no DB needed |

### What is Hashing vs Encryption?

| Hashing | Encryption |
|---------|------------|
| One-way (can't reverse) | Two-way (can decrypt) |
| Same input = same output | Same input = different output (with different key) |
| Used for passwords | Used for sensitive data transfer |
| bcrypt, SHA-256 | AES, RSA |

**Why bcrypt?**
> "bcrypt is slow by design. It takes ~100ms to hash a password. This makes brute-force attacks impractical - trying millions of passwords would take years."

**Salt Rounds:**
> "Salt is random data added to the password before hashing. Even if two users have the same password, their hashes will be different. 10 salt rounds means 2^10 = 1024 iterations of hashing."

### XSS vs CSRF Attacks

**XSS (Cross-Site Scripting):**
> "Attacker injects malicious JavaScript into your website. If tokens are in localStorage, the script can steal them."
> 
> **Prevention:** HTTP-only cookies (JavaScript can't access them)

**CSRF (Cross-Site Request Forgery):**
> "Attacker tricks your browser into making requests to a site where you're logged in. Your cookies are automatically sent."
>
> **Prevention:** `sameSite` cookie attribute, CSRF tokens

**My Approach:**
> "I use HTTP-only cookies with `sameSite: 'lax'` in development and `sameSite: 'none'` with `secure: true` in production. This protects against both XSS and CSRF."

---

## Database Concepts

### SQL vs NoSQL - When to Use What?

| Use SQL When | Use NoSQL When |
|--------------|----------------|
| Complex relationships (joins) | Flexible/changing schema |
| ACID transactions critical | High read/write speed needed |
| Data structure is fixed | Document-based data |
| Banking, inventory systems | Social media, real-time apps |

**Why MongoDB for DevMatch?**
> "User profiles can have varying fields - some users add 10 skills, some add none. MongoDB's flexible schema handles this naturally. Also, I don't need complex joins - most queries are simple document lookups."

### What is an ODM (Mongoose)?

> "ODM stands for Object Document Mapper. It's like an ORM but for NoSQL databases. Mongoose lets me define schemas, add validations, create middleware, and work with MongoDB using JavaScript objects instead of raw queries."

**Key Mongoose Features I Used:**
- **Schema Validation:** Define rules (required, minLength, enum)
- **Middleware (Hooks):** Run code before/after operations (pre-save for password hashing)
- **Instance Methods:** Add custom functions to documents (getJWT)
- **Populate:** Replace ObjectId references with actual documents

### What is Database Indexing?

> "An index is like a book's table of contents. Instead of scanning every page (document), MongoDB jumps directly to the right location."

**In my app:** Email has `unique: true` which automatically creates an index. This makes login queries fast - MongoDB doesn't scan all users, it directly finds the email.

### What is populate() in Mongoose?

> "It's MongoDB's way of doing a JOIN. When I store `fromUserID: ObjectId("123")`, populate() replaces it with the actual user document."

**Without populate:** `{ fromUserID: "507f1f77bcf86cd799439011" }`
**With populate:** `{ fromUserID: { firstName: "John", lastName: "Doe", email: "john@example.com" } }`

---

## API Design Concepts

### What is REST?

> "REST (Representational State Transfer) is an architectural style for APIs. It uses HTTP methods to perform operations on resources."

| Method | Purpose | Example |
|--------|---------|---------|
| GET | Read data | GET /users (list users) |
| POST | Create new | POST /signup (create user) |
| PUT | Replace entirely | PUT /user/123 (replace user) |
| PATCH | Partial update | PATCH /profile/edit (update fields) |
| DELETE | Remove | DELETE /user/123 |

### What is Middleware?

> "Middleware is a function that runs between receiving a request and sending a response. It's like a security checkpoint at an airport - every request passes through it."

**Types in my app:**
1. **Built-in:** `express.json()` - parses JSON body
2. **Third-party:** `cors()` - handles cross-origin requests
3. **Custom:** `isLoggedIn` - verifies JWT token

**Flow:**
```
Request → CORS → JSON Parser → Cookie Parser → Auth Middleware → Route Handler → Response
```

### What is CORS?

> "CORS (Cross-Origin Resource Sharing) is a security feature. Browsers block requests from one domain to another by default. CORS headers tell the browser which domains are allowed."

**Why I needed it:**
> "My frontend is on Vercel (domain A), backend on Render (domain B). Without CORS configuration, the browser would block API calls."

**Key settings:**
- `origin`: Which domains can access (must be exact, not `*` when using cookies)
- `credentials: true`: Allow cookies to be sent

### HTTP Status Codes I Use

| Code | Meaning | When I Use It |
|------|---------|---------------|
| 200 | OK | Successful request |
| 400 | Bad Request | Validation failed, missing fields |
| 401 | Unauthorized | Not logged in, invalid token |
| 403 | Forbidden | Logged in but not allowed (e.g., accepting someone else's request) |
| 404 | Not Found | User/request doesn't exist |
| 500 | Server Error | Unexpected errors (hide details from user) |

---

## Security Concepts

### Defense in Depth

> "Never rely on a single security measure. I use multiple layers:"

1. **Input Validation:** Check data format before processing
2. **Schema Validation:** Mongoose validates before saving
3. **Authentication:** Verify identity with JWT
4. **Authorization:** Check permissions for each action
5. **Secure Cookies:** HTTP-only, secure, sameSite flags
6. **Password Hashing:** bcrypt with salt

### Whitelist vs Blacklist Validation

| Whitelist | Blacklist |
|-----------|-----------|
| Only allow known-good values | Block known-bad values |
| More secure | Less secure (can miss new attacks) |
| "Only these fields are allowed" | "These fields are not allowed" |

**I use whitelist:**
> "For profile updates, I explicitly list allowed fields: firstName, lastName, photoUrl, etc. Even if someone sends `password` or `isAdmin`, it's ignored."

### Why Not Store Secrets in Code?

> "Secrets in code get committed to Git, visible to anyone with repo access. Environment variables are injected at runtime and never stored in version control."

**My approach:**
- MongoDB URI, JWT secret → `.env` file (gitignored)
- Production → Render's environment variable settings

---

## Architecture Concepts

### Monolithic vs Microservices

| Monolithic | Microservices |
|------------|---------------|
| Single codebase/deployment | Multiple independent services |
| Simpler to develop/debug | Complex but scalable |
| Good for small-medium apps | Good for large teams/apps |

**My app is monolithic:**
> "For a project this size, monolithic makes sense. Microservices add complexity with service discovery, inter-service communication, distributed transactions. I'd split later if needed - maybe chat service, notification service."

### Stateless vs Stateful

| Stateless | Stateful |
|-----------|----------|
| Server stores no session data | Server remembers client state |
| Any server can handle any request | Client tied to specific server |
| JWT-based | Session-based |

**My app is stateless:**
> "Using JWT, any server instance can verify the token and process requests. This makes horizontal scaling easy - just add more servers behind a load balancer."

### What Happens When User Logs In?

1. User sends email + password
2. Server finds user by email
3. bcrypt compares password with stored hash
4. If match, generate JWT with user ID
5. Set JWT in HTTP-only cookie
6. Return user data
7. Frontend stores user in Redux state
8. Future requests include cookie automatically

### What Happens in the Feed Endpoint?

1. Auth middleware verifies JWT, extracts user ID
2. Query all connection requests involving this user
3. Create Set of all user IDs to exclude (connected + pending + self)
4. Query users NOT in excluded set
5. Apply pagination (skip, limit)
6. Select only safe fields (no password/email)
7. Return suggestions array

---

## Frontend Concepts (React)

### Component Lifecycle & Hooks

| Hook | Purpose |
|------|---------|
| `useState` | Local component state |
| `useEffect` | Side effects (API calls, subscriptions) |
| `useContext` | Share state without prop drilling |
| `useSelector` | Read from Redux store |
| `useDispatch` | Dispatch Redux actions |

### Why Redux for Auth State?

> "Authentication state needs to be accessed everywhere - navbar shows username, protected routes check login status, API calls need to know if user is logged in. Redux provides a global store accessible from any component."

### Protected Routes

> "Some pages should only be accessible when logged in. I wrap these routes with a component that checks Redux auth state. If not logged in, redirect to login page."

### Why Axios over Fetch?

| Axios | Fetch |
|-------|-------|
| Automatic JSON parsing | Manual `.json()` call needed |
| Better error handling | Only rejects on network errors |
| Request/response interceptors | No built-in interceptors |
| `withCredentials` for cookies | `credentials: 'include'` |

---

## Performance Concepts

### Pagination - Why It Matters

> "Imagine loading 10,000 users at once - slow network, high memory usage, poor UX. Pagination loads 10-20 at a time. Users scroll, next page loads."

**My implementation:**
- Query params: `?page=2&limit=10`
- Skip first (page-1)*limit documents
- Limit to specified number
- Cap at 50 to prevent abuse

### Database Query Optimization

1. **Indexing:** Email indexed for fast login lookups
2. **Projection:** `select()` only needed fields, not entire document
3. **Lean queries:** Skip Mongoose document overhead when just reading
4. **Limit results:** Never return unlimited data

### Why Use Sets for Exclusion?

> "Sets have O(1) lookup time. When checking if a user should be excluded from feed, I check `excludedSet.has(userId)` which is instant, versus O(n) array search."

---

## Deployment Concepts

### Environment Variables

> "Configuration that changes between environments. In development, I connect to local MongoDB; in production, to MongoDB Atlas. Same code, different config."

### CI/CD Pipeline

> "Continuous Integration/Continuous Deployment. When I push to GitHub, Render/Vercel automatically builds and deploys. No manual FTP uploads."

### Why Separate Frontend/Backend Hosting?

| Frontend (Vercel) | Backend (Render) |
|-------------------|------------------|
| Static files (HTML, JS, CSS) | Node.js server |
| CDN distribution | Single server |
| Instant builds | Background workers |
| Optimized for React/Vite | Optimized for APIs |

---

## Common "Why" Questions

### Why Node.js?
> "Non-blocking I/O is perfect for API servers with many concurrent connections. JavaScript everywhere (frontend + backend) reduces context switching. Huge npm ecosystem for packages."

### Why Express over other frameworks?
> "Minimal, unopinionated, most popular Node framework. Large community, tons of middleware available. Express 5 adds native async/await error handling."

### Why MongoDB over PostgreSQL?
> "User profiles have varying fields. Some users have 10 skills, some have none. MongoDB's flexible schema handles this naturally. No complex joins needed - most queries are simple document lookups."

### What was your biggest challenge?
> "Getting cookies to work across different domains in production. Vercel frontend + Render backend = different domains. Had to configure `sameSite: 'none'`, `secure: true`, exact origin in CORS, and `credentials: true`. Took time to debug."

### What would you do differently?
> "Start with TypeScript for type safety. Add testing from the beginning with Jest. Use better error handling with custom error classes. Implement rate limiting from day one."

---

# Interview Questions & Answers

## Authentication & Security

### Q1: Why did you choose JWT over session-based authentication?
**Answer:** JWT is stateless and scalable. The server doesn't need to store session data, making it easier to scale horizontally. Each request contains all the information needed for authentication in the token itself.

### Q2: Why store JWT in HTTP-only cookies instead of localStorage?
**Answer:** 
- **localStorage** is vulnerable to XSS attacks - any JavaScript can read it
- **HTTP-only cookies** cannot be accessed by JavaScript, preventing XSS token theft
- Combined with `sameSite` and `secure` flags, it also helps prevent CSRF attacks

### Q3: How does your password hashing work?
**Answer:** I use bcrypt with 10 salt rounds. The `pre('save')` middleware automatically hashes the password before saving. The `isModified('password')` check ensures we only re-hash when the password actually changes, preventing double-hashing on other updates.

### Q4: How do you handle password validation?
**Answer:** I use a regex pattern that enforces:
- Minimum 6 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

This validation happens both at the schema level and in the validation middleware.

### Q5: What is the purpose of the `trust proxy` setting?
**Answer:** When deployed behind a reverse proxy (like Render or Heroku), the `secure` cookie flag requires HTTPS. The proxy terminates SSL, so Express sees HTTP. `trust proxy` tells Express to trust the `X-Forwarded-Proto` header to determine the original protocol.

---

## Database & Schema Design

### Q6: Explain your User schema design decisions.
**Answer:**
- **Timestamps:** `createdAt` and `updatedAt` for auditing
- **Unique email:** Prevents duplicate accounts
- **Lowercase email:** Ensures case-insensitive matching
- **Trim:** Removes whitespace from inputs
- **Default values:** Reasonable defaults for optional fields
- **Enum for gender:** Restricts to valid values
- **Array for skills:** Flexible skill list

### Q7: How does the ConnectionRequest schema work?
**Answer:** It has three key fields:
- `fromUserID`: Who sent the request (reference to User)
- `toUserID`: Who received the request (reference to User)
- `status`: Enum of ['ignore', 'interested', 'accepted', 'rejected']

The `ref: "User"` enables MongoDB's `populate()` to fetch user details.

### Q8: How do you prevent duplicate connection requests?
**Answer:** Before creating a new request, I check for existing relationships in both directions:
```javascript
const relation = await ConnectionRequest.findOne({
  $or: [
    { fromUserID, toUserID },
    { fromUserID: toUserID, toUserID: fromUserID }
  ]
});
```

### Q9: How does the feed algorithm work?
**Answer:**
1. Fetch all connection requests involving the logged-in user
2. Create a Set of excluded user IDs (all connected + pending + self)
3. Query users whose IDs are NOT in the excluded set
4. Apply pagination with skip and limit
5. Select only safe fields (no password/email)

### Q10: What is `populate()` and when do you use it?
**Answer:** `populate()` is Mongoose's way of replacing ObjectId references with actual documents. I use it when fetching connections to get user details:
```javascript
.populate("fromUserID", "firstName lastName email photoUrl")
```
The second argument specifies which fields to include.

---

## API Design & Best Practices

### Q11: How do you handle validation in your API?
**Answer:** Three layers:
1. **Route-level:** Check required fields exist
2. **Middleware:** `validateUserProfile` for field-specific validation
3. **Schema-level:** Mongoose validators as last line of defense

### Q12: Why use PATCH for profile updates instead of PUT?
**Answer:** 
- **PUT** replaces the entire resource
- **PATCH** updates only the provided fields

For profile edits, users typically update one field at a time, making PATCH more appropriate and efficient.

### Q13: How do you handle errors in your API?
**Answer:** 
- Validation errors return 400 with specific messages
- Authentication errors return 401
- Authorization errors return 403
- Not found errors return 404
- Server errors return 500 with generic message (hide implementation details)

### Q14: How do you protect sensitive fields from being updated?
**Answer:** I use a whitelist approach:
```javascript
const AllowedFields = ["firstName", "lastName", "photoUrl", "gender", "skills", "about"];
const isValid = Object.keys(req.body).every(field => AllowedFields.includes(field));
```

### Q15: How do you handle pagination?
**Answer:**
```javascript
const page = parseInt(req.query.page) || 1;
let limit = parseInt(req.query.limit) || 10;
limit = limit > 50 ? 50 : limit;  // Cap at 50 to prevent abuse
const skip = (page - 1) * limit;
```
Usage: `/user/feed?page=2&limit=10`

---

## Middleware & Request Flow

### Q16: Explain your auth middleware.
**Answer:**
1. Extract token from cookies
2. If no token, return 401 Unauthorized
3. Verify token using JWT secret
4. Extract user ID from decoded token
5. Attach decoded payload to `req.user`
6. Call `next()` to continue

### Q17: What is the request lifecycle in Express?
**Answer:**
1. Request comes in
2. CORS middleware checks origin
3. `express.json()` parses body
4. `cookieParser()` parses cookies
5. Route handler executes
6. Response sent back

### Q18: Why do you use `express.urlencoded({ extended: true })`?
**Answer:** It parses URL-encoded form data (like from HTML forms). `extended: true` allows nested objects using the qs library.

---

## Deployment & Production

### Q19: How do you handle different environments (dev vs prod)?
**Answer:**
```javascript
const isProd = process.env.NODE_ENV === 'production';
// Cookie settings differ based on environment
secure: isProd,
sameSite: isProd ? 'none' : 'lax',
```

### Q20: How do you handle CORS for cross-origin cookies?
**Answer:**
```javascript
app.use(cors({
  origin: process.env.CLIENT_URL,  // Exact origin, not '*'
  credentials: true,                // Allow cookies
}));
```
With `credentials: true`, you cannot use `origin: '*'`.

### Q21: Where is your app deployed and why?
**Answer:**
- **Backend:** Render (free tier, easy Node.js deployment, supports environment variables)
- **Frontend:** Vercel (optimized for React/Vite, instant deployments)
- **Database:** MongoDB Atlas (managed, free tier, global clusters)

---

## React Frontend Questions

### Q22: How do you manage authentication state in React?
**Answer:** Using Redux Toolkit:
- Store user data in global state after login
- Check auth state on app load via `/profile/view`
- Clear state on logout
- Protect routes with auth checks

### Q23: How do you handle API calls with cookies?
**Answer:**
```javascript
axios.defaults.withCredentials = true;
// or per-request:
axios.get('/profile/view', { withCredentials: true });
```

### Q24: How does the swipe functionality work?
**Answer:**
1. Fetch feed from `/user/feed`
2. Display current user card
3. On swipe right: POST `/request/send/interested/:userId`
4. On swipe left: POST `/request/send/ignore/:userId`
5. Remove from local state, show next card

### Q25: How do you handle loading and error states?
**Answer:** Using React state:
```javascript
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [data, setData] = useState([]);
```
Show skeleton/spinner while loading, error message if failed.

---

## System Design Questions

### Q26: How would you scale this application?
**Answer:**
1. **Horizontal scaling:** Multiple API instances behind load balancer
2. **Database:** MongoDB replica sets, sharding for large data
3. **Caching:** Redis for feed caching
4. **CDN:** For static assets and images
5. **Queue:** For async tasks like notifications

### Q27: How would you implement real-time chat?
**Answer:**
1. Use Socket.io for WebSocket connections
2. Redis pub/sub for multi-server message broadcasting
3. Store messages in MongoDB for persistence
4. Emit events for new messages, typing indicators

### Q28: How would you implement the matching algorithm?
**Answer:**
1. Calculate match score based on common skills
2. Consider location proximity (if available)
3. Factor in activity level and response rate
4. Use MongoDB aggregation pipeline for scoring
5. Sort by score, then apply pagination

### Q29: How would you handle image uploads?
**Answer:**
1. Use Multer middleware for multipart/form-data
2. Upload to Cloudinary or S3
3. Store URL in database
4. Validate file type and size
5. Generate thumbnails for performance

### Q30: What security measures would you add?
**Answer:**
1. **Rate limiting:** Prevent brute force attacks
2. **Helmet.js:** Security headers
3. **Input sanitization:** Prevent NoSQL injection
4. **HTTPS only:** Encrypt all traffic
5. **Password policies:** Enforce strong passwords (already done)
6. **Audit logging:** Track sensitive operations

---

## Quick Reference - Common Follow-ups

| Topic | Key Points |
|-------|------------|
| **Why MongoDB?** | Flexible schema, good for profiles with varying fields, easy to scale |
| **Why not SQL?** | No complex joins needed, schema flexibility more important |
| **Why Express 5?** | Native async/await error handling |
| **Why Vite?** | Faster than CRA, better HMR |
| **Why Vercel?** | Zero-config React deployment |
| **Biggest challenge?** | CORS + Cookies in production (sameSite, secure flags) |
| **What would you do differently?** | TypeScript, better error handling, testing from start |

---

## Running the Project

### Backend Setup
```bash
git clone https://github.com/divy6976/DevTinder.git
cd DevTinder
npm install
# Create .env file with MONGODB_URI, JWT_SECRET, CLIENT_URL
npm run dev
```

### Frontend Setup
```bash
git clone https://github.com/divy6976/DevTinder-FrontEnd.git
cd DevTinder-FrontEnd
npm install
npm run dev
```

### Environment Variables
```env
PORT=7777
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## License

ISC

---

# Quick Interview Cheat Sheet - How to Explain Verbally

## 30-Second Project Pitch

> "I built DevMatch, a Tinder-style networking app for developers. Users can create profiles with their skills, swipe through other developers, and send connection requests. When both parties accept, they become connections. The backend is Node.js with Express and MongoDB, deployed on Render. Frontend is React with Vite, deployed on Vercel. Key challenges I solved include secure authentication with JWT cookies, a smart feed algorithm that excludes already-connected users, and handling cross-origin cookies in production."

---

## How to Explain Key Features (Without Code)

### Authentication Flow
> "When a user signs up, I validate their input, check for duplicate emails, hash their password with bcrypt, and save to MongoDB. On login, I find the user by email, compare passwords using bcrypt, generate a JWT token, and store it in an HTTP-only cookie. This cookie is automatically sent with every request, and my auth middleware verifies it."

### Feed Algorithm
> "The feed shows developers you haven't interacted with yet. I first get all connection requests involving you - sent, received, accepted, rejected. I collect all those user IDs into a Set. Then I query MongoDB for users whose ID is NOT in that Set, excluding yourself too. This ensures you only see fresh profiles. I also paginate results to load quickly."

### Connection Request Flow
> "There are two statuses for sending: 'interested' (like) and 'ignore' (pass). When you swipe right, I create a connection request with status 'interested'. Before creating, I check if a request already exists in either direction to prevent duplicates. The other user can then 'accept' or 'reject'. Only the receiver can review a request - I verify this in the API by checking if the logged-in user matches the toUserID."

### Profile Security
> "I use a whitelist approach for profile updates. Only specific fields like firstName, lastName, skills, about can be updated. Even if someone tries to send password or email in the request, those fields are ignored. For the feed, I use projection to only return safe fields - never exposing passwords or emails to other users."

---

## Handling Tough Questions

### "Why didn't you use TypeScript?"
> "I prioritized learning core concepts first - authentication, database relationships, API design. Adding TypeScript would have added another learning curve. In hindsight, TypeScript would have caught many bugs early. For my next project, I'd definitely use TypeScript from the start."

### "Why is your JWT secret hardcoded?"
> "In the current codebase, it's hardcoded for development simplicity. In production, I use environment variables. The Render deployment config shows JWT_SECRET is generated and stored securely. I acknowledge this is a security issue in the development code."

### "How would you handle 1 million users?"
> "Several changes needed: Add indexes on frequently queried fields. Implement Redis caching for the feed - cache for 5 minutes, invalidate on new connections. Use connection pooling for MongoDB. Add pagination everywhere. Consider sharding the database. Move to a load-balanced setup with multiple API instances."

### "What happens if someone's token is stolen?"
> "The HTTP-only cookie makes theft via XSS impossible. For other theft vectors, I'd add: Token fingerprinting (store browser/IP hash in token, verify on each request), refresh token rotation (short-lived access tokens, long-lived refresh tokens), and a logout-all-devices feature that invalidates all tokens."

### "How do you test your API?"
> "Currently, manual testing with Postman. For production, I'd add: Unit tests with Jest for individual functions, integration tests with Supertest for API endpoints, and maybe E2E tests with Cypress for the full flow. I'd also set up GitHub Actions for CI to run tests on every push."

---

## Key Numbers to Remember

| Metric | Value | Why |
|--------|-------|-----|
| bcrypt salt rounds | 10 | 2^10 iterations, ~100ms to hash |
| JWT expiry | 7 days | Balance security vs UX |
| Max feed limit | 50 | Prevent API abuse |
| Password min length | 6 | With complexity requirements |
| Max about length | 500 | Prevent spam |
| Max name length | 20 | Reasonable limit |

---

## Vocabulary to Use

| Instead of | Say |
|------------|-----|
| "I stored the password" | "I hashed the password using bcrypt" |
| "I check if logged in" | "The auth middleware verifies the JWT" |
| "I get user data" | "I populate the user reference" |
| "I search all users" | "I query with exclusion criteria" |
| "I save to database" | "Mongoose validates and persists the document" |
| "Frontend talks to backend" | "Cross-origin requests with CORS and credentials" |

---

## Red Flags to Avoid Saying

- "I just followed a tutorial" → Say "I learned from tutorials but customized for my use case"
- "I don't know why it works" → Say "Let me explain my understanding..."
- "It's simple" → Never undersell your work
- "I copy-pasted this" → Say "I referenced documentation and adapted it"

---

## Questions to Ask the Interviewer

1. "What's your tech stack for authentication?"
2. "How do you handle database migrations?"
3. "What's your testing strategy?"
4. "How do you manage environment-specific configurations?"
5. "What's your deployment pipeline like?"

---

## Author

Divy - [GitHub](https://github.com/divy6976)
