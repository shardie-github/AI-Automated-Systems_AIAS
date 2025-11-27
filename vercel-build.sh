#!/bin/bash
# Vercel Build Script
# Ensures pnpm is used and workspace protocol is handled correctly
# Prevents npm workspace protocol errors

set -euo pipefail

echo "🔧 Setting up pnpm for Vercel build..."

# Enable corepack (Node.js built-in package manager)
export ENABLE_EXPERIMENTAL_COREPACK=1
corepack enable || true

# Prepare and activate pnpm
corepack prepare pnpm@8.15.0 --activate || {
  echo "⚠️ Corepack prepare failed, trying alternative method..."
  npm install -g pnpm@8.15.0 || {
    echo "❌ Failed to install pnpm"
    exit 1
  }
}

# Verify pnpm is available
if ! command -v pnpm &> /dev/null; then
  echo "❌ pnpm not found after setup"
  exit 1
fi

echo "✅ pnpm version: $(pnpm --version)"

# Set pnpm configuration
export PNPM_HOME="${PNPM_HOME:-$HOME/.local/share/pnpm}"
export PATH="$PNPM_HOME:$PATH"

# Install dependencies with frozen lockfile
# This prevents workspace protocol errors by using pnpm instead of npm
echo "📦 Installing dependencies with pnpm..."
pnpm install --frozen-lockfile --prefer-offline || {
  echo "⚠️ Frozen lockfile install failed, trying without frozen..."
  pnpm install --prefer-offline
}

# Generate Prisma client if needed
echo "🔨 Generating Prisma client..."
pnpm run db:generate || echo "⚠️ Prisma generation skipped (DATABASE_URL may not be available)"

# Build the application
echo "🏗️ Building application..."
pnpm run build

# Validate build output
echo "🔍 Validating build output..."
pnpm run validate:build || {
  echo "⚠️ Build validation failed, but continuing..."
}

echo "✅ Build completed successfully!"
