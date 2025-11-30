#!/bin/bash
set -e
export ENABLE_EXPERIMENTAL_COREPACK=1 PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true PUPPETEER_SKIP_DOWNLOAD=true
corepack enable || true
corepack prepare pnpm@8.15.0 --activate || npm install -g pnpm@8.15.0
pnpm install --no-frozen-lockfile --prefer-offline
