#!/bin/bash
set -uo pipefail

# Vercel ignore command: Skip build if no changes to monitored paths
# Exit code 0 = skip build, non-zero = proceed with build

# If HEAD^ doesn't exist (first commit, shallow clone, etc.), always build
if ! git rev-parse --verify HEAD^ >/dev/null 2>&1; then
  exit 1
fi

# Check if any monitored paths have changed
# Paths that should trigger a build:
# - Frontend code: app/, components/, lib/, public/
# - Build config: vercel.json, vercel-build.sh, .vercelignore, pnpm-lock.yaml, next.config.mjs, patches/
if git diff --quiet HEAD^ HEAD -- app/ components/ lib/ public/ vercel.json vercel-build.sh .vercelignore pnpm-lock.yaml next.config.mjs patches/ 2>/dev/null; then
  # No changes detected - skip build
  exit 0
else
  # Changes detected - proceed with build
  exit 1
fi
