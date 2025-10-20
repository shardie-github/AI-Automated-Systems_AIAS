# Getting Started with AIAS Platform

Welcome to the AIAS Platform! This guide will help you get up and running quickly.

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.17.0 or higher
- **pnpm** 8.0.0 or higher
- **Docker** and Docker Compose (optional)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/aias-platform.git
   cd aias-platform
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Core Configuration
NODE_ENV=development
VITE_APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/aias_dev
DIRECT_URL=postgresql://user:password@localhost:5432/aias_dev

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (Development)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...

# Email
RESEND_API_KEY=re_...
POSTMARK_API_TOKEN=...

# Security
ENCRYPTION_KEY=your-32-char-encryption-key
JWT_SECRET=your-jwt-secret
```

### Database Setup

1. **Set up PostgreSQL**
   ```bash
   # Using Docker
   docker run --name aias-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=aias_dev -p 5432:5432 -d postgres:14
   
   # Or use Supabase (recommended)
   # Create a new project at https://supabase.com
   ```

2. **Run migrations**
   ```bash
   pnpm run db:migrate
   ```

3. **Seed the database**
   ```bash
   pnpm run db:seed
   ```

## 🏗️ Project Structure

```
aias-platform/
├── apps/
│   └── web/                 # Next.js web application
├── packages/
│   ├── lib/                 # Shared libraries and utilities
│   └── config/              # Shared configuration
├── docs/                    # Documentation
├── ops/                     # Operations and deployment
├── monitoring/              # Monitoring configuration
├── supabase/                # Database migrations and functions
└── scripts/                 # Build and deployment scripts
```

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm preview          # Preview production build

# Code Quality
pnpm typecheck        # TypeScript type checking
pnpm lint             # ESLint code linting
pnpm lint:fix         # Fix linting issues
pnpm format           # Prettier code formatting
pnpm format:check     # Check code formatting

# Testing
pnpm test             # Run unit tests
pnpm test:ui          # Run tests with UI
pnpm test:coverage    # Run tests with coverage
pnpm test:e2e         # Run end-to-end tests
pnpm test:e2e:ui      # Run E2E tests with UI

# Database
pnpm db:push          # Push schema changes
pnpm db:migrate       # Run database migrations
pnpm db:seed          # Seed database with sample data
pnpm db:studio        # Open Prisma Studio

# Performance
pnpm analyze          # Bundle analysis
pnpm lighthouse       # Lighthouse performance testing
pnpm perf:budgets     # Performance budget validation

# Security
pnpm audit:deps       # Dependency security audit
pnpm audit:licenses   # License compliance check
pnpm audit:security   # Security vulnerability scan
```

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured with React, TypeScript, and accessibility rules
- **Prettier**: Consistent code formatting
- **Husky**: Git hooks for pre-commit validation
- **Conventional Commits**: Standardized commit message format

### Testing

- **Unit Tests**: 80%+ coverage with Vitest and Testing Library
- **Integration Tests**: API and database testing
- **E2E Tests**: Critical user flows with Playwright
- **Performance Tests**: Lighthouse CI with performance budgets

## 🚀 Deployment

### Docker Deployment

1. **Build the image**
   ```bash
   docker build -t aias-platform .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

### Cloud Deployment

- **Vercel**: One-click deployment
- **AWS**: ECS, RDS, ElastiCache
- **Google Cloud**: GKE, Cloud SQL, Memorystore
- **Azure**: AKS, Database, Cache services

## 📚 Next Steps

1. **Explore the Documentation**
   - [API Documentation](api/README.md)
   - [Architecture Guide](architecture/README.md)
   - [Deployment Guide](../DEPLOYMENT_GUIDE.md)

2. **Learn the Features**
   - [AI Agent Builder](guides/ai-agent-builder.md)
   - [Workflow Automation](guides/workflow-automation.md)
   - [Marketplace](guides/marketplace.md)

3. **Contribute**
   - [Contributing Guide](../CONTRIBUTING.md)
   - [Code Standards](contributing/code-standards.md)
   - [Testing Guidelines](contributing/testing.md)

## 🆘 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Database connection issues**
   ```bash
   # Check if PostgreSQL is running
   docker ps | grep postgres
   
   # Or check Supabase connection
   pnpm run db:push
   ```

3. **Dependency issues**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

4. **Build issues**
   ```bash
   # Clear build cache
   rm -rf .next dist
   pnpm run build
   ```

### Getting Help

- **Documentation**: Check the [docs](README.md) directory
- **Issues**: [GitHub Issues](https://github.com/your-org/aias-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/aias-platform/discussions)
- **Email**: support@aias-platform.com

## 🎯 What's Next?

Now that you have the platform running locally, you can:

1. **Create your first AI agent**
2. **Build a workflow automation**
3. **Set up the marketplace**
4. **Configure payment processing**
5. **Deploy to production**

Check out the [Feature Guides](guides/README.md) for detailed instructions on each feature.

---

**Happy coding! 🚀**