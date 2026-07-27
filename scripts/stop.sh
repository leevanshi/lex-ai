#!/bin/bash

# Stop and remove LexAI production services

set -e

echo "🛑 Stopping LexAI services..."
docker-compose down

echo "🧹 Cleaning up..."
docker-compose down -v

echo "✅ Services stopped successfully"
