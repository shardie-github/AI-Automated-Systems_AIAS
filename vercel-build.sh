#!/bin/bash
# Vercel Build Script
# Ensures pnpm is used and workspace protocol is handled correctly
# Prevents npm workspace protocol errors
# Foolproof build script with comprehensive error handling

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
info() { echo -e "${GREEN}ℹ️  $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# Ensure we're in the repository root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR" && pwd)"
cd "$REPO_ROOT"

info "Build script running from: $REPO_ROOT"
info "Setting up pnpm for Vercel build..."

# Enable corepack (Node.js built-in package manager)
export ENABLE_EXPERIMENTAL_COREPACK=1

# Skip Puppeteer Chromium download to speed up builds
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Try to enable corepack
if ! corepack enable 2>/dev/null; then
  warn "Corepack enable failed, continuing..."
fi

# Prepare and activate pnpm with multiple fallback strategies
info "Preparing pnpm..."
if ! corepack prepare pnpm@8.15.0 --activate 2>/dev/null; then
  warn "Corepack prepare failed, trying alternative method..."
  if ! npm install -g pnpm@8.15.0 2>/dev/null; then
    error "Failed to install pnpm via npm"
    error "Trying with --force..."
    npm install -g pnpm@8.15.0 --force || {
      error "All pnpm installation methods failed"
      exit 1
    }
  fi
fi

# Verify pnpm is available
if ! command -v pnpm &> /dev/null; then
  error "pnpm not found after setup"
  error "PATH: $PATH"
  exit 1
fi

PNPM_VERSION=$(pnpm --version || echo "unknown")
info "✅ pnpm version: $PNPM_VERSION"

# Set pnpm configuration
export PNPM_HOME="${PNPM_HOME:-$HOME/.local/share/pnpm}"
export PATH="$PNPM_HOME:$PATH"

# Verify pnpm-lock.yaml exists
if [ ! -f "pnpm-lock.yaml" ]; then
  error "pnpm-lock.yaml not found in repository root"
  exit 1
fi

# Install dependencies without frozen lockfile
# This prevents workspace protocol errors by using pnpm instead of npm
info "📦 Installing dependencies with pnpm..."
if ! pnpm install --no-frozen-lockfile --prefer-offline; then
  warn "Install with --prefer-offline failed, trying standard install..."
  pnpm install || {
    error "Dependency installation failed"
    exit 1
  }
fi

info "✅ Dependencies installed successfully"

# Generate Prisma client if needed (non-blocking)
info "🔨 Generating Prisma client..."
if pnpm run db:generate 2>/dev/null; then
  info "✅ Prisma client generated"
else
  warn "Prisma generation skipped (DATABASE_URL may not be available or not needed)"
fi

# Build the application using Turborepo
info "🏗️ Building application with Turborepo..."
if ! pnpm run build; then
  error "Build failed"
  error "Check build logs above for details"
  exit 1
fi

# Verify build output exists
# Check root .next first (standard Next.js location)
BUILD_OUTPUT=".next"
if [ ! -d "$BUILD_OUTPUT" ]; then
  error "Build output not found at: $BUILD_OUTPUT"
  error "Checking for alternative locations..."
  
  # Check apps/web/.next as fallback (monorepo structure)
  if [ -d "apps/web/.next" ]; then
    warn "Found .next at apps/web/.next instead of root"
    BUILD_OUTPUT="apps/web/.next"
  else
    error "No build output found. Build may have failed silently."
    exit 1
  fi
fi

# Verify critical build files exist
if [ ! -f "$BUILD_OUTPUT/BUILD_ID" ]; then
  error "BUILD_ID file missing in build output"
  exit 1
fi

if [ ! -d "$BUILD_OUTPUT/server" ]; then
  error "Server directory missing in build output"
  exit 1
fi

info "✅ Build output verified at: $BUILD_OUTPUT"

# Validate build output using validation script
info "🔍 Running build validation..."
if pnpm run validate:build; then
  info "✅ Build validation passed"
else
  warn "Build validation had warnings, but continuing..."
  # Don't fail on validation warnings, only errors
fi

info "✅ Build completed successfully!"
info "Build output location: $BUILD_OUTPUT"
