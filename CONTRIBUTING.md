# Contributing to AIAS Platform

Thank you for your interest in contributing to the AIAS Platform! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Documentation](#documentation)

## 🤝 Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to conduct@aias-platform.com.

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17.0 or higher
- pnpm 8.0.0 or higher
- Git
- Docker (optional, for local development)

### Development Setup

1. **Fork and Clone**
   ```bash
   # Fork the repository on GitHub
   git clone https://github.com/YOUR_USERNAME/aias-platform.git
   cd aias-platform
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start Development Server**
   ```bash
   pnpm dev
   ```

5. **Run Tests**
   ```bash
   pnpm test
   ```

## 🔄 Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test improvements
- `chore/description` - Maintenance tasks

Examples:
- `feature/ai-agent-builder`
- `fix/payment-processing-bug`
- `docs/api-documentation-update`

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(ai): add custom AI agent builder interface

fix(payments): resolve Stripe webhook validation issue

docs(api): update authentication endpoints documentation
```

## 📝 Code Standards

### TypeScript

- Use strict TypeScript mode
- Define explicit types for all functions and variables
- Use interfaces for object shapes
- Prefer `type` over `interface` for unions and primitives
- Use proper error handling with typed errors

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  name: string;
}

type UserRole = 'admin' | 'user' | 'guest';

function createUser(userData: Omit<User, 'id'>): Promise<User> {
  // Implementation
}

// ❌ Bad
function createUser(userData: any): any {
  // Implementation
}
```

### React Components

- Use functional components with hooks
- Define proper prop types
- Use meaningful component names
- Keep components small and focused
- Use proper error boundaries

```typescript
// ✅ Good
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ variant, size, children, onClick, disabled }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }))}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// ❌ Bad
export function Button(props: any) {
  return <button {...props} />;
}
```

### File Organization

- Use kebab-case for file names
- Group related files in folders
- Use index files for clean imports
- Separate concerns (components, hooks, utils, types)

```
components/
├── ui/
│   ├── button.tsx
│   ├── input.tsx
│   └── index.ts
├── forms/
│   ├── user-form.tsx
│   └── index.ts
└── index.ts
```

### Naming Conventions

- **Variables**: camelCase (`userName`, `isLoading`)
- **Functions**: camelCase (`getUserData`, `handleSubmit`)
- **Components**: PascalCase (`UserProfile`, `PaymentForm`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRY_ATTEMPTS`)
- **Files**: kebab-case (`user-profile.tsx`, `api-client.ts`)

## 🧪 Testing Guidelines

### Test Structure

- Write tests for all new features
- Maintain 80%+ code coverage
- Use descriptive test names
- Group related tests with `describe` blocks
- Use proper setup and teardown

```typescript
// ✅ Good
describe('UserService', () => {
  let userService: UserService;
  let mockApiClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockApiClient = createMockApiClient();
    userService = new UserService(mockApiClient);
  });

  describe('createUser', () => {
    it('should create a user with valid data', async () => {
      // Arrange
      const userData = { name: 'John Doe', email: 'john@example.com' };
      mockApiClient.post.mockResolvedValue({ id: '1', ...userData });

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result).toEqual({ id: '1', ...userData });
      expect(mockApiClient.post).toHaveBeenCalledWith('/users', userData);
    });

    it('should throw error for invalid email', async () => {
      // Arrange
      const userData = { name: 'John Doe', email: 'invalid-email' };

      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow('Invalid email');
    });
  });
});
```

### Test Types

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and database interactions
- **E2E Tests**: Test complete user workflows
- **Visual Tests**: Test component rendering and styling

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Run specific test file
pnpm test user-service.test.ts
```

## 🔍 Pull Request Process

### Before Submitting

1. **Update Documentation**
   - Update README.md if needed
   - Add/update API documentation
   - Update inline code comments

2. **Run Quality Checks**
   ```bash
   pnpm typecheck
   pnpm lint
   pnpm format:check
   pnpm test
   pnpm test:e2e
   ```

3. **Update Tests**
   - Add tests for new features
   - Update existing tests if needed
   - Ensure all tests pass

### Pull Request Template

Use the following template for pull requests:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No breaking changes (or breaking changes documented)

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Additional Notes
Any additional information about the changes
```

### Review Process

1. **Automated Checks**
   - All CI/CD checks must pass
   - Code coverage must be maintained
   - Security scans must pass
   - Performance budgets must be met

2. **Code Review**
   - At least one approval required
   - Address all review comments
   - Update documentation if needed

3. **Merge Process**
   - Squash and merge for feature branches
   - Rebase and merge for hotfixes
   - Delete feature branch after merge

## 🐛 Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. iOS]
- Browser [e.g. chrome, safari]
- Version [e.g. 22]

**Additional context**
Add any other context about the problem here.
```

### Feature Requests

Use the feature request template:

```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

## 📚 Documentation

### Code Documentation

- Use JSDoc for functions and classes
- Document complex algorithms and business logic
- Keep comments up-to-date with code changes
- Use meaningful variable and function names

```typescript
/**
 * Calculates the total price including tax and discounts
 * @param basePrice - The base price before tax and discounts
 * @param taxRate - The tax rate as a decimal (e.g., 0.08 for 8%)
 * @param discountAmount - The discount amount to apply
 * @returns The total price after applying tax and discounts
 */
function calculateTotalPrice(
  basePrice: number,
  taxRate: number,
  discountAmount: number = 0
): number {
  const priceAfterDiscount = basePrice - discountAmount;
  const taxAmount = priceAfterDiscount * taxRate;
  return priceAfterDiscount + taxAmount;
}
```

### API Documentation

- Document all API endpoints
- Include request/response examples
- Document error codes and messages
- Keep documentation synchronized with code

### README Updates

- Update README.md for significant changes
- Include setup instructions for new features
- Update dependency versions
- Add troubleshooting information

## 🚀 Release Process

### Version Numbering

We use [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version numbers updated
- [ ] Release notes prepared
- [ ] Security scan completed

## 🤔 Questions?

If you have questions about contributing:

- Check existing [GitHub Issues](https://github.com/your-org/aias-platform/issues)
- Join our [Discord Community](https://discord.gg/aias-platform)
- Email us at contributors@aias-platform.com

## 🙏 Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation
- Community highlights

Thank you for contributing to AIAS Platform! 🎉