# Quick Start Guide

**Get up and running in 10 minutes.**

## Prerequisites

Before you begin, make sure you have:

- **Node.js 18.17.0+** - [Download here](https://nodejs.org/)
- **pnpm 8.0.0+** - Install with `npm install -g pnpm`
- **Git** - [Download here](https://git-scm.com/)

Optional but recommended:
- **Docker** - For local development
- **VS Code** - Our recommended editor

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/aias-platform.git
cd aias-platform
```

### Step 2: Install Dependencies

```bash
pnpm install
```

This will install all required dependencies for the project.

### Step 3: Set Up Environment Variables

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your configuration. At minimum, you'll need:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `DATABASE_URL` - Your database connection string

### Step 4: Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Your First 10 Minutes

### 1. Explore the Dashboard (2 minutes)

Once the app is running, take a quick tour:
- Navigate to different pages
- Check out the UI components
- See what's already built

### 2. Create Your First Workflow (5 minutes)

1. Go to the Workflows section
2. Click "Create New Workflow"
3. Choose a template or start from scratch
4. Add a trigger (e.g., "New form submission")
5. Add an action (e.g., "Send email")
6. Save and test

### 3. Check the Code (3 minutes)

- Look at `apps/web/app/` for pages
- Check `components/` for reusable components
- Explore `lib/` for utilities and helpers

## Common Tasks

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test:coverage
```

### Type Checking

```bash
pnpm typecheck
```

### Linting and Formatting

```bash
# Check for linting issues
pnpm lint

# Auto-fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Check formatting
pnpm format:check
```

### Database Operations

```bash
# Push schema changes
pnpm db:push

# Run migrations
pnpm db:migrate

# Seed database
pnpm db:seed

# Open Prisma Studio
pnpm db:studio
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 pnpm dev
```

### Dependencies Issues

If you encounter dependency issues:

```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Type Errors

If you see TypeScript errors:

```bash
# Regenerate types
pnpm regenerate-types

# Check types
pnpm typecheck
```

## Next Steps

- Read the [Full Documentation](getting-started.md)
- Check out [Use Cases](USE_CASES.md)
- Review [Contributing Guidelines](../CONTRIBUTING.md)
- Join our [Discussions](https://github.com/your-org/aias-platform/discussions)

## Getting Help

- **Documentation:** Check the [docs](./) folder
- **Issues:** [GitHub Issues](https://github.com/your-org/aias-platform/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-org/aias-platform/discussions)

---

**Welcome to AIAS! 🚀**
