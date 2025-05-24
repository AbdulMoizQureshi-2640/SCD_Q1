# Microservices Blog Platform

A containerized microservices-based blog platform with authentication, blog management, comments, and user profiles.

## Services

1. **Auth Service** (Port 3001)

   - User registration and login
   - JWT token generation
   - Credential validation

2. **Blog Service** (Port 3002)

   - Create, read, and delete blogs
   - Blog ownership validation
   - Protected endpoints

3. **Comment Service** (Port 3003)

   - Add comments to blogs
   - Fetch comments by blog ID
   - Protected endpoints

4. **Profile Service** (Port 3004)

   - Create and update user profiles
   - Fetch profile data
   - Protected endpoints

5. **API Gateway** (Port 3000)
   - Single entry point for all services
   - JWT verification
   - Request routing

## Prerequisites

- Docker and Docker Compose
- Node.js 18 or later
- MongoDB 4.4 or later

## Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd SCD_Q1
   ```

2. Create a `.env` file in the root directory:

   ```
   JWT_SECRET=your-secret-key-here
   ```

3. Build and start the services:
   ```bash
   docker-compose up --build
   ```

## API Endpoints

### Auth Service

- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login and get JWT token

### Blog Service

- POST `/api/blogs` - Create a new blog (requires auth)
- GET `/api/blogs` - Get all blogs
- GET `/api/blogs/:id` - Get a specific blog
- DELETE `/api/blogs/:id` - Delete a blog (requires auth)

### Comment Service

- POST `/api/comments` - Add a comment (requires auth)
- GET `/api/comments/blog/:blogId` - Get comments for a blog
- DELETE `/api/comments/:id` - Delete a comment (requires auth)

### Profile Service

- POST `/api/profile` - Create a profile (requires auth)
- GET `/api/profile` - Get user profile (requires auth)
- PUT `/api/profile` - Update profile (requires auth)

## Development

1. Install dependencies for each service:

   ```bash
   cd services/<service-name>
   npm install
   ```

2. Run tests:

   ```bash
   npm test
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## CI/CD

The project includes GitHub Actions workflows for:

- Running tests
- Building Docker images
- Pushing to Docker Hub

## Health Checks

Each service includes health check endpoints:

- `/health` - Service health status
- `/ready` - Service readiness status

## Security

- JWT-based authentication
- Protected endpoints
- Input validation
- Environment variable configuration
- Secure password hashing
