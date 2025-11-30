#!/bin/bash
set -e
export ENABLE_EXPERIMENTAL_COREPACK=1 PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true PUPPETEER_SKIP_DOWNLOAD=true

# Speed optimizations: Use frozen lockfile for faster, more reliable installs
# Vercel caches node_modules, so frozen lockfile is safe and faster
LOCKFILE_EXISTS=true
if [ ! -f "pnpm-lock.yaml" ]; then
  LOCKFILE_EXISTS=false
fi

corepack enable || true
corepack prepare pnpm@8.15.0 --activate || npm install -g pnpm@8.15.0

# Install dependencies with optimizations
# - Use frozen lockfile when available (faster, uses cache better)
# - Prefer offline for cached packages
INSTALL_FLAGS="--prefer-offline"
if [ "$LOCKFILE_EXISTS" = true ]; then
  INSTALL_FLAGS="$INSTALL_FLAGS --frozen-lockfile"
else
  INSTALL_FLAGS="$INSTALL_FLAGS --no-frozen-lockfile"
fi

# Install dependencies. Canvas may fail due to Python distutils issue on Node 24/Python 3.12+,
# but canvas-confetti works fine without it (uses DOM fallback). We'll handle the error gracefully.
set +e
pnpm install $INSTALL_FLAGS 2>&1 | tee /tmp/install.log
INSTALL_EXIT=$?
set -e

# If install failed, check if it's due to canvas
if [ $INSTALL_EXIT -ne 0 ]; then
  if grep -q "canvas.*install.*Failed\|ModuleNotFoundError.*distutils" /tmp/install.log; then
    echo "⚠️  Canvas installation failed (expected on Node 24/Python 3.12+), continuing without it..."
    echo "✅ canvas-confetti will use DOM fallback - this is fine!"
    # Try to install everything else, skipping canvas and optional deps
    pnpm install $INSTALL_FLAGS --ignore-scripts || true
    # Ensure canvas-confetti is available (it works without canvas)
    pnpm list canvas-confetti > /dev/null 2>&1 || pnpm add canvas-confetti@^1.9.4 --no-save --ignore-scripts || true
  else
    # Some other error occurred
    echo "❌ Install failed for a different reason. Check logs above."
    exit $INSTALL_EXIT
  fi
fi
