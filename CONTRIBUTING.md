# Contributing to AIAS Platform

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/aias-platform.git
   cd aias-platform
   ```
3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Install dependencies**
   ```bash
   pnpm install
   ```
5. **Make your changes**
6. **Test your changes**
   ```bash
   pnpm test
   pnpm typecheck
   pnpm lint
   ```
7. **Commit your changes**
   ```bash
   git commit -m "Add: your feature description"
   ```
8. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
9. **Open a Pull Request**

## Development Workflow

### Before You Start

- Check existing [issues](https://github.com/your-org/aias-platform/issues) to see if your idea is already being worked on
- For major changes, open an issue first to discuss the approach
- Make sure you can run the project locally

### Making Changes

1. **Follow the code style**
   - Run `pnpm format` before committing
   - Follow existing patterns in the codebase
   - Use TypeScript for all new code

2. **Write tests**
   - Add tests for new features
   - Ensure all tests pass
   - Aim for good test coverage

3. **Update documentation**
   - Update relevant docs if you change functionality
   - Add JSDoc comments for new functions
   - Update README if needed

4. **Keep commits focused**
   - One feature or fix per commit
   - Write clear commit messages
   - Use conventional commit format when possible

## Code Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types
- Use proper type definitions
- Run `pnpm typecheck` before committing

### Code Style

- Use Prettier for formatting (run `pnpm format`)
- Follow ESLint rules (run `pnpm lint`)
- Use meaningful variable and function names
- Add comments for complex logic

### Testing

- Write tests for new features
- Use Vitest for unit tests
- Use Playwright for E2E tests
- Aim for 80%+ test coverage

## Pull Request Process

1. **Update your branch**
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Ensure all checks pass**
   - Type checking: `pnpm typecheck`
   - Linting: `pnpm lint`
   - Tests: `pnpm test`
   - Formatting: `pnpm format:check`

3. **Write a good PR description**
   - Explain what changes you made
   - Explain why you made them
   - Reference related issues
   - Include screenshots if applicable

4. **Wait for review**
   - Address feedback promptly
   - Be open to suggestions
   - Ask questions if something is unclear

## Commit Message Format

We prefer conventional commits:

```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Maintenance tasks

Examples:
```
feat(workflows): add workflow template marketplace
fix(api): handle edge case in route handler
docs(readme): update installation instructions
```

## Project Structure

```
aias-platform/
├── apps/web/          # Next.js application
├── lib/               # Shared libraries
├── components/       # Shared React components
├── docs/              # Documentation
├── scripts/           # Utility scripts
├── tests/             # Test files
└── supabase/          # Database migrations and functions
```

## Getting Help

- **Questions?** Open a [Discussion](https://github.com/your-org/aias-platform/discussions)
- **Found a bug?** Open an [Issue](https://github.com/your-org/aias-platform/issues)
- **Need help?** Check the [Documentation](docs/)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

## Recognition

Contributors will be:
- Listed in the project README
- Credited in release notes
- Appreciated by the community

Thank you for contributing! 🎉
