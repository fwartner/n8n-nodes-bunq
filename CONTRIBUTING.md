# Contributing to bunq n8n Integration

Thank you for your interest in contributing to the bunq n8n integration! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Development Guidelines](#development-guidelines)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

This project and everyone participating in it is governed by our commitment to providing a welcoming and inclusive environment for all contributors.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git
- bunq developer account (for testing)
- Basic knowledge of TypeScript and n8n node development

### Development Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/fwartner/n8n-nodes-bunq.git
   cd n8n-nodes-bunq
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up development environment**
   ```bash
   # Copy environment file
   cp .env.example .env
   
   # Add your bunq sandbox credentials for testing
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Run tests**
   ```bash
   npm test
   ```

## How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **Bug fixes**: Fix existing issues or problems
- **Feature additions**: Add new bunq API endpoints or functionality
- **Documentation**: Improve docs, examples, or code comments
- **Testing**: Add tests for existing functionality
- **Performance**: Optimize existing code
- **Code quality**: Refactoring, linting, type improvements

### Before You Start

1. **Check existing issues**: Look through existing issues to see if your contribution is already being worked on
2. **Create an issue**: For major changes, create an issue first to discuss the approach
3. **Small changes**: For small bug fixes or documentation improvements, feel free to submit a PR directly

## Development Guidelines

### Code Style

We use ESLint and Prettier for consistent code formatting:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### TypeScript Standards

- Use strict TypeScript with proper typing
- Avoid `any` types when possible
- Use interfaces for object structures
- Document complex types with JSDoc comments

### n8n Node Development

Follow n8n's node development guidelines:

- Use proper n8n interfaces (`IExecuteFunctions`, `INodeType`, etc.)
- Implement proper error handling
- Support pagination for list operations
- Use meaningful parameter names and descriptions
- Add proper node icons and branding

### bunq API Integration

- Follow bunq's API best practices
- Implement proper authentication and session management
- Handle rate limiting appropriately
- Use correct API endpoints and parameters
- Implement proper error handling for bunq-specific errors

### File Structure

```
├── credentials/           # n8n credential types
├── nodes/                # n8n node implementations
│   ├── Bunq/            # Main bunq node
│   │   ├── descriptions/ # Operation descriptions
│   │   └── *.ts         # Node implementation files
│   └── BunqTrigger/     # Webhook trigger node
├── __tests__/           # Test files
└── dist/                # Build output
```

### Adding New Operations

When adding new bunq API operations:

1. **Add to the appropriate description file** in `nodes/Bunq/descriptions/`
2. **Implement the operation** in the main node file
3. **Add comprehensive tests** in `__tests__/`
4. **Update documentation** and examples

Example structure for new operations:

```typescript
// In description file
{
    displayName: 'Operation Name',
    name: 'operationName',
    value: 'operationName',
    description: 'Clear description of what this does',
}

// In node implementation
case 'operationName':
    const response = await bunqApiRequest.call(this, 'GET', '/endpoint');
    return [this.helpers.returnJsonArray(response)];
```

## Testing

### Test Requirements

- All new functionality must include tests
- Tests should cover both success and error scenarios
- Use meaningful test descriptions
- Mock external API calls appropriately

### Test Structure

```typescript
describe('Feature Name', () => {
    beforeEach(() => {
        // Setup mocks
    });

    it('should handle successful operation', async () => {
        // Test implementation
    });

    it('should handle error scenarios', async () => {
        // Error testing
    });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- PaymentOperations.test.ts

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Submitting Changes

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow coding standards
   - Add/update tests
   - Update documentation if needed

3. **Test your changes**
   ```bash
   npm test
   npm run build
   npm run lint
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new payment operation"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Use a clear, descriptive title
   - Provide detailed description of changes
   - Reference any related issues
   - Include screenshots if applicable

### Commit Message Format

We use conventional commits for consistent commit messages:

```
type(scope): description

feat: add new feature
fix: fix bug
docs: update documentation
test: add tests
refactor: refactor code
style: formatting changes
chore: maintenance tasks
```

Examples:
- `feat(payments): add recurring payment support`
- `fix(webhooks): handle missing event data`
- `docs: update installation instructions`
- `test(attachments): add file upload tests`

### PR Requirements

Before submitting a PR, ensure:

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] New functionality includes tests
- [ ] Documentation is updated if needed
- [ ] No breaking changes without discussion
- [ ] Commit messages follow conventional format

## Issue Reporting

### Bug Reports

When reporting bugs, include:

- **Clear description** of the issue
- **Steps to reproduce** the problem
- **Expected vs actual behavior**
- **Environment details** (n8n version, Node.js version, etc.)
- **Error messages** or logs if applicable
- **Screenshots** if helpful

### Feature Requests

For feature requests, include:

- **Clear description** of the desired functionality
- **Use case** and business justification
- **Proposed implementation** if you have ideas
- **bunq API endpoints** that would be needed

### Issue Templates

Use our issue templates when creating new issues:
- Bug Report Template
- Feature Request Template
- Question Template

## Development Resources

### Useful Links

- [bunq API Documentation](https://doc.bunq.com/)
- [n8n Node Development Guide](https://docs.n8n.io/integrations/creating-nodes/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)

### Getting Help

- **GitHub Discussions**: For general questions and discussions
- **GitHub Issues**: For bug reports and feature requests
- **n8n Community**: For n8n-specific questions
- **Discord/Slack**: Real-time chat (if available)

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes for significant contributions
- Project documentation

Thank you for contributing to make banking automation more accessible through n8n!