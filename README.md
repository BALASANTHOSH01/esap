# ESAP 🚀

**Easy GSAP** - A developer-friendly React/Next.js wrapper for GSAP animations with advanced 3D and particle effects

[![npm version](https://badge.fury.io/js/esap.svg)](https://badge.fury.io/js/esap)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why ESAP?

GSAP is incredibly powerful, but setting up complex animations can be verbose and intimidating. ESAP simplifies the most common animation patterns into easy-to-use React hooks and components, while adding support for advanced 3D scenes, particle systems, and physics simulations.

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
✅ **3D Animations** - Three.js integration for complex 3D scenes  
✅ **Particle Systems** - Built-in particle effects and physics  
✅ **Path Morphing** - SVG path morphing capabilities  
✅ **Physics Engine** - Matter.js integration for realistic physics  

## Installation

```bash
npm install esap
# or
yarn add esap
# or
pnpm add esap
```

> **Note:** All dependencies (GSAP, Three.js, Matter.js) are bundled internally. No additional installations required!

## Quick Start

```jsx
import { useFadeIn, useSlideIn, useStaggerIn, use3DScene, useParticles } from 'esap';

function MyComponent() {
  const fadeRef = useFadeIn();
  const slideRef = useSlideIn({ direction: 'left', distance: 100 });
  const staggerRef = useStaggerIn(['.item'], { stagger: 0.2 });
  const sceneRef = use3DScene({ camera: { position: [0, 0, 5] } });
  const particlesRef = useParticles({ count: 100, type: 'stars' });

  return (
    <div>
      <h1 ref={fadeRef}>Fade in animation</h1>
      <p ref={slideRef}>Slide from left</p>
      <div ref={staggerRef}>
        <div className="item">Item 1</div>
        <div className="item">Item 2</div>
        <div className="item">Item 3</div>
      </div>
      <canvas ref={sceneRef} width={800} height={600} />
      <div ref={particlesRef} className="particles-container" />
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

## Advanced 3D Animations

### `use3DScene(options?)`
Create and manage Three.js scenes with GSAP integration.

```jsx
const { ref, scene, camera, renderer, animate } = use3DScene({
  camera: { 
    type: 'perspective', // 'perspective' | 'orthographic'
    position: [0, 0, 5],
    fov: 75
  },
  renderer: {
    antialias: true,
    alpha: true
  },
  controls: true // Enable orbit controls
});

// Add objects to scene
useEffect(() => {
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  
  // Animate with GSAP
  animate(cube.rotation, { y: Math.PI * 2, duration: 2, repeat: -1 });
}, [scene, animate]);
```

### `use3DModel(modelPath, options?)`
Load and animate 3D models.

```jsx
const { ref, model, animate } = use3DModel('/models/character.glb', {
  scale: [1, 1, 1],
  position: [0, 0, 0],
  autoRotate: false
});

// Animate model
const playAnimation = () => {
  animate(model.position, { y: 2, duration: 1, yoyo: true, repeat: 1 });
};
```

### `use3DParticles(options?)`
3D particle systems with physics.

```jsx
const { ref, particles, updateParticles } = use3DParticles({
  count: 1000,
  spread: 10,
  speed: { min: 0.1, max: 0.5 },
  size: { min: 0.01, max: 0.05 },
  color: '#ffffff',
  gravity: -0.001,
  turbulence: 0.1
});

// Custom particle behavior
useEffect(() => {
  const interval = setInterval(() => {
    updateParticles((particle) => ({
      ...particle,
      velocity: {
        x: particle.velocity.x + (Math.random() - 0.5) * 0.01,
        y: particle.velocity.y + (Math.random() - 0.5) * 0.01,
        z: particle.velocity.z + (Math.random() - 0.5) * 0.01
      }
    }));
  }, 16);
  
  return () => clearInterval(interval);
}, [updateParticles]);
```

## 2D Particle Systems

### `useParticles(options?)`
2D canvas-based particle systems.

```jsx
const { ref, emit, burst, clear } = useParticles({
  count: 100,
  type: 'stars', // 'stars' | 'snow' | 'fire' | 'confetti' | 'bubbles'
  speed: { min: 1, max: 3 },
  size: { min: 2, max: 6 },
  colors: ['#ff0000', '#00ff00', '#0000ff'],
  gravity: 0.1,
  friction: 0.98,
  fadeOut: true
});

// Emit particles on click
const handleClick = (e) => {
  emit({
    x: e.clientX,
    y: e.clientY,
    count: 20
  });
};

// Create burst effect
const createBurst = () => {
  burst({
    x: 400,
    y: 300,
    count: 50,
    force: 5
  });
};
```

### `useFireworks(options?)`
Fireworks particle effect system.

```jsx
const { ref, launch, autoLaunch } = useFireworks({
  colors: ['#ff1744', '#ff9800', '#ffc107', '#4caf50', '#2196f3'],
  trailLength: 10,
  explosionSize: { min: 50, max: 100 },
  particleCount: { min: 30, max: 60 },
  gravity: 0.02
});

// Launch firework
const launchFirework = () => {
  launch({
    x: Math.random() * window.innerWidth,
    y: window.innerHeight,
    targetY: 100 + Math.random() * 200
  });
};

// Auto launch every 2 seconds
useEffect(() => {
  autoLaunch({ interval: 2000, random: true });
}, [autoLaunch]);
```

## Physics Engine Integration

### `usePhysicsWorld(options?)`
Create a Matter.js physics world.

```jsx
const { ref, world, engine, addBody, removeBody } = usePhysicsWorld({
  gravity: { x: 0, y: 1 },
  enableSleeping: true,
  bounds: { width: 800, height: 600 }
});

// Add physics bodies
useEffect(() => {
  const box = Matter.Bodies.rectangle(400, 200, 80, 80);
  const ground = Matter.Bodies.rectangle(400, 580, 810, 40, { isStatic: true });
  
  addBody([box, ground]);
  
  return () => {
    removeBody([box, ground]);
  };
}, [addBody, removeBody]);
```

### `usePhysicsBody(options?)`
Create individual physics bodies with GSAP integration.

```jsx
const { ref, body, applyForce, setPosition } = usePhysicsBody({
  type: 'rectangle', // 'rectangle' | 'circle' | 'polygon'
  size: [50, 50],
  position: [100, 100],
  options: {
    restitution: 0.8,
    friction: 0.001,
    density: 0.001
  }
});

// Apply forces
const jump = () => {
  applyForce({ x: 0, y: -0.1 });
};

// Animate to position
const moveToPosition = (x, y) => {
  gsap.to(body.position, {
    x,
    y,
    duration: 1,
    onUpdate: () => setPosition(body.position.x, body.position.y)
  });
};
```

## Advanced Audio-Reactive Animations

### `useAudioReactive(audioSrc, options?)`
Create animations that respond to audio frequency data.

```jsx
const { ref, audioData, controls } = useAudioReactive('/music.mp3', {
  fftSize: 256,
  frequencyBands: {
    bass: { min: 20, max: 250 },
    mid: { min: 250, max: 4000 },
    treble: { min: 4000, max: 20000 }
  },
  sensitivity: 1.2,
  smoothing: 0.8
});

// React to different frequency ranges
useEffect(() => {
  if (audioData.bass > 0.7) {
    // Trigger bass-heavy animation
    controls.trigger('bassHit');
  }
}, [audioData.bass]);

return (
  <div ref={ref} className="audio-visualizer">
    <div 
      style={{ 
        transform: `scale(${1 + audioData.mid * 0.5})`,
        backgroundColor: `hsl(${audioData.treble * 360}, 70%, 50%)`
      }}
    />
  </div>
);
```

### `useBeatDetection(options?)`
Detect beats and musical events in audio.

```jsx
const { onBeat, bpm, confidence } = useBeatDetection({
  sensitivity: 0.8,
  minBpm: 60,
  maxBpm: 180,
  learningRate: 0.1
});

// Trigger animations on beat
onBeat((beatData) => {
  if (beatData.isKick) {
    particlesRef.current.burst({ count: 50, force: 2 });
  }
  if (beatData.isSnare) {
    cameraRef.current.shake({ intensity: 0.2, duration: 0.1 });
  }
});
```

### `useAudioVisualizer(type, options?)`
Pre-built audio visualization components.

```jsx
const visualizerRef = useAudioVisualizer('spectrum', {
  type: '3D', // '2D' | '3D' | 'particles' | 'waveform'
  bars: 64,
  colorScheme: 'rainbow', // 'rainbow' | 'monochrome' | 'neon'
  reactivity: {
    scale: { min: 0.1, max: 2 },
    rotation: true,
    color: true,
    particles: { emit: true, count: 100 }
  }
});
```

## Advanced Text Animations

### `useTextScramble(text, options?)`
Create scrambling text effects with multiple algorithms.

```jsx
const { ref, scramble, reveal } = useTextScramble('HELLO WORLD', {
  characters: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  duration: 2,
  revealDelay: 0.5,
  algorithm: 'matrix', // 'random' | 'matrix' | 'binary' | 'glitch'
  effects: {
    cursor: { show: true, blink: true, style: '_' },
    sound: { type: 'typewriter', volume: 0.3 },
    glitch: { intensity: 0.2, frequency: 0.1 }
  }
});

// Trigger scramble animation
const handleClick = () => {
  scramble('NEW TEXT', { duration: 1.5 });
};
```

### `useTextSplit(options?)`
Advanced text splitting with semantic awareness.

```jsx
const { ref, animate } = useTextSplit({
  splitBy: ['chars', 'words', 'lines'],
  preserveSpacing: true,
  respectPunctuation: true,
  semanticGrouping: true, // Group by meaning
  animations: {
    chars: { 
      type: 'bounceIn', 
      stagger: 0.05,
      ease: 'elastic.out(1, 0.3)' 
    },
    words: { 
      type: 'slideUp', 
      stagger: 0.1,
      highlight: { color: '#ff6b35', duration: 0.3 }
    },
    lines: { 
      type: 'fadeIn', 
      stagger: 0.2,
      transform: { y: 30, opacity: 0 }
    }
  }
});

// Animate specific parts
const highlightKeywords = () => {
  animate.words(word => word.isKeyword, {
    scale: 1.2,
    color: '#ff0000',
    duration: 0.5
  });
};
```

### `useTypewriter(text, options?)`
Realistic typewriter effects with sound and timing variations.

```jsx
const { ref, type, erase } = useTypewriter({
  speed: { min: 50, max: 150 }, // ms between characters
  mistakes: { 
    probability: 0.05, 
    correction: true,
    humanDelay: 500
  },
  cursor: {
    show: true,
    blink: { rate: 530, pauseOnType: true }
  },
  sound: {
    keystroke: '/sounds/typewriter-key.mp3',
    bell: '/sounds/typewriter-bell.mp3',
    volume: 0.4
  }
});

// Type with realistic human behavior
const startTyping = () => {
  type('Hello, I am typing with realistic human behavior!', {
    onComplete: () => {
      setTimeout(() => erase(20), 2000); // Erase 20 chars after 2s
    }
  });
};
```

## Layout Animations (FLIP Technique)

### `useLayoutAnimation(options?)`
Smooth layout transitions using FLIP (First, Last, Invert, Play).

```jsx
const { ref, measure } = useLayoutAnimation({
  duration: 0.6,
  ease: 'power2.out',
  animateOpacity: true,
  animateTransform: true,
  stagger: 0.1 // For multiple elements
});

// Trigger layout change
const toggleLayout = () => {
  setIsGridView(!isGridView);
  // ESAP automatically handles the smooth transition
};

return (
  <div ref={ref} className={isGridView ? 'grid' : 'list'}>
    {items.map(item => <div key={item.id}>{item.content}</div>)}
  </div>
);
```

### `useListAnimation(options?)`
Specialized animations for dynamic lists.

```jsx
const { ref, containerRef } = useListAnimation({
  add: {
    animation: 'slideFromRight',
    duration: 0.4,
    ease: 'back.out(1.7)'
  },
  remove: {
    animation: 'scaleDown',
    duration: 0.3,
    ease: 'power2.in'
  },
  move: {
    duration: 0.5,
    ease: 'power2.inOut'
  },
  layout: {
    stagger: 0.05,
    preserveScrollPosition: true
  }
});

// List automatically animates on changes
const [items, setItems] = useState([]);

const addItem = () => {
  setItems(prev => [...prev, { id: Date.now(), text: 'New Item' }]);
};
```

### `useSharedElementTransition(id, options?)`
Smooth transitions between different views/pages.

```jsx
// Page 1
const { ref: thumbnailRef } = useSharedElementTransition('product-image', {
  type: 'source',
  duration: 0.8
});

// Page 2  
const { ref: fullImageRef } = useSharedElementTransition('product-image', {
  type: 'destination',
  duration: 0.8,
  scale: { from: 0.3, to: 1 },
  position: { from: 'thumbnail-position' }
});
```

## Touch & Gesture Support

### `useDragAnimation(options?)`
Drag and drop with physics and constraints.

```jsx
const { ref, isDragging, position } = useDragAnimation({
  bounds: { left: -100, right: 100, top: -50, bottom: 50 },
  elastic: true,
  momentum: {
    enabled: true,
    friction: 0.8,
    maxVelocity: 2000
  },
  snap: {
    enabled: true,
    points: [[0, 0], [100, 0], [-100, 0]], // Snap to these positions
    threshold: 50
  },
  constraints: {
    horizontal: false, // Allow vertical movement
    vertical: true     // Restrict horizontal
  }
});

// React to drag events
useEffect(() => {
  if (isDragging) {
    // Show drag indicators
  }
}, [isDragging]);
```

### `useSwipeGestures(options?)`
Multi-directional swipe detection with customizable thresholds.

```jsx
const { ref } = useSwipeGestures({
  onSwipeLeft: (info) => nextSlide(info.velocity),
  onSwipeRight: (info) => prevSlide(info.velocity),
  onSwipeUp: (info) => openDetails(),
  onSwipeDown: (info) => closeDetails(),
  threshold: {
    distance: 50,    // Minimum swipe distance
    velocity: 0.3,   // Minimum swipe speed
    time: 500        // Maximum swipe duration
  },
  preventDefault: true,
  continuous: false // One swipe per gesture
});
```

### `usePinchZoom(options?)`
Pinch-to-zoom with smooth scaling and boundaries.

```jsx
const { ref, scale, reset } = usePinchZoom({
  minScale: 0.5,
  maxScale: 3,
  centerOnPinch: true,
  smoothReturn: true,
  wheel: {
    enabled: true,
    sensitivity: 0.01,
    preventDefault: true
  }
});

// Programmatic control
const zoomTo = (targetScale, centerX, centerY) => {
  reset({ scale: targetScale, x: centerX, y: centerY, duration: 0.5 });
};
```

### `useMultiTouch(options?)`
Advanced multi-touch gesture recognition.

```jsx
const { ref } = useMultiTouch({
  maxTouches: 5,
  gestures: {
    tap: { fingers: 1, onTap: handleTap },
    doubleTap: { fingers: 1, onDoubleTap: handleDoubleTap },
    longPress: { fingers: 1, duration: 500, onLongPress: handleLongPress },
    twoFingerTap: { fingers: 2, onTap: handleTwoFingerTap },
    threeFingerSwipe: { fingers: 3, onSwipe: handleThreeFingerSwipe }
  },
  preventDefault: true,
  stopPropagation: false
});
```

## AI-Powered Animation Suggestions

### `useAIAnimation(prompt, options?)`
Generate animations using AI based on natural language descriptions.

```jsx
const { ref, suggestions, apply } = useAIAnimation('Make this button feel premium and luxurious', {
  context: {
    element: 'button',
    brand: 'luxury',
    audience: 'millennials',
    device: 'mobile'
  },
  learning: {
    enabled: true,
    userFeedback: true,
    contextAware: true
  },
  options: {
    duration: { preferred: 0.6, range: [0.3, 1.2] },
    easing: { style: 'smooth', energy: 'medium' },
    effects: ['scale', 'color', 'shadow', 'particles']
  }
});

// AI provides multiple suggestions
suggestions.forEach((suggestion, index) => {
  console.log(`Option ${index + 1}:`, suggestion.description);
  console.log('Confidence:', suggestion.confidence);
  console.log('Effects:', suggestion.effects);
});

// Apply AI suggestion
const applyAISuggestion = (index) => {
  apply(suggestions[index], {
    onComplete: () => {
      // Provide feedback to improve AI
      suggestions[index].addFeedback('positive');
    }
  });
};
```

### `useAnimationMood(mood, options?)`
Apply emotion-based animation styles.

```jsx
const { ref, setMood } = useAnimationMood('energetic', {
  moods: {
    calm: { duration: 'slow', easing: 'gentle', amplitude: 'subtle' },
    energetic: { duration: 'fast', easing: 'bouncy', amplitude: 'high' },
    elegant: { duration: 'medium', easing: 'smooth', amplitude: 'refined' },
    playful: { duration: 'varied', easing: 'elastic', amplitude: 'fun' }
  },
  adaptToContent: true,
  userPreferences: true
});

// Change animation mood dynamically
const handleMoodChange = (newMood) => {
  setMood(newMood, { transition: 1.2 });
};
```

### `useSmartStagger(elements, options?)`
AI-optimized stagger timing based on visual hierarchy.

```jsx
const { ref } = useSmartStagger('.card', {
  analysis: {
    visualHierarchy: true,    // Analyze visual importance
    readingPattern: 'Z',      // 'Z' | 'F' | 'left-to-right' | 'top-to-bottom'
    semanticGrouping: true,   // Group related elements
    userAttention: true       // Eye-tracking optimization
  },
  optimization: {
    cognitiveLoad: 'medium',  // Balance between impact and overwhelm
    accessibilityFirst: true,
    performanceAware: true
  }
});
```

### `usePathMorph(paths, options?)`
Smooth morphing between SVG paths.

```jsx
const { ref, morphTo, morphToIndex } = usePathMorph([
  'M 0,0 L 100,0 L 100,100 L 0,100 Z', // Square
  'M 50,0 L 100,50 L 50,100 L 0,50 Z',  // Diamond
  'M 50,0 A 50,50 0 1,1 49,1 Z'          // Circle
], {
  duration: 1,
  ease: 'power2.inOut'
});

// Morph to specific path
const handleShapeChange = (index) => {
  morphToIndex(index);
};

// Morph to custom path
const morphToCustom = () => {
  morphTo('M 25,25 L 75,25 L 75,75 L 25,75 Z');
};

return (
  <svg width="100" height="100">
    <path ref={ref} fill="blue" />
  </svg>
);
```

### `useMorphingIcon(icons, options?)`
Morph between icon paths.

```jsx
const { ref, morphTo } = useMorphingIcon({
  play: 'M8 5v14l11-7z',
  pause: 'M6 19h4V5H6v14zm8-14v14h4V5h-4z',
  stop: 'M6 6h12v12H6z'
}, {
  size: 24,
  duration: 0.3
});

const [currentIcon, setCurrentIcon] = useState('play');

const toggleIcon = () => {
  const nextIcon = currentIcon === 'play' ? 'pause' : 'play';
  morphTo(nextIcon);
  setCurrentIcon(nextIcon);
};
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

### `<Scene3D>`
Declarative 3D scene component.

```jsx
import { Scene3D, Mesh3D, Camera3D, Light3D } from 'esap';

<Scene3D width={800} height={600}>
  <Camera3D position={[0, 0, 5]} />
  <Light3D type="ambient" intensity={0.5} />
  <Light3D type="directional" position={[1, 1, 1]} intensity={1} />
  <Mesh3D
    geometry="box"
    material={{ color: '#ff0000' }}
    position={[0, 0, 0]}
    animate={{ rotation: { y: Math.PI * 2 } }}
    duration={2}
    repeat={-1}
  />
</Scene3D>
```

### `<ParticleSystem>`
Declarative particle system component.

```jsx
import { ParticleSystem } from 'esap';

<ParticleSystem
  type="fire"
  count={200}
  emissionRate={10}
  position={{ x: 400, y: 500 }}
  spread={45}
  speed={{ min: 2, max: 5 }}
  size={{ min: 3, max: 8 }}
  colors={['#ff4444', '#ff8800', '#ffaa00']}
  gravity={-0.1}
  fadeOut={true}
/>
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

### Complex 3D Scene

```jsx
import { use3DScene, use3DModel, use3DParticles } from 'esap';

function Complex3DScene() {
  const { ref, scene, animate } = use3DScene({
    camera: { position: [0, 5, 10] },
    controls: true
  });
  
  const { model: spaceship } = use3DModel('/models/spaceship.glb');
  const { particles } = use3DParticles({ 
    count: 1000, 
    type: 'stars',
    spread: 100 
  });

  useEffect(() => {
    if (spaceship) {
      scene.add(spaceship);
      // Animate spaceship
      animate(spaceship.rotation, { 
        y: Math.PI * 2, 
        duration: 10, 
        repeat: -1, 
        ease: 'none' 
      });
      animate(spaceship.position, { 
        y: 2, 
        duration: 3, 
        yoyo: true, 
        repeat: -1, 
        ease: 'power2.inOut' 
      });
    }
  }, [spaceship, scene, animate]);

  return <canvas ref={ref} width={800} height={600} />;
}
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
        defaultEase: 'power2.out',
        physics: {
          enabled: true,
          gravity: { x: 0, y: 1 }
        },
        particles: {
          maxCount: 5000,
          pooling: true
        },
        three: {
          antialias: true,
          shadowMap: true
        }
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
const ref4 = use3DScene(presets.cinematic); // Cinematic camera movement
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
// pages/_document.js - Preload dependencies for better performance
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js" as="script" />
          <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" as="script" />
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

### Interactive 3D Product Showcase

```jsx
import { use3DScene, use3DModel, useParticles } from 'esap';

function ProductShowcase() {
  const { ref, scene, animate } = use3DScene({
    camera: { position: [0, 0, 5] },
    controls: true
  });
  
  const { model: product } = use3DModel('/models/product.glb', {
    scale: [2, 2, 2]
  });
  
  const particlesRef = useParticles({
    type: 'sparkles',
    count: 50,
    colors: ['#gold', '#silver']
  });

  const highlightProduct = () => {
    if (product) {
      animate(product.rotation, { y: Math.PI * 2, duration: 2 });
      animate(product.scale, { 
        x: 2.5, y: 2.5, z: 2.5, 
        duration: 0.5, 
        yoyo: true, 
        repeat: 1 
      });
    }
  };

  return (
    <div>
      <canvas ref={ref} width={800} height={600} onClick={highlightProduct} />
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none" />
    </div>
  );
}
```

### Physics-Based Game Component

```jsx
import { usePhysicsWorld, usePhysicsBody, useKeyboard } from 'esap';

function PhysicsGame() {
  const { ref, addBody } = usePhysicsWorld({
    gravity: { x: 0, y: 1 }
  });
  
  const { body: player, applyForce } = usePhysicsBody({
    type: 'circle',
    size: [30],
    position: [100, 100],
    options: { restitution: 0.6 }
  });

  const keys = useKeyboard(['ArrowLeft', 'ArrowRight', 'Space']);

  useEffect(() => {
    if (keys.ArrowLeft) applyForce({ x: -0.01, y: 0 });
    if (keys.ArrowRight) applyForce({ x: 0.01, y: 0 });
    if (keys.Space) applyForce({ x: 0, y: -0.05 });
  }, [keys, applyForce]);

  return (
    <div>
      <canvas ref={ref} width={800} height={600} />
      <div className="controls">
        Use arrow keys to move, space to jump
      </div>
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

interface Physics3DOptions {
  gravity?: { x: number; y: number; z: number };
  friction?: number;
  restitution?: number;
  density?: number;
}

interface ParticleOptions {
  count?: number;
  type?: 'stars' | 'snow' | 'fire' | 'confetti' | 'bubbles' | 'smoke';
  speed?: { min: number; max: number };
  size?: { min: number; max: number };
  colors?: string[];
  gravity?: number;
  friction?: number;
  fadeOut?: boolean;
  lifetime?: { min: number; max: number };
}
```

### Animation Presets

```javascript
const presets = {
  gentle: { duration: 1.2, ease: 'power1.out' },
  energetic: { duration: 0.6, ease: 'back.out(1.7)' },
  dramatic: { duration: 1.5, ease: 'power3.inOut' },
  subtle: { duration: 2, ease: 'none' },
  cinematic: { 
    camera: { 
      movement: 'smooth',
      fov: { min: 45, max: 75 },
      position: { smooth: true }
    }
  }
};
```

## Performance Guidelines

### Optimization Tips

1. **Use Object Pooling**: Enable particle pooling for better memory management
```jsx
const particlesRef = useParticles({ 
  pooling: true, 
  maxCount: 1000 
});
```

2. **Limit Active Particles**: Cap concurrent particle systems
```jsx
const config = {
  particles: {
    maxSystems: 5,
    maxParticlesPerSystem: 500
  }
};
```

3. **Use LOD for 3D Models**: Implement level-of-detail for complex models
```jsx
const { model } = use3DModel('/models/high-poly.glb', {
  lod: [
    { distance: 10, model: '/models/high-poly.glb' },
    { distance: 50, model: '/models/med-poly.glb' },
    { distance: 100, model: '/models/low-poly.glb' }
  ]
});
```

4. **Batch Physics Updates**: Group physics calculations
```jsx
const { world } = usePhysicsWorld({
  timing: {
    timeScale: 1,
    timestep: 1000 / 60
  }
});
```

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- All modern mobile browsers
- WebGL support required for 3D features

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
npm run test:3d     # Run 3D rendering tests
npm run test:physics # Run physics simulation tests
```

## Roadmap

- ✅ React/Next.js support
- ✅ 3D animations with Three.js
- ✅ Physics engine integration
- ✅ Particle systems
- ✅ Path morphing
- 🔄 Vue.js support
- 📋 Svelte support
- 📋 WebXR/VR support
- 📋 Audio-reactive animations
- 📋 Visual timeline editor
- 📋 Animation performance profiler
- 📋 Blender integration

## FAQ

**Q: Do I need to install GSAP, Three.js, and Matter.js separately?**  
A: No! All dependencies are bundled with ESAP. Just install `esap` and you're ready to go.

**Q: Does this work with React Server Components?**  
A: ESAP hooks work in Client Components. For Server Components, use our wrapper components.

**Q: How does this affect bundle size?**  
A: ESAP core adds ~12KB gzipped. 3D features add ~15KB, physics ~8KB. Tree-shaking ensures you only bundle what you use.

**Q: Can I still use regular GSAP/Three.js alongside ESAP?**  
A: Absolutely! ESAP is just a wrapper - you can mix and match as needed.

**Q: Are there performance considerations for mobile?**  
A: Yes, ESAP automatically reduces particle counts and disables complex effects on low-end devices.

**Q: How do I handle memory management with 3D scenes?**  
A: ESAP automatically disposes of geometries, materials, and textures. Use the cleanup functions provided by hooks.

## License

MIT © BALASANTHOSH01

## Support

- 📚 [Documentation](https://esap-docs.vercel.app/)
- 🐛 [Report Issues](https://github.com/BALASANTHOSH01/esap/issues)
- 🎮 [3D Examples](https://esap-examples.vercel.app/3d)
- 🎆 [Particle Examples](https://esap-examples.vercel.app/particles)
- ⚡ [Physics Examples](https://esap-examples.vercel.app/physics)