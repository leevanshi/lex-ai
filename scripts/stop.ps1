# Stop and remove LexAI production services (PowerShell version)

$ErrorActionPreference = "Stop"

Write-Host "🛑 Stopping LexAI services..." -ForegroundColor Yellow
docker-compose down

Write-Host "🧹 Cleaning up..." -ForegroundColor Yellow
docker-compose down -v

Write-Host "✅ Services stopped successfully" -ForegroundColor Green
