# Vercel pnpm Workspace Protocol Fix

## Problem

Vercel builds were failing with:
```
npm error code EUNSUPPORTEDPROTOCOL
npm error Unsupported URL Type "workspace:": workspace:*
```

This occurs because:
1. Vercel detects Turbo and tries to use npm
2. npm doesn't support pnpm's `workspace:*` protocol
3. The project uses pnpm workspaces which require pnpm

## Solution

Multiple layers of protection ensure pnpm is always used:

### 1. Package Manager Declaration

`package.json` includes:
```json
{
  "packageManager": "pnpm@8.15.0",
  "engines": {
    "pnpm": ">=8.0.0"
  }
}
```

### 2. Configuration Files

**`.npmrc`** - Forces pnpm usage:
```
package-manager=pnpm@8.15.0
auto-install-peers=true
strict-peer-dependencies=false
```

**`.pnpmrc`** - pnpm-specific configuration:
```
auto-install-peers=true
strict-peer-dependencies=false
shamefully-hoist=false
```

### 3. Vercel Configuration

**`vercel.json`**:
```json
{
  "installCommand": "export ENABLE_EXPERIMENTAL_COREPACK=1 && corepack enable && corepack prepare pnpm@8.15.0 --activate && pnpm install --frozen-lockfile",
  "buildCommand": "bash vercel-build.sh",
  "env": {
    "ENABLE_EXPERIMENTAL_COREPACK": "1"
  }
}
```

### 4. Build Script

**`vercel-build.sh`** ensures:
- Corepack is enabled
- pnpm is activated
- Dependencies are installed with pnpm
- Build and validation run with pnpm

## How It Works

1. **Corepack Detection**: Vercel detects `packageManager` field
2. **Corepack Activation**: Script enables corepack and prepares pnpm
3. **pnpm Installation**: Uses pnpm instead of npm
4. **Workspace Support**: pnpm handles `workspace:*` protocol correctly

## Verification

After deployment, verify:
1. Build logs show `pnpm` being used
2. No `EUNSUPPORTEDPROTOCOL` errors
3. Dependencies install successfully
4. Build completes successfully

## Troubleshooting

### If npm is still being used:

1. Check `package.json` has `packageManager` field
2. Verify `.npmrc` exists with `package-manager=pnpm@8.15.0`
3. Check `vercel.json` installCommand uses corepack
4. Review build logs for corepack activation

### If corepack fails:

1. Ensure Node.js version supports corepack (>=16.9.0)
2. Check `ENABLE_EXPERIMENTAL_COREPACK=1` is set
3. Verify pnpm version matches `packageManager` field
4. Fallback: Install pnpm globally in build script

## Prevention

This setup prevents the error by:
- ✅ Explicitly declaring pnpm as package manager
- ✅ Using corepack to ensure correct package manager
- ✅ Configuring Vercel to use pnpm
- ✅ Providing fallback installation methods
- ✅ Validating pnpm is available before install

## Summary

The fix ensures:
- pnpm is always used (not npm)
- Workspace protocol is supported
- Corepack handles package manager selection
- Multiple fallback mechanisms exist
- Build process is reliable and foolproof
