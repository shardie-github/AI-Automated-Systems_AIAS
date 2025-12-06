# 🚀 AI Automated Systems: API-First AI Agent Platform

[![CI/CD Pipeline](https://github.com/shardie-github/aias/actions/workflows/ci.yml/badge.svg)](https://github.com/shardie-github/aias/actions/workflows/ci.yml)
[![Security Scan](https://github.com/shardie-github/aias/actions/workflows/security.yml/badge.svg)](https://github.com/shardie-github/aias/actions/workflows/security.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Website](https://img.shields.io/badge/Website-aiautomatedsystems.ca-blue)](https://aiautomatedsystems.ca)

**AI Automated Systems** is the **API-first AI agent and automation platform** built exclusively for developers. We embody a **Resend-style** philosophy to simplify complex AI infrastructure, delivering **composability and exceptional DX** where complexity previously reigned supreme.

## 💡 Why AI Automated Systems? The Developer Experience (DX) Advantage

Achieve reliable, modern AI tooling with minimal effort. AI Automated Systems focuses on predictable endpoints and clear data streams to handle AI agents and automation workflows instantly.

* **API-First Design:** Clear, predictable, and fully documented RESTful endpoints for every workflow.
* **Composability:** Build and chain complex AI automation processes using simple API primitives.
* **Simplicity:** Minimal configuration, maximal AI capabilities and reliability.
* **Enterprise-Ready:** Multi-tenant architecture, SOC 2 compliance, and enterprise security built-in.

## ⚡ Quick Start: Deploy AI Agents in Minutes

```bash
# 1. Clone the repository
git clone https://github.com/shardie-github/aias.git
cd aias

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration (see .env.example for required variables)

# 4. Run the development server
pnpm dev

# 5. Access the platform
open http://localhost:3000
```

For detailed setup instructions, see [Local Development Setup](./docs/SETUP_LOCAL.md).

## 🏗️ Architecture

AI Automated Systems is built with:

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Supabase** - Backend-as-a-Service (PostgreSQL, Auth, Storage)
- **Turborepo** - Monorepo build system
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations

## 📚 Documentation & Support

- **Documentation:** See [docs/README.md](./docs/README.md) for comprehensive documentation
  - [Quick Start Guide](./docs/QUICK_START.md)
  - [Local Development Setup](./docs/SETUP_LOCAL.md)
  - [Architecture Overview](./docs/ARCHITECTURE.md)
  - [API Documentation](./docs/API.md)
  - [Content Studio](./docs/content-studio.md)
  - [Deployment Guide](./docs/DEPLOYMENT.md)
- **Website:** [aiautomatedsystems.ca](https://aiautomatedsystems.ca)
- **GitHub Issues:** [Report a bug or request a feature](https://github.com/shardie-github/aias/issues)
- **Discussions:** [Community discussions](https://github.com/shardie-github/aias/discussions)
- **Email Support:** support@aiautomatedsystems.ca

## 🔒 Security & Privacy

- **Encrypted Documents:** Internal business and investor relations documents are secured in the `/INVESTOR-RELATIONS-PRIVATE` folder and are encrypted via Git-crypt.
- **Enterprise Security:** SOC 2, GDPR, CCPA compliance built-in.
- **Security Reporting:** Report security vulnerabilities to scottrmhardie@gmail.com

## 🛠️ Development

### Prerequisites

- **Node.js**: >=22 (see [.nvmrc](./.nvmrc))
- **pnpm**: >=8.0.0 (see [package.json](./package.json))
- **Git**: Latest version

### Development Commands

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run type checking
pnpm typecheck

# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Check code formatting
pnpm format:check

# Format code
pnpm format

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Build for production
pnpm build
```

### Required Checks Before Committing

All code must pass these checks:

1. **Linting**: `pnpm lint` (no errors)
2. **Type Checking**: `pnpm typecheck` (no errors)
3. **Formatting**: `pnpm format:check` (must pass)
4. **Tests**: `pnpm test` (must pass, if tests exist)

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed contribution guidelines.

## 📦 Project Structure

```
/
├── app/                    # Next.js App Router pages and API routes
├── components/             # React components
├── lib/                    # Shared utilities and libraries
├── packages/               # Monorepo packages
├── supabase/               # Supabase functions and migrations
├── docs/                   # Documentation
├── INVESTOR-RELATIONS-PRIVATE/  # Encrypted investor documents (git-crypt)
└── HISTORICAL-PLANNING-ARCHIVE/ # Archived planning documents
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Features

### 🤖 AI Agent Marketplace
Create custom AI agents tailored to your business needs. Deploy them instantly. Monetize them if you want.

### 🔄 Visual Workflow Builder
No coding required. Drag, drop, connect. Build complex automations in minutes, not weeks.

### 💰 Multiple Revenue Streams
SaaS subscriptions, one-time apps, API usage, partnerships—monetize however makes sense for your business.

### 🏢 Multi-Tenant Architecture
Serve multiple customers from one platform. Complete isolation. Complete control.

### 🔒 Enterprise Security Built-In
SOC 2, GDPR, CCPA compliance isn't optional—it's included. Advanced threat detection. Data encryption. Audit logging.

## 🚦 Status

- ✅ Core platform operational
- ✅ API endpoints documented
- ✅ Multi-tenant architecture
- ✅ Enterprise security features
- 🔄 Continuous improvements

## 📞 Contact & Support

- **Official Website:** [aiautomatedsystems.ca](https://aiautomatedsystems.ca)
- **Help Center Support:** support@aiautomatedsystems.ca (for existing clients and technical support)
- **Consulting & Inquiries:** inquiries@aiautomatedsystems.ca (for consulting, workflow services, and hiring)
- **Feedback & Bug Reports:** scottrmhardie@gmail.com (for comments, feedback, bug reports, or general inquiries)
- **GitHub:** [@shardie-github/aias](https://github.com/shardie-github/aias)

---

**Built in Canada 🇨🇦 • Serving the World 🌍**
