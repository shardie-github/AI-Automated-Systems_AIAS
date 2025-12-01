#!/usr/bin/env tsx
/**
 * Developer Setup Script
 * One-command environment setup for new developers
 */

import { execSync } from 'child_process';
import { logger } from '@/lib/logging/structured-logger';
import * as fs from 'fs';
import * as path from 'path';

class DevSetup {
  async run(): Promise<void> {
    logger.info('Starting developer setup...');

    try {
      // Check Node.js version
      this.checkNodeVersion();
      
      // Check pnpm installation
      this.checkPnpm();
      
      // Install dependencies
      this.installDependencies();
      
      // Setup environment variables
      this.setupEnvironment();
      
      // Run type checking
      this.runTypeCheck();
      
      logger.info('✅ Developer setup complete!');
      logger.info('Next steps:');
      logger.info('1. Review .env.local and update with your values');
      logger.info('2. Run: pnpm dev');
      logger.info('3. Open: http://localhost:3000');
    } catch (error) {
      logger.error('Setup failed', error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    }
  }

  private checkNodeVersion(): void {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 18) {
      throw new Error(`Node.js 18+ required. Current: ${nodeVersion}`);
    }
    
    logger.info(`✅ Node.js version: ${nodeVersion}`);
  }

  private checkPnpm(): void {
    try {
      const pnpmVersion = execSync('pnpm --version', { encoding: 'utf-8' }).trim();
      logger.info(`✅ pnpm version: ${pnpmVersion}`);
    } catch {
      logger.warn('pnpm not found. Installing...');
      execSync('npm install -g pnpm', { stdio: 'inherit' });
    }
  }

  private installDependencies(): void {
    logger.info('Installing dependencies...');
    execSync('pnpm install', { stdio: 'inherit' });
    logger.info('✅ Dependencies installed');
  }

  private setupEnvironment(): void {
    const envExamplePath = path.join(process.cwd(), '.env.example');
    const envLocalPath = path.join(process.cwd(), '.env.local');
    
    if (!fs.existsSync(envLocalPath) && fs.existsSync(envExamplePath)) {
      logger.info('Creating .env.local from .env.example...');
      fs.copyFileSync(envExamplePath, envLocalPath);
      logger.info('✅ .env.local created');
      logger.warn('⚠️  Please update .env.local with your actual values');
    } else {
      logger.info('✅ .env.local already exists');
    }
  }

  private runTypeCheck(): void {
    logger.info('Running type check...');
    try {
      execSync('pnpm typecheck', { stdio: 'inherit' });
      logger.info('✅ Type check passed');
    } catch {
      logger.warn('⚠️  Type check failed. This is okay for initial setup.');
    }
  }
}

// Run setup if executed directly
if (require.main === module) {
  const setup = new DevSetup();
  setup.run().catch((error) => {
    logger.fatal('Setup failed', error instanceof Error ? error : new Error(String(error)));
    process.exit(1);
  });
}

export { DevSetup };
