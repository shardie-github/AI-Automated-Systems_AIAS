# Patches Directory

This directory contains patches for npm packages applied using [patch-package](https://github.com/ds300/patch-package).

## puppeteer+21.11.0.patch

This patch removes the `postinstall` script from Puppeteer's package.json to prevent automatic Chromium downloads during installation.

**Why?** Puppeteer v21+ includes a postinstall script that downloads Chrome/Chromium (~300MB) even when `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` is set. This patch prevents the download entirely.

**What it does:** Removes the `"postinstall": "node install.mjs"` script from Puppeteer's package.json.

**To regenerate this patch:**
1. Install dependencies: `pnpm install`
2. Manually edit `node_modules/puppeteer/package.json` to remove the postinstall script
3. Run: `npx patch-package puppeteer`

**Note:** If Puppeteer is updated, you may need to regenerate this patch.
