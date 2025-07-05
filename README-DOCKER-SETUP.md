# Docker Development Environment Setup

This guide will help you set up the complete Docker-based development environment for the Comment Application project.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose installed (usually comes with Docker Desktop)
- Git (for cloning the repository)

## Project Structure

```
Sanctity/
├── backend/                 # NestJS backend application
├── frontend/               # Next.js frontend application
├── docker-compose.dev.yml  # Development Docker Compose configuration
└── README-DOCKER-SETUP.md  # This file
```

## Quick Start

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd Sanctity
   ```

2. **Start the development environment**:
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

3. **Access the applications**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database: localhost:5432

## Detailed Setup Steps

### 1. Environment Configuration

#### Backend Environment (.env)
The backend `.env` file should be configured as follows:
```env
# Database Configuration (Docker)
DATABASE_HOST=comment-app-db-dev
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=comment_app_dev

# Application Configuration
NODE_ENV=development
JWT_SECRET=your-jwt-secret-key-here
JWT_EXPIRES_IN=24h
PORT=3001
```

#### Frontend Environment (.env.local)
Create or update the frontend `.env.local` file:
```env
# API Configuration (Docker)
NEXT_PUBLIC_API_URL=http://comment-app-backend-dev:3001
```

**Important**: The frontend uses the Docker service name (`comment-app-backend-dev`) instead of `localhost` for internal container communication.

### 2. Docker Services

The development environment consists of three services:

#### Database Service (PostgreSQL)
- **Service Name**: `comment-app-db-dev`
- **Image**: `postgres:15-alpine`
- **Port**: 5432 (exposed to host)
- **Data Persistence**: Docker volume `comment_app_db_data_dev`

#### Backend Service (NestJS)
- **Service Name**: `comment-app-backend-dev`
- **Build**: Uses `Dockerfile.dev` in backend directory
- **Port**: 3001 (exposed to host)
- **Debug Port**: 9229 (for Node.js debugging)
- **Dependencies**: Waits for database to be ready

#### Frontend Service (Next.js)
- **Service Name**: `comment-app-frontend-dev`
- **Build**: Uses `Dockerfile.dev` in frontend directory
- **Port**: 3000 (exposed to host)
- **Dependencies**: Backend service

### 3. Building and Running

#### Start All Services
```bash
# Start in foreground (see logs)
docker-compose -f docker-compose.dev.yml up

# Start in background (detached mode)
docker-compose -f docker-compose.dev.yml up -d
```

#### Stop All Services
```bash
docker-compose -f docker-compose.dev.yml down
```

#### Rebuild Services (after code changes to Dockerfiles)
```bash
docker-compose -f docker-compose.dev.yml up --build
```

#### View Service Logs
```bash
# All services
docker-compose -f docker-compose.dev.yml logs

# Specific service
docker-compose -f docker-compose.dev.yml logs frontend
docker-compose -f docker-compose.dev.yml logs backend
docker-compose -f docker-compose.dev.yml logs database
```

### 4. Development Workflow

#### File Changes
- **Frontend**: Changes are automatically reflected (Next.js hot reload)
- **Backend**: Changes are automatically reflected (nodemon restart)
- **Database**: Persistent data stored in Docker volume

#### Database Management
```bash
# Access PostgreSQL shell
docker exec -it comment-app-db-dev psql -U postgres -d comment_app_dev

# View database logs
docker-compose -f docker-compose.dev.yml logs database
```

#### Service Management
```bash
# Check running containers
docker ps

# Restart specific service
docker-compose -f docker-compose.dev.yml restart backend

# Execute commands in container
docker exec -it comment-app-backend-dev npm run migration:run
```

## Testing the Setup

### 1. Health Checks

#### Backend API Health
```bash
curl http://localhost:3001/health
```
Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-07-05T18:19:37.587Z",
  "uptime": 55.114779651,
  "environment": "development"
}
```

#### Frontend Accessibility
```bash
curl -I http://localhost:3000
```
Expected: `HTTP/1.1 200 OK`

### 2. Create Test User

Register a test user:
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com", 
    "password": "TestPass123"
  }'
```

### 3. Test Login

Login with the test user:
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### 4. Frontend Login Flow

1. Open http://localhost:3000/login in your browser
2. Use the test credentials:
   - Email: `test@example.com`
   - Password: `TestPass123`
3. You should be successfully logged in and redirected to the home page

## Troubleshooting

### Common Issues

#### "Cannot connect to database"
- Ensure PostgreSQL container is running: `docker ps`
- Check backend environment variables
- Verify database host is set to `comment-app-db-dev`

#### "Frontend cannot reach backend"
- Verify `NEXT_PUBLIC_API_URL` uses service name: `comment-app-backend-dev:3001`
- Check if backend container is running and healthy
- Ensure both containers are on the same Docker network

#### "Port already in use"
- Stop any locally running services on ports 3000, 3001, or 5432
- Or modify the ports in `docker-compose.dev.yml`

#### "Build failures"
- Clear Docker cache: `docker system prune`
- Rebuild without cache: `docker-compose -f docker-compose.dev.yml build --no-cache`

### Debug Commands

```bash
# Check container status
docker-compose -f docker-compose.dev.yml ps

# View detailed logs
docker-compose -f docker-compose.dev.yml logs -f

# Enter container shell
docker exec -it comment-app-backend-dev sh
docker exec -it comment-app-frontend-dev sh

# Check network connectivity
docker exec comment-app-frontend-dev wget -q -O - http://comment-app-backend-dev:3001/health
```

## Development Tips

### 1. Hot Reloading
- Both frontend and backend support hot reloading
- Changes to source code automatically trigger rebuilds
- No need to restart containers for code changes

### 2. Database Persistence
- Database data persists between container restarts
- To reset database: `docker-compose -f docker-compose.dev.yml down -v`

### 3. Environment Variables
- Frontend environment variables must start with `NEXT_PUBLIC_` to be available in browser
- Backend environment variables are loaded from `.env` file
- Changes to environment files require container restart

### 4. Debugging
- Backend debugging port 9229 is exposed for Node.js debugging
- Use VS Code or other debuggers to attach to the running process

## Production Considerations

This setup is optimized for development. For production deployment:

- Use production Dockerfiles (without dev dependencies)
- Use environment-specific configuration
- Implement proper security measures
- Use production-grade database setup
- Configure proper logging and monitoring

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment#docker-image)
- [NestJS Docker Guide](https://docs.nestjs.com/recipes/prisma#docker)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
