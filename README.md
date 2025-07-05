# Comment Application

A full-stack comment application built with modern web technologies featuring nested comments, real-time notifications, and a clean, minimalistic dark theme interface.

## 🚀 Features

- **Authentication System**: Secure JWT-based authentication with registration and login
- **Nested Comments**: Support for threaded discussions with unlimited nesting levels
- **Real-time Notifications**: Get notified when someone replies to your comments
- **Delete & Restore**: 15-minute window to restore accidentally deleted comments
- **Delete History**: View and restore recently deleted comments from the navbar
- **Dark Theme**: Modern, minimalistic dark UI with responsive design
- **Performance Optimized**: Efficient database queries with proper indexing
- **Rate Limiting**: Built-in protection against spam and abuse
- **Docker Support**: Fully containerized for easy deployment

### DevOps & Deployment
- **Full Docker Support**: Complete containerization for all services
- **Development Environment**: Hot-reload enabled development setup
- **Production Ready**: Optimized builds with security best practices
- **Database Management**: Automated database setup and migrations

## 🛠️ Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **PostgreSQL** - Robust relational database
- **TypeORM** - Database ORM with migrations
- **JWT** - Authentication and authorization
- **Passport** - Authentication middleware
- **Class Validator** - Request validation

### Frontend
- **Next.js 14** - React framework with SSR/SSG support
- **TypeScript** - Type-safe frontend development
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Data fetching and caching
- **Lucide React** - Modern icon library
- **Date-fns** - Date manipulation library

### DevOps
- **Docker & Docker Compose** - Containerization
- **PostgreSQL** - Database container
- **Multi-stage builds** - Optimized production builds

## 📋 Prerequisites

- **Docker** and **Docker Compose** installed
- **Node.js** 18+ (for local development)
- **Git** for version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd comment-app
```

### 2. Environment Setup

Create environment files for both frontend and backend:

**Backend Environment (`backend/.env`):**
```env
# Database Configuration
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=commentapp

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Application Configuration
PORT=3001
NODE_ENV=development
```

**Frontend Environment (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Start the Application

```bash
# Start all services with Docker Compose
docker-compose up -d

# View logs (optional)
docker-compose logs -f
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Database**: localhost:5432

### 4. Create Your First Account

1. Navigate to http://localhost:3000
2. Click "Register" to create a new account
3. Fill in your details (password must contain uppercase, lowercase, and numbers)
4. Login and start commenting!

## 🔧 Development Setup

For local development without Docker:

### Backend Setup

```bash
cd backend
npm install

# Start PostgreSQL (using Docker)
docker run --name postgres-dev -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=commentapp -p 5432:5432 -d postgres:13

# Run migrations
npm run migration:run

# Start development server
npm run start:dev
```

### Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev
```

## 📖 API Documentation

### Authentication Endpoints

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get current user profile

### Comments Endpoints

- `GET /comments` - Get paginated comments
- `POST /comments` - Create a new comment
- `GET /comments/:id` - Get a specific comment
- `PUT /comments/:id` - Update a comment (15min window)
- `DELETE /comments/:id` - Delete a comment (15min window)
- `PATCH /comments/:id/restore` - Restore a deleted comment
- `GET /comments/:id/replies` - Get replies to a comment
- `GET /comments/deleted/history` - Get user's deleted comments

### Notifications Endpoints

- `GET /notifications` - Get user notifications
- `GET /notifications/unread-count` - Get unread count
- `PATCH /notifications/:id/read` - Mark notification as read
- `PATCH /notifications/mark-all-read` - Mark all as read

## 🗄️ Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `username` (Unique)
- `email` (Unique)
- `password` (Hashed)
- `isActive` (Boolean)
- `createdAt`, `updatedAt` (Timestamps)

### Comments Table
- `id` (UUID, Primary Key)
- `content` (Text)
- `authorId` (Foreign Key to Users)
- `parentId` (Self-referencing for nesting)
- `isDeleted` (Boolean)
- `deletedAt` (Timestamp)
- `createdAt`, `updatedAt` (Timestamps)

### Notifications Table
- `id` (UUID, Primary Key)
- `userId` (Foreign Key to Users)
- `commentId` (Foreign Key to Comments)
- `type` (Enum: 'reply')
- `isRead` (Boolean)
- `message` (Text)
- `createdAt` (Timestamp)

## 🎯 Key Features Explained

### Comment System
- **Nested Threading**: Comments can be replied to infinitely
- **Time-based Editing**: 15-minute window to edit/delete comments
- **Soft Delete**: Deleted comments can be restored within 15 minutes
- **Author Ownership**: Only comment authors can edit/delete their comments

### Notification System
- **Real-time Updates**: Notifications appear immediately
- **Reply Notifications**: Get notified when someone replies to your comment
- **Read/Unread States**: Track which notifications you've seen
- **Badge Counts**: Visual indicators for unread notifications

### Delete History
- **Recovery System**: View all your recently deleted comments
- **Quick Restore**: One-click restoration from the navbar dropdown
- **Time Awareness**: Only shows comments within the restoration window

## 🔧 Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=comment_app
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Comment Endpoints
- `GET /comments` - Get paginated comments
- `POST /comments` - Create new comment
- `GET /comments/:id` - Get specific comment
- `PUT /comments/:id` - Update comment (15-min window)
- `DELETE /comments/:id` - Delete comment (15-min window)
- `PATCH /comments/:id/restore` - Restore deleted comment
- `GET /comments/:id/replies` - Get comment replies

### Notification Endpoints
- `GET /notifications` - Get user notifications
- `GET /notifications/unread-count` - Get unread count
- `PATCH /notifications/:id/read` - Mark as read
- `PATCH /notifications/mark-all-read` - Mark all as read

### User Endpoints
- `GET /users/profile` - Get user profile

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API throttling to prevent abuse
- **CORS Configuration**: Proper cross-origin settings
- **SQL Injection Prevention**: TypeORM query builders

## 🎯 Performance Optimizations

- **Database Indexing**: Optimized queries with proper indexes
- **Pagination**: Efficient data loading
- **Caching**: Redis-compatible caching layer
- **Lazy Loading**: Component-level code splitting
- **Image Optimization**: Next.js image optimization
- **Bundle Analysis**: Optimized JavaScript bundles

## 📊 Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `username` (String, Unique)
- `email` (String, Unique)
- `password` (String, Hashed)
- `isActive` (Boolean)
- `createdAt`, `updatedAt` (Timestamps)

### Comments Table
- `id` (UUID, Primary Key)
- `content` (Text)
- `authorId` (UUID, Foreign Key)
- `parentId` (UUID, Foreign Key, Nullable)
- `isDeleted` (Boolean)
- `deletedAt` (Timestamp, Nullable)
- `createdAt`, `updatedAt` (Timestamps)

### Notifications Table
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key)
- `commentId` (UUID, Foreign Key)
- `type` (Enum: 'reply')
- `isRead` (Boolean)
- `message` (Text)
- `createdAt` (Timestamp)

## 🚀 Deployment

### Production Environment Variables

**Backend (`backend/.env.production`):**
```env
DATABASE_HOST=your-production-db-host
DATABASE_PORT=5432
DATABASE_USERNAME=your-db-username
DATABASE_PASSWORD=your-secure-db-password
DATABASE_NAME=commentapp_prod

JWT_SECRET=your-super-secure-jwt-secret-min-256-bits
JWT_EXPIRES_IN=24h

PORT=3001
NODE_ENV=production
```

**Frontend (`frontend/.env.production`):**
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

### Deployment Options

#### 1. Docker-based Deployment (Recommended)

**Using Docker Compose:**
```bash
# Production build
docker-compose -f docker-compose.prod.yml up -d
```

**Create `docker-compose.prod.yml`:**
```yaml
version: '3.8'

services:
  db:
    image: postgres:13
    environment:
      POSTGRES_DB: commentapp_prod
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      DATABASE_HOST: db
      DATABASE_PORT: 5432
      DATABASE_USERNAME: postgres
      DATABASE_PASSWORD: ${DB_PASSWORD}
      DATABASE_NAME: commentapp_prod
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    ports:
      - "3001:3001"
    depends_on:
      - db

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    environment:
      NEXT_PUBLIC_API_URL: ${BACKEND_URL}
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

#### 2. Cloud Platform Deployment

**Vercel (Frontend) + Railway/Heroku (Backend):**

1. **Frontend on Vercel:**
   ```bash
   npm install -g vercel
   cd frontend
   vercel --prod
   ```

2. **Backend on Railway:**
   - Connect your GitHub repository
   - Add environment variables
   - Deploy automatically

3. **Database on Railway/Supabase:**
   - Use managed PostgreSQL service
   - Update connection strings

#### 3. VPS Deployment

```bash
# On your VPS
git clone <your-repo>
cd comment-app

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Edit the files with your production values
nano backend/.env
nano frontend/.env.local

# Deploy with Docker
docker-compose up -d

# Set up reverse proxy with Nginx
sudo apt install nginx
# Configure Nginx to proxy to your containers
```

### Production Considerations

1. **Security:**
   - Use strong JWT secrets (minimum 256 bits)
   - Enable HTTPS/SSL certificates
   - Set up proper CORS origins
   - Use environment variables for all secrets

2. **Performance:**
   - Enable database connection pooling
   - Set up Redis for caching
   - Configure CDN for static assets
   - Enable gzip compression

3. **Monitoring:**
   - Set up application logging
   - Monitor database performance
   - Track error rates and response times
   - Set up health checks

4. **Backup:**
   - Regular database backups
   - File system backups
   - Test restore procedures

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test
npm run test:e2e

# Frontend tests
cd frontend
npm run test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Check what's using the port
lsof -i :3000
lsof -i :3001

# Kill the process
kill -9 <PID>
```

**Database Connection Issues:**
```bash
# Reset database
docker-compose down -v
docker-compose up -d
```

**Frontend Not Loading:**
- Check if `NEXT_PUBLIC_API_URL` is set correctly
- Verify backend is running on the specified port
- Check browser console for CORS errors

**Backend Errors:**
- Check JWT secret is set
- Verify database connection parameters
- Check if migrations have been run

### Performance Optimization

1. **Database Indexes:**
   - Comments by author: `CREATE INDEX idx_comments_author ON comments(author_id);`
   - Comments by parent: `CREATE INDEX idx_comments_parent ON comments(parent_id);`
   - Notifications by user: `CREATE INDEX idx_notifications_user ON notifications(user_id);`

2. **Caching Strategy:**
   - Implement Redis for session storage
   - Cache frequently accessed comments
   - Use React Query for client-side caching

3. **Database Connection Pooling:**
   ```typescript
   // In backend/src/app.module.ts
   TypeOrmModule.forRoot({
     // ... other config
     extra: {
       max: 20, // Maximum connections
       min: 5,  // Minimum connections
     },
   }),
   ```

## 📞 Support

If you encounter any issues or have questions:

1. Check the [troubleshooting section](#-troubleshooting)
2. Search existing GitHub issues
3. Create a new issue with detailed information
4. Join our community discussions

---

Built with ❤️ using NestJS, Next.js, and PostgreSQL
