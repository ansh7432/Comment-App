#!/bin/bash

# Comment App Development Startup Script

set -e

echo "🚀 Starting Comment App Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Stop any existing containers
echo "📦 Stopping existing containers..."
docker-compose -f docker-compose.dev.yml down

# Start the development environment
echo "🔧 Starting development services..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
    echo "✅ Development environment is ready!"
    echo ""
    echo "📱 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:3001"
    echo "🗄️  Database: localhost:5432"
    echo ""
    echo "📊 View logs with: docker-compose -f docker-compose.dev.yml logs -f"
    echo "🛑 Stop with: docker-compose -f docker-compose.dev.yml down"
else
    echo "❌ Failed to start services. Check logs with:"
    echo "docker-compose -f docker-compose.dev.yml logs"
fi
