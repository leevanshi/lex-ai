# Production deployment script for LexAI (PowerShell version)
# This script builds and deploys the application using Docker Compose

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting LexAI production deployment..." -ForegroundColor Green

# Check if .env.production exists
if (-not (Test-Path .env.production)) {
    Write-Host "❌ Error: .env.production file not found" -ForegroundColor Red
    Write-Host "Please copy .env.example to .env.production and configure your production values" -ForegroundColor Yellow
    exit 1
}

# Build and start services
Write-Host "📦 Building Docker images..." -ForegroundColor Cyan
docker-compose build

Write-Host "🔄 Starting services..." -ForegroundColor Cyan
docker-compose up -d

Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Check service health
Write-Host "🏥 Checking service health..." -ForegroundColor Cyan
docker-compose ps

Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost" -ForegroundColor Cyan
Write-Host "🔧 API: http://localhost:8080" -ForegroundColor Cyan
