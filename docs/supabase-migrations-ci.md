# Supabase Migrations via GitHub Actions

This repository uses GitHub Actions to automatically apply Supabase database migrations. This workflow runs on `ubuntu-latest` and replaces the need to run the Supabase CLI locally (useful when the CLI cannot run on your platform, such as Android/Termux).

## What This Workflow Does

The GitHub Actions workflow (`Supabase Migrations`) will:

1. **Login to Supabase** using an access token stored in GitHub Secrets
2. **Link to project** `pegqwxcukwqzbjuinwmf`
3. **Apply all pending migrations** from `supabase/migrations/` using `supabase migration up`

Migrations are executed against the hosted Supabase project database. This workflow runs automatically on pushes to `main` and can also be triggered manually.

## Prerequisites

- A Supabase account with access to project `pegqwxcukwqzbjuinwmf`
- A personal access token from Supabase
- Admin access to the GitHub repository to add secrets

## Setup Instructions

### 1. Create a Supabase Access Token

1. Log in to the [Supabase Dashboard](https://app.supabase.com)
2. Click on your profile icon (top right)
3. Go to **Account Settings** → **Access Tokens**
4. Click **Generate New Token**
5. Give it a descriptive name (e.g., "GitHub Actions Migrations")
6. Copy the token immediately (you won't be able to see it again)

**Important:** Ensure the token has appropriate privileges to manage migrations for your project.

### 2. Add Token to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `SUPABASE_ACCESS_TOKEN`
5. Value: Paste the token you copied from Supabase
6. Click **Add secret**

**⚠️ Security Note:** Never commit the access token to the repository. Only store it in GitHub Secrets.

### 3. Verify the Workflow File

The workflow file is located at `.github/workflows/supabase-migrate.yml`. It should:
- Use `npx supabase@latest` (no global CLI installation needed)
- Reference the project ref `pegqwxcukwqzbjuinwmf`
- Use the `SUPABASE_ACCESS_TOKEN` secret

## Triggering Migrations

### Automatic Trigger

Migrations run automatically when you push changes to the `main` branch that include files in `supabase/migrations/`.

### Manual Trigger

1. Go to your GitHub repository
2. Click on the **Actions** tab
3. Select **Supabase Migrations** from the workflow list
4. Click **Run workflow**
5. Select the branch (usually `main`)
6. Click **Run workflow**

## Verifying Migrations

### Check Workflow Status

1. Go to **Actions** → **Supabase Migrations**
2. Find the latest workflow run
3. Click on it to view details
4. Verify all steps completed successfully (green checkmarks)

### Review Logs

The workflow logs will show:
- Login status
- Project linking confirmation
- Migration execution details
- Any errors or warnings

### Verify in Supabase Dashboard

1. Log in to [Supabase Dashboard](https://app.supabase.com)
2. Select project `pegqwxcukwqzbjuinwmf`
3. Go to **Database** → **Migrations**
4. Verify that your migrations appear in the history

You can also check:
- **Database** → **Tables** to see new tables/columns
- **Database** → **Functions** to see new functions
- **Database** → **Extensions** to see enabled extensions

## Troubleshooting

### Workflow Fails on Login

- **Error:** "Invalid token" or "Authentication failed"
  - **Solution:** Verify the `SUPABASE_ACCESS_TOKEN` secret is correctly set in GitHub Secrets
  - **Solution:** Generate a new token if the old one expired or was revoked

### Workflow Fails on Link

- **Error:** "Project not found" or "Access denied"
  - **Solution:** Verify you have access to project `pegqwxcukwqzbjuinwmf`
  - **Solution:** Check that your access token has the correct permissions

### Migrations Fail to Apply

- **Error:** Migration SQL errors
  - **Solution:** Review the migration SQL files in `supabase/migrations/`
  - **Solution:** Check the workflow logs for specific SQL error messages
  - **Solution:** Test migrations locally first if possible

### Concurrent Migration Runs

The workflow uses concurrency control to prevent overlapping runs. If you see a message about a run being skipped, wait for the current run to complete before triggering again.

## Important Caveats

⚠️ **Production Environment:** Migrations are executed directly against your Supabase project (`pegqwxcukwqzbjuinwmf`). Any destructive operations (e.g., `DROP TABLE`, `DROP COLUMN`) will immediately affect your database.

**Recommendations:**
- Test migrations in a staging environment first
- Review migration files carefully before committing
- Use database backups before applying major migrations
- Consider using a staging project ref during development, then updating the workflow for production

## Workflow Configuration

The workflow is configured with:
- **Concurrency:** Prevents overlapping runs on the same branch
- **Triggers:** Push to `main` branch and manual dispatch
- **Runner:** `ubuntu-latest`
- **Node Version:** 20
- **CLI Method:** `npx supabase@latest` (no global installation)

## Related Documentation

- [Supabase Migration Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
