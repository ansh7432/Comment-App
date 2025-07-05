#!/bin/bash

# Comment App Production Startup Script

set -e

echo "🚀 Starting Comment App Production Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Stop any existing containers
echo "📦 Stopping existing containers..."
docker-compose down

# Build and start the production environment
echo "🔧 Building and starting production services..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 15

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Production environment is ready!"
    echo ""
    echo "🌐 Application: http://localhost:3000"
    echo "🔧 API: http://localhost:3001"
    echo ""
    echo "📊 View logs with: docker-compose logs -f"
    echo "🛑 Stop with: docker-compose down"
else
    echo "❌ Failed to start services. Check logs with:"
    echo "docker-compose logs"
fi
