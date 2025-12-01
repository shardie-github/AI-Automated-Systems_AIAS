#!/bin/bash
set -e

# Set environment variables for faster builds
export ENABLE_EXPERIMENTAL_COREPACK=1
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_SKIP_DOWNLOAD=true
export PUPPETEER_DOWNLOAD_PATH=/tmp/puppeteer_cache

# Enable corepack and prepare pnpm
corepack enable || true
corepack prepare pnpm@8.15.0 --activate || npm install -g pnpm@8.15.0

# Install dependencies with optimizations for Vercel
# Don't use frozen-lockfile to avoid build failures - lockfile will be updated automatically
pnpm install --prefer-offline
