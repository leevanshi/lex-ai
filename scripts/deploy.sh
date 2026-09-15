#!/bin/bash

# Production deployment script for LexAI
# This script builds and deploys the application using Docker Compose

set -e

echo "🚀 Starting LexAI production deployment..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found"
    echo "Please copy .env.example to .env.production and configure your production values"
    exit 1
fi

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

# Build and start services
echo "📦 Building Docker images..."
docker-compose build

echo "🔄 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
echo "🏥 Checking service health..."
docker-compose ps

echo "✅ Deployment completed successfully!"
echo "🌐 Frontend: http://localhost"
echo "🔧 API: http://localhost:8080"
echo "🗄️  Database: postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}"
