#!/bin/bash
# Quick start script for development
# Usage: ./scripts/dev-start.sh

set -e

echo "🚀 Starting AIAS Platform Development Environment"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18.17.0 or higher."
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi
echo ""

# Check environment variables
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo "✅ Created .env.local. Please update it with your configuration."
    else
        echo "⚠️  .env.example not found. Please create .env.local manually."
    fi
else
    echo "✅ Environment file found"
fi
echo ""

# Run type check
echo "🔍 Running type check..."
pnpm typecheck || {
    echo "⚠️  Type check found issues. Continuing anyway..."
}
echo ""

# Start development server
echo "🎯 Starting development server..."
echo "   Open http://localhost:3000 in your browser"
echo ""
pnpm dev
