# ESAP 🚀

**Easy GSAP** - A developer-friendly React/Next.js wrapper for GSAP animations

[![npm version](https://badge.fury.io/js/esap.svg)](https://badge.fury.io/js/esap)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why ESAP?

GSAP is incredibly powerful, but setting up complex animations can be verbose and intimidating. ESAP simplifies the most common animation patterns into easy-to-use React hooks and components.

**Before (GSAP):**
```jsx
useEffect(() => {
  const tl = gsap.timeline();
  tl.from('.hero-title', { y: 50, opacity: 0, duration: 1 })
    .from('.hero-subtitle', { y: 30, opacity: 0, duration: 0.8 }, '-=0.5')
    .from('.hero-button', { scale: 0, opacity: 0, duration: 0.6 }, '-=0.3');
}, []);
```

**After (ESAP):**
```jsx
const { ref } = useStaggerIn(['hero-title', 'hero-subtitle', 'hero-button']);
```

## Features

✅ **React/Next.js optimized** - Built specifically for React applications  
✅ **Zero config** - Works out of the box  
✅ **TypeScript support** - Full type safety  
✅ **Performance focused** - Optimized animations with proper cleanup  
✅ **Responsive** - Animations that work across all devices  
✅ **Accessible** - Respects user preferences for reduced motion  

## Installation

```bash
npm install esap gsap
# or
yarn add esap gsap
# or
pnpm add esap gsap
```

> **Note:** GSAP is a peer dependency and must be installed alongside ESAP.

## Quick Start

```jsx
import { useFadeIn, useSlideIn, useStaggerIn } from 'esap';

function MyComponent() {
  const fadeRef = useFadeIn();
  const slideRef = useSlideIn({ direction: 'left', distance: 100 });
  const staggerRef = useStaggerIn(['.item'], { stagger: 0.2 });

  return (
    <div>
      <h1 ref={fadeRef}>Fade in animation</h1>
      <p ref={slideRef}>Slide from left</p>
      <div ref={staggerRef}>
        <div className="item">Item 1</div>
        <div className="item">Item 2</div>
        <div className="item">Item 3</div>
      </div>
    </div>
  );
}
```

## Core Hooks

### `useFadeIn(options?)`
Simple fade-in animation for any element.

```jsx
const ref = useFadeIn({
  duration: 1,
  delay: 0.2,
  trigger: 'onMount', // 'onMount' | 'onScroll'
  threshold: 0.5 // for scroll trigger
});
```

### `useSlideIn(options?)`
Slide animations from any direction.

```jsx
const ref = useSlideIn({
  direction: 'up', // 'up' | 'down' | 'left' | 'right'
  distance: 50,
  duration: 0.8,
  ease: 'power2.out'
});
```

### `useStaggerIn(selectors, options?)`
Staggered animations for multiple elements.

```jsx
const ref = useStaggerIn(['.card', '.button'], {
  stagger: 0.1,
  duration: 0.6,
  direction: 'up'
});
```

### `useParallax(options?)`
Smooth parallax scrolling effects.

```jsx
const ref = useParallax({
  speed: 0.5, // 0 to 1
  direction: 'vertical' // 'vertical' | 'horizontal'
});
```

### `useRevealText(options?)`
Text reveal animations (typewriter, word-by-word, etc.).

```jsx
const ref = useRevealText({
  type: 'words', // 'chars' | 'words' | 'lines'
  stagger: 0.05,
  duration: 0.5
});
```

### `useMorphing(targets, options?)`
Smooth morphing between different states.

```jsx
const { ref, morph } = useMorphing({
  duration: 0.8,
  ease: 'power2.inOut'
});

// Usage
<button onClick={() => morph({ scale: 1.2, rotation: 45 })}>
  Transform
</button>
```

### `useScrollTrigger(animation, options?)`
Advanced scroll-triggered animations.

```jsx
const ref = useScrollTrigger(
  { y: 100, opacity: 0 }, // from state
  {
    to: { y: 0, opacity: 1 },
    start: 'top 80%',
    end: 'bottom 20%',
    scrub: true
  }
);
```

## Components

### `<AnimatedPresence>`
Handle enter/exit animations for conditional rendering.

```jsx
import { AnimatedPresence } from 'esap';

<AnimatedPresence>
  {isVisible && (
    <div>
      Content that animates in and out
    </div>
  )}
</AnimatedPresence>
```

### `<StaggerContainer>`
Automatically stagger child animations.

```jsx
import { StaggerContainer } from 'esap';

<StaggerContainer stagger={0.1} direction="up">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</StaggerContainer>
```

## Advanced Usage

### Creating Custom Animations

```jsx
import { useGSAP } from 'esap';

function CustomAnimation() {
  const { ref, timeline } = useGSAP(() => {
    return gsap.timeline()
      .to('.element', { rotation: 360, duration: 2 })
      .to('.element', { scale: 1.5, duration: 1 });
  });

  return <div ref={ref} className="element">Custom animation</div>;
}
```

### Performance Optimization

```jsx
// Batch animations for better performance
import { useBatchAnimation } from 'esap';

const { refs, trigger } = useBatchAnimation([
  { selector: '.card', animation: { y: 50, opacity: 0 } },
  { selector: '.button', animation: { scale: 0 } }
]);
```

## Configuration

### Global Configuration

```jsx
// pages/_app.js or app/layout.js
import { EsapProvider } from 'esap';

export default function App({ children }) {
  return (
    <EsapProvider
      config={{
        reducedMotion: true, // Respect user preferences
        defaultDuration: 0.8,
        defaultEase: 'power2.out'
      }}
    >
      {children}
    </EsapProvider>
  );
}
```

### Animation Presets

```jsx
import { presets } from 'esap';

// Use predefined animation combinations
const ref = useFadeIn(presets.gentle); // Slow, subtle animation
const ref2 = useSlideIn(presets.energetic); // Fast, bouncy animation
const ref3 = useStaggerIn(['.item'], presets.dramatic); // Bold, impactful
```

## Next.js Integration

### Server-Side Rendering Support

ESAP is fully compatible with Next.js SSR. No additional configuration needed!

```jsx
// Works out of the box in Next.js pages and app directory
import { useFadeIn } from 'esap';

export default function Page() {
  const ref = useFadeIn();
  return <h1 ref={ref}>SSR-friendly animation</h1>;
}
```

### Performance Optimization for Next.js

```jsx
// pages/_document.js - Preload GSAP for better performance
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js" as="script" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
```

## Examples

### Hero Section Animation

```jsx
import { useFadeIn, useSlideIn, useStaggerIn } from 'esap';

function HeroSection() {
  const titleRef = useFadeIn({ delay: 0.2 });
  const subtitleRef = useSlideIn({ direction: 'up', delay: 0.5 });
  const buttonsRef = useStaggerIn(['.btn'], { delay: 0.8, stagger: 0.1 });

  return (
    <section>
      <h1 ref={titleRef}>Welcome to Our Site</h1>
      <p ref={subtitleRef}>Creating amazing experiences</p>
      <div ref={buttonsRef}>
        <button className="btn">Get Started</button>
        <button className="btn">Learn More</button>
      </div>
    </section>
  );
}
```

### Card Grid with Scroll Animations

```jsx
import { useScrollTrigger } from 'esap';

function CardGrid() {
  const cardsRef = useScrollTrigger(
    { y: 100, opacity: 0, scale: 0.8 },
    {
      to: { y: 0, opacity: 1, scale: 1 },
      stagger: 0.1,
      start: 'top 80%'
    }
  );

  return (
    <div ref={cardsRef} className="grid grid-cols-3 gap-4">
      {cards.map(card => (
        <div key={card.id} className="card">
          {card.content}
        </div>
      ))}
    </div>
  );
}
```

## API Reference

### Hook Options

All hooks accept these common options:

```typescript
interface CommonOptions {
  duration?: number;          // Animation duration in seconds
  delay?: number;            // Delay before animation starts
  ease?: string;             // GSAP easing function
  trigger?: 'onMount' | 'onScroll'; // When to trigger animation
  threshold?: number;        // Intersection threshold for scroll trigger
  markers?: boolean;         // Show ScrollTrigger markers (dev mode)
  refresh?: boolean;         // Refresh ScrollTrigger on resize
}
```

### Animation Presets

```javascript
const presets = {
  gentle: { duration: 1.2, ease: 'power1.out' },
  energetic: { duration: 0.6, ease: 'back.out(1.7)' },
  dramatic: { duration: 1.5, ease: 'power3.inOut' },
  subtle: { duration: 2, ease: 'none' }
};
```

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- All modern mobile browsers

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/BALASANTHOSH01/esap.git
cd esap
npm install
npm run dev
```

### Testing

```bash
npm run test        # Run unit tests
npm run test:e2e    # Run end-to-end tests
npm run test:perf   # Run performance tests
```

## Roadmap

- ✅ React/Next.js support
- 🔄 Vue.js support
- 📋 Svelte support
- 📋 More animation presets
- 📋 Visual timeline editor
- 📋 Animation performance profiler

## FAQ

**Q: Do I need to install GSAP separately?**  
A: Yes, GSAP is a peer dependency. Install both `esap` and `gsap`.

**Q: Does this work with React Server Components?**  
A: ESAP hooks work in Client Components. For Server Components, use our `<AnimationWrapper>` component.

**Q: How does this affect bundle size?**  
A: ESAP adds ~8KB gzipped. It uses tree-shaking so you only bundle what you use.

**Q: Can I still use regular GSAP alongside ESAP?**  
A: Absolutely! ESAP is just a wrapper - you can mix and match as needed.

## License

MIT © BALASANTHOSH01

## Support

- 📚 [Documentation](https://esap-docs.vercel.app/)
- 🐛 [Report Issues](https://github.com/BALASANTHOSH01/esap/issues)
