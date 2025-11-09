/**
 * PR Automation Module
 * Creates safe PRs for dependency updates and fixes
 * Labels: security-auto, dependencies, automated
 */

import { Octokit } from '@octokit/rest';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface PRCreationOptions {
  title: string;
  body: string;
  changes: Array<{
    path: string;
    content: string;
  }>;
  labels: string[];
  base?: string;
}

export class PRAutomation {
  constructor(
    private octokit: Octokit,
    private config: any
  ) {}

  async createAutoPR(options: PRCreationOptions): Promise<void> {
    try {
      const branchName = `orchestrator/auto-fix-${Date.now()}`;
      const baseBranch = options.base || 'main';

      // Create branch
      await this.createBranch(branchName, baseBranch);

      // Apply changes
      for (const change of options.changes) {
        await this.applyChange(change);
      }

      // Commit changes
      await this.commitChanges(branchName, options.title);

      // Create PR
      const { data: pr } = await this.octokit.rest.pulls.create({
        owner: this.config.githubOwner,
        repo: this.config.githubRepo,
        title: options.title,
        head: branchName,
        base: baseBranch,
        body: options.body
      });

      // Add labels
      if (options.labels.length > 0) {
        await this.octokit.rest.issues.addLabels({
          owner: this.config.githubOwner,
          repo: this.config.githubRepo,
          issue_number: pr.number,
          labels: options.labels
        });
      }

      console.log(`✅ Created PR #${pr.number}: ${pr.html_url}`);
    } catch (error: any) {
      console.error('Failed to create auto-PR:', error.message);
      throw error;
    }
  }

  private async createBranch(branchName: string, baseBranch: string): Promise<void> {
    try {
      // Get base branch SHA
      const { data: baseRef } = await this.octokit.rest.git.getRef({
        owner: this.config.githubOwner,
        repo: this.config.githubRepo,
        ref: `heads/${baseBranch}`
      });

      // Create new branch
      await this.octokit.rest.git.createRef({
        owner: this.config.githubOwner,
        repo: this.config.githubRepo,
        ref: `refs/heads/${branchName}`,
        sha: baseRef.object.sha
      });
    } catch (error: any) {
      if (error.status === 422) {
        // Branch might already exist, try to delete and recreate
        try {
          await this.octokit.rest.git.deleteRef({
            owner: this.config.githubOwner,
            repo: this.config.githubRepo,
            ref: `heads/${branchName}`
          });
          await this.createBranch(branchName, baseBranch);
        } catch (deleteError) {
          throw error;
        }
      } else {
        throw error;
      }
    }
  }

  private async applyChange(change: { path: string; content: string }): Promise<void> {
    const filePath = join(process.cwd(), change.path);
    writeFileSync(filePath, change.content, 'utf-8');
  }

  private async commitChanges(branchName: string, message: string): Promise<void> {
    try {
      execSync('git config user.name "Orchestrator Bot"', { stdio: 'pipe' });
      execSync('git config user.email "orchestrator@hardonia.ai"', { stdio: 'pipe' });
      execSync(`git checkout ${branchName}`, { stdio: 'pipe' });
      execSync('git add -A', { stdio: 'pipe' });
      execSync(`git commit -m "${message}"`, { stdio: 'pipe' });
      execSync(`git push origin ${branchName}`, { stdio: 'pipe' });
    } catch (error: any) {
      console.warn('Git operations failed (might be expected in CI):', error.message);
    }
  }

  async createIssueForMajorChange(title: string, body: string): Promise<void> {
    try {
      await this.octokit.rest.issues.create({
        owner: this.config.githubOwner,
        repo: this.config.githubRepo,
        title,
        body,
        labels: ['orchestrator', 'requires-review', 'breaking-change']
      });
    } catch (error) {
      console.error('Failed to create issue:', error);
    }
  }
}
