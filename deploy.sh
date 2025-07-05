#!/bin/bash

# Comment App Deployment Script
# This script helps deploy the comment application in production

set -e

echo "🚀 Comment App Deployment Script"
echo "================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create a .env file with the required environment variables."
    echo "You can copy from .env.example and modify the values."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Load environment variables
source .env

# Validate required environment variables
if [ -z "$DATABASE_PASSWORD" ]; then
    echo "❌ DATABASE_PASSWORD is not set in .env file"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ JWT_SECRET is not set in .env file"
    exit 1
fi

echo "✅ Environment variables validated"

# Build and start the application
echo "🔨 Building and starting the application..."

# Stop existing containers
docker-compose -f docker-compose.prod.yml down

# Build fresh images
docker-compose -f docker-compose.prod.yml build --no-cache

# Start the application
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are healthy
echo "🔍 Checking service health..."

# Check database
if docker-compose -f docker-compose.prod.yml exec -T db pg_isready -U postgres; then
    echo "✅ Database is healthy"
else
    echo "❌ Database is not healthy"
    exit 1
fi

# Check backend
if curl -f http://localhost:3001/health &> /dev/null; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend is not healthy. Checking logs..."
    docker-compose -f docker-compose.prod.yml logs backend
    exit 1
fi

# Check frontend
if curl -f http://localhost:3000 &> /dev/null; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend is not healthy. Checking logs..."
    docker-compose -f docker-compose.prod.yml logs frontend
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📱 Your application is now running:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "📊 To view logs:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🛑 To stop the application:"
echo "   docker-compose -f docker-compose.prod.yml down"
echo ""
echo "🔄 To update the application:"
echo "   ./deploy.sh"
