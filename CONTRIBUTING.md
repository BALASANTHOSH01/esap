# Contributing to ESAP 🚀

Thank you for your interest in contributing to ESAP! This guide will help you get started with contributing to our React/Next.js animation library.

## 🌟 Ways to Contribute

- 🐛 **Bug Reports** - Help us identify and fix issues
- 💡 **Feature Requests** - Suggest new animations and capabilities
- 🔧 **Code Contributions** - Implement new features or fix bugs
- 📚 **Documentation** - Improve guides, examples, and API docs
- 🎨 **Examples & Demos** - Create showcase projects
- 🧪 **Testing** - Write tests and improve coverage
- 🎯 **Performance** - Optimize animations and reduce bundle size
- 🌐 **Accessibility** - Enhance a11y features and compliance

## 🚀 Quick Start

### Prerequisites
- **Node.js 20 LTS** (Latest LTS recommended)
- **npm 9+**, yarn, or pnpm
- Git
- Basic knowledge of React, TypeScript, GSAP, Three.js

> **Note:** We recommend using the latest Node.js LTS version for the best performance, security updates, and compatibility with modern tooling.

### Development Setup

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/BALASANTHOSH01/esap.git
cd esap

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev

# 5. Run tests
npm test

# 6. Build library
npm run build
```

### Project Structure

```
esap/
├── src/
│   ├── hooks/           # Core animation hooks
│   │   ├── core/        # Basic animations (fade, slide, etc.)
│   │   ├── 3d/          # Three.js integration
│   │   ├── physics/     # Matter.js physics
│   │   ├── particles/   # Particle systems
│   │   ├── audio/       # Audio-reactive features
│   │   ├── ai/          # AI-powered animations
│   │   ├── text/        # Text animations
│   │   ├── gestures/    # Touch & gesture support
│   │   └── utils/       # Utility hooks
│   ├── components/      # React components
│   │   ├── AnimatedPresence.tsx
│   │   ├── StaggerContainer.tsx
│   │   ├── Scene3D.tsx
│   │   └── ParticleSystem.tsx
│   ├── presets/         # Animation presets
│   ├── types/           # TypeScript definitions
│   ├── utils/           # Helper functions
│   └── index.ts         # Main exports
├── examples/            # Example projects
├── docs/               # Documentation
├── tests/              # Test files
└── tools/              # Build and development tools
```

## 🛠️ Development Guidelines

### Code Style

We use ESLint, Prettier, and TypeScript for consistent code quality.

```bash
# Check code style
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Format code
npm run format
```

### Naming Conventions

- **Hooks**: `use[FeatureName]` (e.g., `useFadeIn`, `use3DScene`)
- **Components**: `PascalCase` (e.g., `AnimatedPresence`)
- **Types**: `PascalCase` with descriptive suffixes (e.g., `FadeInOptions`, `ParticleConfig`)
- **Files**: `camelCase.ts` or `PascalCase.tsx` for components

### TypeScript Guidelines

```typescript
// ✅ Good - Proper typing
interface FadeInOptions {
  duration?: number;
  delay?: number;
  trigger?: 'onMount' | 'onScroll';
  threshold?: number;
}

export function useFadeIn(options: FadeInOptions = {}) {
  // Implementation
}

// ❌ Avoid - Any types
function useFadeIn(options: any) {
  // Don't do this
}
```

### Hook Development Pattern

```typescript
import { useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';

interface UseCustomAnimationOptions {
  duration?: number;
  ease?: string;
  // ... other options
}

export function useCustomAnimation(options: UseCustomAnimationOptions = {}) {
  const ref = useRef<HTMLElement>(null);
  const timelineRef = useRef<gsap.core.Timeline>();
  
  const {
    duration = 1,
    ease = 'power2.out',
    ...otherOptions
  } = options;

  const animate = useCallback(() => {
    if (!ref.current) return;
    
    timelineRef.current = gsap.timeline();
    // Animation logic here
    
  }, [duration, ease]);

  useEffect(() => {
    animate();
    
    // Cleanup
    return () => {
      timelineRef.current?.kill();
    };
  }, [animate]);

  return { ref, animate };
}
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- hooks/core/useFadeIn.test.ts

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

We use Vitest and React Testing Library for testing.

```typescript
import { renderHook, act } from '@testing-library/react';
import { useFadeIn } from '../useFadeIn';

describe('useFadeIn', () => {
  it('should provide a ref', () => {
    const { result } = renderHook(() => useFadeIn());
    expect(result.current.ref).toBeDefined();
  });

  it('should accept custom duration', () => {
    const { result } = renderHook(() => 
      useFadeIn({ duration: 2 })
    );
    // Test implementation
  });

  it('should handle cleanup on unmount', () => {
    const { unmount } = renderHook(() => useFadeIn());
    act(() => {
      unmount();
    });
    // Verify cleanup
  });
});
```

### Performance Testing

```bash
# Run performance benchmarks
npm run test:perf

# Test bundle size
npm run test:size

# Memory leak detection
npm run test:memory
```

## 🎯 Contributing Different Types of Features

### 🎨 Adding New Animation Hooks

1. **Create hook file**: `src/hooks/[category]/use[FeatureName].ts`
2. **Follow the hook pattern** shown above
3. **Add TypeScript definitions**
4. **Write comprehensive tests**
5. **Add to main exports**: Update `src/index.ts`
6. **Document usage**: Add examples and API docs

Example PR checklist for new hooks:
- [ ] Hook implementation with proper TypeScript
- [ ] Unit tests with good coverage
- [ ] Integration with existing animation system
- [ ] Performance optimizations
- [ ] Accessibility considerations
- [ ] Documentation and examples

### 🎮 Adding 3D Features

3D features require special considerations:

```typescript
// Example 3D hook structure
export function use3DCustomEffect(options: CustomEffectOptions = {}) {
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  
  // Proper cleanup for 3D resources
  useEffect(() => {
    return () => {
      // Dispose geometries, materials, textures
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
    };
  }, []);
  
  return { sceneRef };
}
```

### ⚡ Adding Physics Features

Physics features should integrate cleanly with GSAP:

```typescript
export function usePhysicsCustom(options: PhysicsOptions = {}) {
  const worldRef = useRef<Matter.World>();
  const engineRef = useRef<Matter.Engine>();
  
  // Sync Matter.js with GSAP
  const syncWithGSAP = useCallback((body: Matter.Body, target: gsap.TweenTarget) => {
    gsap.set(target, {
      x: body.position.x,
      y: body.position.y,
      rotation: body.angle
    });
  }, []);
  
  return { worldRef, syncWithGSAP };
}
```

### 🎵 Adding Audio Features

Audio features need proper Web Audio API integration:

```typescript
export function useAudioCustom(options: AudioOptions = {}) {
  const audioContextRef = useRef<AudioContext>();
  const analyserRef = useRef<AnalyserNode>();
  
  useEffect(() => {
    // Proper audio context handling
    const initAudio = async () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
    };
    
    initAudio();
    
    return () => {
      audioContextRef.current?.close();
    };
  }, []);
  
  return { audioContextRef };
}
```

## 📚 Documentation

### Writing Documentation

- **Clear examples** for each feature
- **TypeScript signatures** for all public APIs
- **Use cases** and when to use each hook
- **Performance considerations**
- **Accessibility notes**

### Documentation Structure

```markdown
# useFeatureName

Brief description of what this hook does.

## Usage

\```jsx
import { useFeatureName } from 'esap';

function MyComponent() {
  const { ref } = useFeatureName({
    duration: 1,
    ease: 'power2.out'
  });
  
  return <div ref={ref}>Animated content</div>;
}
\```

## API

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| duration | number | 1 | Animation duration |
| ease | string | 'power2.out' | Easing function |

### Returns

| Property | Type | Description |
|----------|------|-------------|
| ref | RefObject | Element reference |
```

## 🚦 Pull Request Process

### Before Submitting

1. **Create an issue** first (unless it's a small fix)
2. **Fork the repository**
3. **Create a feature branch**: `git checkout -b feature/amazing-feature`
4. **Make your changes**
5. **Add tests** for new functionality
6. **Update documentation**
7. **Ensure all tests pass**: `npm test`
8. **Check bundle size impact**: `npm run size-check`

### PR Requirements

- [ ] **Descriptive title** and detailed description
- [ ] **Tests included** and passing
- [ ] **Documentation updated**
- [ ] **No breaking changes** (unless major version)
- [ ] **Performance impact** considered
- [ ] **Accessibility** requirements met
- [ ] **TypeScript types** are complete
- [ ] **Bundle size** impact is reasonable

### PR Template

```markdown
## Description
Brief description of changes and motivation.

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature causing existing functionality to break)
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console warnings/errors
```

## 🐛 Bug Reports

### Before Reporting

1. **Search existing issues**
2. **Try latest version**
3. **Create minimal reproduction**

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug.

## To Reproduce
1. Step 1
2. Step 2
3. See error

## Expected Behavior
What should happen.

## Environment
- ESAP version: 
- React version:
- Browser:
- OS:

## Code Example
\```jsx
// Minimal reproduction code
\```
```

## 💡 Feature Requests

### Feature Request Template

```markdown
## Feature Description
Clear description of the proposed feature.

## Use Case
Why is this feature needed? What problem does it solve?

## Proposed API
\```jsx
// How you envision using this feature
const { ref } = useNewFeature({
  // options
});
\```

## Alternatives Considered
Any alternative solutions you've considered.
```

## 🏗️ Architecture Decisions

### Core Principles

1. **Zero Configuration** - Should work out of the box
2. **Performance First** - Optimize for 60fps animations
3. **Accessibility** - Respect user preferences
4. **TypeScript** - Full type safety
5. **Tree Shakeable** - Only bundle what's used
6. **React Patterns** - Follow React best practices

### Adding Dependencies

New dependencies must be justified:
- **Bundle size impact** < 5KB for core features
- **Performance benefits** or essential functionality
- **Maintenance status** - actively maintained
- **License compatibility** - MIT compatible

### Breaking Changes

Breaking changes require:
- **Major version bump**
- **Migration guide**
- **Deprecation warnings** (when possible)
- **Community discussion**

## 🏆 Recognition

Contributors are recognized in:
- **README.md** contributors section
- **CHANGELOG.md** release notes
- **GitHub releases**
- **Social media** shoutouts

### Types of Recognition

- 🐛 **Bug Hunter** - Found and reported bugs
- 💻 **Code Contributor** - Submitted code changes
- 📚 **Documentation** - Improved docs and examples
- 🎨 **Design** - UI/UX improvements
- 🧪 **Testing** - Added tests and QA
- 🌟 **Feature Champion** - Implemented major features

## 📞 Getting Help

- **GitHub Discussions** - General questions and ideas
- **GitHub Issues** - Bug reports and feature requests
- **Discord** - Real-time community chat
- **Stack Overflow** - Tag questions with `esap`

## 📄 License

By contributing to ESAP, you agree that your contributions will be licensed under the MIT License.

---

## 🚀 Ready to Contribute?

1. **Star the repository** ⭐
2. **Join our Discord** 💬
3. **Check open issues** 🎯
4. **Read the codebase** 📖
5. **Make your first contribution** 🎉

Thank you for helping make ESAP better for everyone! 🙏

---

**Happy coding and animating!** 🚀✨