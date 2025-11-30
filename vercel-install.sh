#!/bin/bash
set -e
export ENABLE_EXPERIMENTAL_COREPACK=1 PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true PUPPETEER_SKIP_DOWNLOAD=true

# Install dependencies with optimizations
# - Use --no-frozen-lockfile to allow lockfile updates when package.json changes
# - Prefer offline for cached packages
# Note: Lockfile may be out of sync with package.json, so we allow updates
corepack enable || true
corepack prepare pnpm@8.15.0 --activate || npm install -g pnpm@8.15.0

INSTALL_FLAGS="--prefer-offline --no-frozen-lockfile"

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
