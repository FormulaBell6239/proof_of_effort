# Contributing to Proof of Effort Network

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Respect different perspectives

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/proof_of_effort.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request

## Development Setup

```bash
# Install all dependencies
npm run install:all

# Start development environment
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Blockchain (optional)
cd contracts && npx hardhat node
```

## Project Structure

```
proof_of_effort/
├── backend/          # Node.js API
├── frontend/         # React application
├── contracts/        # Smart contracts
└── docs/            # Documentation
```

## Coding Standards

### TypeScript
- Use strict mode
- Prefer interfaces over types
- Document complex logic
- Use meaningful variable names

### React
- Functional components with hooks
- Props validation
- Keep components small and focused
- Use custom hooks for reusable logic

### Solidity
- Follow Solidity style guide
- Document all functions
- Use latest OpenZeppelin contracts
- Write comprehensive tests

## Testing

```bash
# Backend tests
cd backend && npm test

# Contract tests
cd contracts && npx hardhat test

# Frontend tests (coming soon)
cd frontend && npm test
```

## Pull Request Process

1. **Update Documentation**: If you change APIs or behavior
2. **Add Tests**: Cover new functionality
3. **Follow Style Guide**: Use existing code as reference
4. **Keep PRs Focused**: One feature/fix per PR
5. **Write Clear Commit Messages**:
   ```
   feat: Add effort verification endpoint
   fix: Resolve trust score calculation bug
   docs: Update API documentation
   refactor: Simplify authentication middleware
   ```

## Types of Contributions

### 🐛 Bug Fixes
- Check existing issues first
- Provide reproduction steps
- Include fix in PR

### ✨ New Features
- Discuss in an issue first
- Follow architecture patterns
- Update documentation

### 📚 Documentation
- Fix typos
- Clarify confusing sections
- Add examples

### 🎨 UI/UX Improvements
- Maintain design consistency
- Consider accessibility
- Test on multiple devices

## Reporting Issues

When reporting bugs, include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots if applicable

## Feature Requests

- Explain the use case
- Describe expected behavior
- Consider implementation complexity
- Discuss alternatives

## Questions?

- Open a discussion on GitHub
- Join our Discord (coming soon)
- Check existing documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make Proof of Effort Network better! 🚀
