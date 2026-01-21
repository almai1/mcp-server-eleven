#!/usr/bin/env pwsh
# VoiceForge MCP Auto-Update Wrapper
# This script automatically updates the MCP server from Git before starting it

$ErrorActionPreference = "Stop"
$REPO_DIR = $PSScriptRoot

# Change to repository directory
Set-Location $REPO_DIR

# Suppress git pull output to avoid polluting MCP protocol
Write-Host "🔄 Checking for updates..." -ForegroundColor Cyan

try {
    # Fetch latest changes silently
    git fetch origin main 2>&1 | Out-Null
    
    # Check if there are updates
    $LOCAL = git rev-parse HEAD
    $REMOTE = git rev-parse origin/main
    
    if ($LOCAL -ne $REMOTE) {
        Write-Host "📥 Updates found, pulling..." -ForegroundColor Yellow
        git pull origin main 2>&1 | Out-Null
        
        # Install/update dependencies if package.json changed
        if (git diff --name-only HEAD@{1} HEAD | Select-String "package.json") {
            Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
            npm install --silent 2>&1 | Out-Null
        }
        
        Write-Host "✅ Updated successfully!" -ForegroundColor Green
    } else {
        Write-Host "✅ Already up to date" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Git update failed, using current version" -ForegroundColor Yellow
}

# Start the MCP server
Write-Host "🚀 Starting VoiceForge MCP Server..." -ForegroundColor Cyan
& node "$REPO_DIR\index.js"
