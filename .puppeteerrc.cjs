/**
 * Puppeteer Configuration
 * Prevents browser downloads during installation
 * This file is read by Puppeteer to configure browser download behavior
 * 
 * Note: Puppeteer v21+ uses @puppeteer/browsers which may still download
 * browsers in postinstall scripts. The PUPPETEER_SKIP_CHROMIUM_DOWNLOAD
 * environment variable should be set to prevent downloads.
 */
const { join } = require('path');

module.exports = {
  // Changes the cache location for Puppeteer browsers
  cacheDirectory: process.env.PUPPETEER_CACHE_DIR || join(__dirname, '.cache', 'puppeteer'),
};
