# Contributing to ESAP 🚀

Thank you for your interest in contributing to ESAP! We welcome contributions from developers of all skill levels. This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- **Be respectful** and inclusive of all contributors
- **Be constructive** in discussions and feedback
- **Focus on the issue**, not the person
- **Help others** learn and grow
- **Follow our guidelines** for contributions

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm, yarn, or pnpm
- Git
- Basic knowledge of React, TypeScript, and GSAP

### Development Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/esap.git
   cd esap
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/BALASANTHOSH01/esap.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Start development**
   ```bash
   npm run dev
   ```

## Project Structure

```
esap/
├── src/                    # Source code
│   ├── hooks/             # React hooks
│   │   ├── useFadeIn.ts
│   │   ├── useSlideIn.ts
│   │   └── ...
│   ├── components/        # React components
│   │   ├── AnimatedPresence.tsx
│   │   ├── StaggerContainer.tsx
│   │   └── ...
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   ├── presets/           # Animation presets
│   └── index.ts           # Main export file
├── examples/              # Usage examples
├── docs/                  # Documentation
├── tests/                 # Test files
├── dist/                  # Built files (generated)
└── README.md
```

## Contributing Guidelines

### Types of Contributions

We welcome several types of contributions:

1. **🐛 Bug Fixes**
   - Fix existing issues
   - Improve error handling
   - Performance optimizations

2. **✨ New Features**
   - New animation hooks
   - Additional components
   - Framework integrations

3. **📚 Documentation**
   - Improve existing docs
   - Add examples
   - Fix typos

4. **🧪 Testing**
   - Add unit tests
   - Improve test coverage
   - E2E tests

5. **🎨 Examples**
   - Create new examples
   - Improve existing demos

### Before You Start

1. **Check existing issues** to avoid duplicate work
2. **Open an issue** to discuss major changes
3. **Follow coding standards** outlined below

### Coding Standards

#### TypeScript
- Use TypeScript for all new code
- Provide proper type definitions
- Export types for public APIs

```typescript
// Good
interface FadeInOptions {
  duration?: number;
  delay?: number;
  trigger?: 'onMount' | 'onScroll';
}

export const useFadeIn = (options?: FadeInOptions) => {
  // implementation
};
```

#### React Hooks
- Follow React hooks rules
- Use proper dependency arrays
- Clean up side effects

```typescript
// Good
export const useFadeIn = (options: FadeInOptions = {}) => {
  const ref = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (!ref.current) return;
    
    const animation = gsap.from(ref.current, {
      opacity: 0,
      duration: options.duration || 1,
    });
    
    return () => animation.kill(); // Cleanup
  }, [options.duration]);
  
  return ref;
};
```

#### Naming Conventions
- Use camelCase for variables and functions
- Use PascalCase for components and interfaces
- Use descriptive names

```typescript
// Good
const useFadeIn = () => {};
const AnimatedPresence = () => {};
interface SlideInOptions {}

// Avoid
const fade = () => {};
const component = () => {};
interface opts {}
```

#### Documentation Comments
- Add JSDoc comments for all public APIs
- Include examples in documentation

```typescript
/**
 * Hook for fade-in animations
 * @param options - Animation configuration options
 * @param options.duration - Animation duration in seconds (default: 1)
 * @param options.delay - Delay before animation starts (default: 0)
 * @returns Ref to attach to the element you want to animate
 * 
 * @example
 * ```jsx
 * const fadeRef = useFadeIn({ duration: 2 });
 * return <div ref={fadeRef}>Content</div>;
 * ```
 */
export const useFadeIn = (options?: FadeInOptions) => {
  // implementation
};
```

## Pull Request Process

### 1. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number
```

### 2. Make Your Changes
- Write clean, readable code
- Follow existing patterns
- Add tests for new features
- Update documentation

### 3. Test Your Changes
```bash
npm run test           # Run all tests
npm run test:unit     # Unit tests only
npm run test:e2e      # E2E tests
npm run lint          # Check code style
npm run build         # Ensure it builds
```

### 4. Commit Your Changes
Use conventional commit messages:

```bash
git commit -m "feat: add useParallax hook"
git commit -m "fix: resolve memory leak in useFadeIn"
git commit -m "docs: update API documentation"
```

Commit types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `test`: Tests
- `refactor`: Code refactoring
- `style`: Code style changes
- `chore`: Build process or auxiliary tool changes

### 5. Push and Create PR
```bash
git push origin your-branch-name
```

Then create a Pull Request on GitHub with:
- Clear title and description
- Reference any related issues
- Include screenshots/GIFs for UI changes
- List breaking changes (if any)

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing
- [ ] Tests pass locally
- [ ] Added tests for new features
- [ ] Manual testing completed

## Screenshots/GIFs
(if applicable)

## Breaking Changes
(if applicable)

## Related Issues
Fixes #123
```

## Testing

### Running Tests
```bash
npm run test              # All tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
```

### Writing Tests
- Use Jest and React Testing Library
- Test public APIs and edge cases
- Mock GSAP when necessary

```typescript
// Example test
import { renderHook } from '@testing-library/react';
import { useFadeIn } from '../hooks/useFadeIn';

describe('useFadeIn', () => {
  it('should return a ref', () => {
    const { result } = renderHook(() => useFadeIn());
    expect(result.current).toBeDefined();
  });
  
  it('should handle custom duration', () => {
    const { result } = renderHook(() => useFadeIn({ duration: 2 }));
    // Add assertions
  });
});
```

## Documentation

### API Documentation
- Document all public APIs
- Include usage examples
- Explain parameters and return values

### Examples
- Create practical, real-world examples
- Test all examples to ensure they work
- Include CodeSandbox links when possible

### README Updates
- Update README.md for new features
- Keep examples current
- Update feature lists

## Release Process

### Versioning
We follow [Semantic Versioning](https://semver.org/):
- **PATCH** (1.0.1): Bug fixes
- **MINOR** (1.1.0): New features (backward compatible)
- **MAJOR** (2.0.0): Breaking changes

### Release Notes
- Document all changes
- Include migration guides for breaking changes
- Highlight new features

## Getting Help

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Discord**: Real-time chat (link in README)

### Questions?
- Check existing issues and discussions
- Search documentation
- Ask in our Discord community
- Open a new issue with the "question" label

## Recognition

Contributors will be:
- Added to the contributors list
- Mentioned in release notes
- Invited to join the core team (for significant contributions)

## Development Tips

### Performance
- Always clean up GSAP animations
- Use `useCallback` and `useMemo` appropriately
- Test performance with many animated elements

### Accessibility
- Respect `prefers-reduced-motion`
- Ensure animations don't cause seizures
- Test with screen readers

### Browser Compatibility
- Test in multiple browsers
- Use feature detection when needed
- Document browser support

## Thank You!

Every contribution, no matter how small, helps make ESAP better for everyone. We appreciate your time and effort in improving this project!

---

**Happy coding!** 🚀

For questions about this guide, please open an issue or reach out on Discord.
