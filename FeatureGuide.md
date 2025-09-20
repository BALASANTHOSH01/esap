# ESAP Complete Features Guide 🚀

## 🎯 Core Animation Hooks

### `useFadeIn(options?)`
**Use Case:** Simple opacity transitions for elements appearing on screen
**When to Use:** Page loads, modal opens, content reveals
**Properties:**
- `duration: number` - Animation duration (default: 1)
- `delay: number` - Start delay (default: 0)
- `trigger: 'onMount' | 'onScroll'` - Trigger type
- `threshold: number` - Scroll threshold (0-1)
- `ease: string` - GSAP easing function

```jsx
const ref = useFadeIn({ duration: 1.2, delay: 0.3, trigger: 'onScroll' });
```

### `useSlideIn(options?)`
**Use Case:** Directional entrance animations
**When to Use:** Cards, navigation, hero elements
**Properties:**
- `direction: 'up' | 'down' | 'left' | 'right'` - Slide direction
- `distance: number` - Slide distance in pixels (default: 50)
- `duration: number` - Animation duration
- `ease: string` - Easing function
- `trigger: string` - Trigger type

```jsx
const ref = useSlideIn({ 
  direction: 'left', 
  distance: 100, 
  ease: 'back.out(1.7)' 
});
```

### `useStaggerIn(selectors, options?)`
**Use Case:** Sequential animations for multiple elements
**When to Use:** Lists, grids, menu items
**Properties:**
- `selectors: string[]` - CSS selectors for target elements
- `stagger: number` - Delay between elements (default: 0.1)
- `duration: number` - Individual animation duration
- `direction: string` - Animation direction
- `from: object` - Starting state

```jsx
const ref = useStaggerIn(['.card', '.button'], {
  stagger: 0.15,
  direction: 'up',
  duration: 0.8
});
```

### `useParallax(options?)`
**Use Case:** Depth-based scrolling effects
**When to Use:** Background images, layered content
**Properties:**
- `speed: number` - Parallax speed (0-1, default: 0.5)
- `direction: 'vertical' | 'horizontal'` - Movement direction
- `trigger: string` - Scroll trigger element
- `start: string` - Start position
- `end: string` - End position

```jsx
const ref = useParallax({ 
  speed: 0.3, 
  direction: 'vertical' 
});
```

### `useRevealText(options?)`
**Use Case:** Text appearance animations
**When to Use:** Headlines, quotes, announcements
**Properties:**
- `type: 'chars' | 'words' | 'lines'` - Split type
- `stagger: number` - Delay between text units
- `duration: number` - Individual animation duration
- `from: object` - Starting animation state
- `ease: string` - Animation easing

```jsx
const ref = useRevealText({
  type: 'words',
  stagger: 0.08,
  duration: 0.6
});
```

### `useMorphing(targets, options?)`
**Use Case:** Shape and property transitions
**When to Use:** Interactive elements, state changes
**Properties:**
- `targets: object[]` - Animation target states
- `duration: number` - Morph duration
- `ease: string` - Transition easing
- `autoPlay: boolean` - Start automatically

```jsx
const { ref, morph } = useMorphing({
  duration: 1.2,
  ease: 'elastic.out(1, 0.3)'
});
```

### `useScrollTrigger(animation, options?)`
**Use Case:** Scroll-based animations
**When to Use:** Page sections, progress indicators
**Properties:**
- `animation: object` - From animation state
- `to: object` - Target animation state
- `start: string` - Scroll start position
- `end: string` - Scroll end position
- `scrub: boolean` - Link to scroll position
- `pin: boolean` - Pin element during animation

```jsx
const ref = useScrollTrigger(
  { y: 100, opacity: 0 },
  { 
    to: { y: 0, opacity: 1 },
    start: 'top 80%',
    scrub: true 
  }
);
```

---

## 🎮 Advanced 3D Features

### `use3DScene(options?)`
**Use Case:** 3D environments and interactive experiences
**When to Use:** Product showcases, games, visualizations
**Properties:**
- `camera.type: 'perspective' | 'orthographic'` - Camera projection
- `camera.position: [x, y, z]` - Camera position
- `camera.fov: number` - Field of view
- `renderer.antialias: boolean` - Anti-aliasing
- `renderer.alpha: boolean` - Transparent background
- `controls: boolean` - Orbit controls
- `shadows: boolean` - Shadow rendering

```jsx
const { ref, scene, camera, renderer, animate } = use3DScene({
  camera: { position: [0, 5, 10], fov: 60 },
  renderer: { antialias: true, alpha: true },
  controls: true,
  shadows: true
});
```

### `use3DModel(modelPath, options?)`
**Use Case:** 3D model loading and animation
**When to Use:** Product displays, characters, architecture
**Properties:**
- `modelPath: string` - Path to 3D model file
- `scale: [x, y, z]` - Model scale
- `position: [x, y, z]` - Model position
- `rotation: [x, y, z]` - Model rotation
- `autoRotate: boolean` - Continuous rotation
- `animations: string[]` - Available animations
- `lod: object[]` - Level of detail settings

```jsx
const { ref, model, animate, playAnimation } = use3DModel('/models/car.glb', {
  scale: [2, 2, 2],
  position: [0, -1, 0],
  autoRotate: false
});
```

### `use3DParticles(options?)`
**Use Case:** 3D particle effects and atmospheres
**When to Use:** Weather, magic effects, backgrounds
**Properties:**
- `count: number` - Particle count (default: 1000)
- `spread: number` - Distribution area
- `speed: {min, max}` - Velocity range
- `size: {min, max}` - Size range
- `color: string | string[]` - Particle colors
- `gravity: number` - Gravity force
- `turbulence: number` - Random movement
- `lifetime: {min, max}` - Particle lifespan

```jsx
const { ref, particles, updateParticles } = use3DParticles({
  count: 2000,
  spread: 15,
  speed: { min: 0.1, max: 0.8 },
  color: ['#ffffff', '#87ceeb'],
  gravity: -0.002
});
```

---

## ✨ 2D Particle Systems

### `useParticles(options?)`
**Use Case:** 2D canvas-based effects
**When to Use:** Celebrations, ambient effects, interactions
**Properties:**
- `count: number` - Particle count
- `type: 'stars' | 'snow' | 'fire' | 'confetti' | 'bubbles'` - Particle type
- `speed: {min, max}` - Movement speed
- `size: {min, max}` - Particle size
- `colors: string[]` - Color palette
- `gravity: number` - Downward force
- `friction: number` - Air resistance (0-1)
- `fadeOut: boolean` - Fade particles over time
- `pooling: boolean` - Memory optimization

```jsx
const { ref, emit, burst, clear } = useParticles({
  count: 200,
  type: 'confetti',
  colors: ['#ff6b6b', '#4ecdc4', '#45b7d1'],
  gravity: 0.05,
  fadeOut: true
});
```

### `useFireworks(options?)`
**Use Case:** Celebration and event effects
**When to Use:** Success states, holidays, achievements
**Properties:**
- `colors: string[]` - Firework colors
- `trailLength: number` - Rocket trail length
- `explosionSize: {min, max}` - Blast radius
- `particleCount: {min, max}` - Particles per explosion
- `gravity: number` - Physics gravity
- `autoLaunch: object` - Automatic launching
- `sounds: object` - Audio effects

```jsx
const { ref, launch, autoLaunch } = useFireworks({
  colors: ['#ff1744', '#ff9800', '#4caf50'],
  explosionSize: { min: 60, max: 120 },
  particleCount: { min: 40, max: 80 }
});
```

---

## ⚡ Physics Engine

### `usePhysicsWorld(options?)`
**Use Case:** Realistic physics simulations
**When to Use:** Games, interactive demos, educational content
**Properties:**
- `gravity: {x, y}` - World gravity
- `enableSleeping: boolean` - Performance optimization
- `bounds: {width, height}` - World boundaries
- `timing.timeScale: number` - Simulation speed
- `timing.timestep: number` - Update frequency
- `constraintIterations: number` - Physics accuracy

```jsx
const { ref, world, engine, addBody, removeBody } = usePhysicsWorld({
  gravity: { x: 0, y: 1.2 },
  enableSleeping: true,
  bounds: { width: 1200, height: 800 }
});
```

### `usePhysicsBody(options?)`
**Use Case:** Individual physics objects
**When to Use:** Interactive elements, game objects
**Properties:**
- `type: 'rectangle' | 'circle' | 'polygon'` - Body shape
- `size: number[]` - Dimensions
- `position: [x, y]` - Initial position
- `options.restitution: number` - Bounciness (0-1)
- `options.friction: number` - Surface friction
- `options.density: number` - Mass density
- `options.isStatic: boolean` - Fixed position

```jsx
const { ref, body, applyForce, setPosition } = usePhysicsBody({
  type: 'circle',
  size: [40],
  position: [200, 100],
  options: {
    restitution: 0.9,
    friction: 0.1,
    density: 0.002
  }
});
```

---

## 🎵 Audio-Reactive Features

### `useAudioReactive(audioSrc, options?)`
**Use Case:** Music visualizations and responsive UIs
**When to Use:** Music apps, ambient experiences, live events
**Properties:**
- `audioSrc: string` - Audio file path
- `fftSize: number` - Frequency analysis resolution
- `frequencyBands: object` - Custom frequency ranges
- `sensitivity: number` - Response sensitivity
- `smoothing: number` - Data smoothing (0-1)
- `autoPlay: boolean` - Start automatically

```jsx
const { ref, audioData, controls } = useAudioReactive('/music.mp3', {
  fftSize: 512,
  frequencyBands: {
    bass: { min: 20, max: 250 },
    mid: { min: 250, max: 4000 },
    treble: { min: 4000, max: 20000 }
  },
  sensitivity: 1.5
});
```

### `useBeatDetection(options?)`
**Use Case:** Rhythm-based animations
**When to Use:** Dance games, music videos, DJ apps
**Properties:**
- `sensitivity: number` - Beat detection threshold
- `minBpm: number` - Minimum BPM range
- `maxBpm: number` - Maximum BPM range
- `learningRate: number` - Adaptive learning speed
- `bufferSize: number` - Analysis buffer size

```jsx
const { onBeat, bpm, confidence } = useBeatDetection({
  sensitivity: 0.75,
  minBpm: 80,
  maxBpm: 160,
  learningRate: 0.08
});
```

### `useAudioVisualizer(type, options?)`
**Use Case:** Pre-built audio visualization components
**When to Use:** Music players, live streams, audio analysis
**Properties:**
- `type: '2D' | '3D' | 'particles' | 'waveform'` - Visualization type
- `bars: number` - Number of frequency bars
- `colorScheme: 'rainbow' | 'monochrome' | 'neon'` - Color theme
- `reactivity.scale: {min, max}` - Scale response range
- `reactivity.rotation: boolean` - Rotation effects
- `reactivity.particles: object` - Particle integration

```jsx
const visualizerRef = useAudioVisualizer('spectrum', {
  type: '3D',
  bars: 128,
  colorScheme: 'neon',
  reactivity: {
    scale: { min: 0.2, max: 3 },
    rotation: true,
    particles: { emit: true, count: 200 }
  }
});
```

---

## 📝 Advanced Text Animations

### `useTextScramble(text, options?)`
**Use Case:** Futuristic text reveals and transitions
**When to Use:** Tech interfaces, loading screens, cyberpunk themes
**Properties:**
- `text: string` - Target text
- `characters: string` - Scramble character set
- `duration: number` - Scramble duration
- `revealDelay: number` - Character reveal timing
- `algorithm: 'random' | 'matrix' | 'binary' | 'glitch'` - Scramble method
- `effects.cursor: object` - Cursor appearance
- `effects.sound: object` - Audio feedback
- `effects.glitch: object` - Glitch intensity

```jsx
const { ref, scramble, reveal } = useTextScramble('HELLO WORLD', {
  algorithm: 'matrix',
  duration: 2.5,
  effects: {
    cursor: { show: true, blink: true, style: '█' },
    glitch: { intensity: 0.3, frequency: 0.15 }
  }
});
```

### `useTextSplit(options?)`
**Use Case:** Granular text animation control
**When to Use:** Typography animations, reading effects
**Properties:**
- `splitBy: string[]` - Split methods
- `preserveSpacing: boolean` - Maintain text spacing
- `respectPunctuation: boolean` - Handle punctuation correctly
- `semanticGrouping: boolean` - Group by meaning
- `animations: object` - Per-split-type animations
- `highlight: object` - Text highlighting options

```jsx
const { ref, animate } = useTextSplit({
  splitBy: ['chars', 'words'],
  semanticGrouping: true,
  animations: {
    chars: { 
      type: 'bounceIn', 
      stagger: 0.03,
      ease: 'elastic.out(1, 0.5)' 
    },
    words: { 
      type: 'slideUp',
      highlight: { color: '#ff6b35', duration: 0.4 }
    }
  }
});
```

### `useTypewriter(text, options?)`
**Use Case:** Realistic typing animations
**When to Use:** Chat interfaces, storytelling, tutorials
**Properties:**
- `text: string` - Text to type
- `speed: {min, max}` - Typing speed variation
- `mistakes.probability: number` - Typing error chance
- `mistakes.correction: boolean` - Auto-correct errors
- `cursor.show: boolean` - Show typing cursor
- `cursor.blink: object` - Cursor blink settings
- `sound: object` - Typewriter sound effects

```jsx
const { ref, type, erase } = useTypewriter({
  speed: { min: 80, max: 180 },
  mistakes: { 
    probability: 0.08, 
    correction: true,
    humanDelay: 600 
  },
  sound: {
    keystroke: '/sounds/key.mp3',
    volume: 0.3
  }
});
```

---

## 🔄 Layout & Transition Effects

### `useLayoutAnimation(options?)`
**Use Case:** Smooth layout transitions (FLIP technique)
**When to Use:** Grid/list toggles, responsive layouts, reordering
**Properties:**
- `duration: number` - Transition duration
- `ease: string` - Animation easing
- `animateOpacity: boolean` - Include opacity changes
- `animateTransform: boolean` - Include transform changes
- `stagger: number` - Multi-element stagger
- `onComplete: function` - Completion callback

```jsx
const { ref, measure } = useLayoutAnimation({
  duration: 0.8,
  ease: 'power2.out',
  animateOpacity: true,
  stagger: 0.05
});
```

### `useListAnimation(options?)`
**Use Case:** Dynamic list animations
**When to Use:** Todo lists, search results, data tables
**Properties:**
- `add.animation: string` - Add item animation
- `add.duration: number` - Add animation duration
- `remove.animation: string` - Remove item animation
- `remove.duration: number` - Remove animation duration
- `move.duration: number` - Reorder animation duration
- `layout.stagger: number` - Layout change stagger
- `layout.preserveScrollPosition: boolean` - Maintain scroll

```jsx
const { ref, containerRef } = useListAnimation({
  add: {
    animation: 'slideFromRight',
    duration: 0.5,
    ease: 'back.out(1.4)'
  },
  remove: {
    animation: 'scaleDown',
    duration: 0.4
  }
});
```

### `useSharedElementTransition(id, options?)`
**Use Case:** Page transitions with shared elements
**When to Use:** Image galleries, navigation, detail views
**Properties:**
- `id: string` - Unique element identifier
- `type: 'source' | 'destination'` - Transition role
- `duration: number` - Transition duration
- `scale: {from, to}` - Scale transformation
- `position: object` - Position transformation
- `zIndex: number` - Layer management

```jsx
// Source page
const { ref: thumbnailRef } = useSharedElementTransition('product-image', {
  type: 'source',
  duration: 1.0
});

// Destination page
const { ref: fullImageRef } = useSharedElementTransition('product-image', {
  type: 'destination',
  scale: { from: 0.3, to: 1 }
});
```

---

## 👆 Touch & Gesture Support

### `useDragAnimation(options?)`
**Use Case:** Draggable interfaces and interactions
**When to Use:** Sliders, cards, sortable lists, games
**Properties:**
- `bounds: object` - Drag boundaries
- `elastic: boolean` - Elastic bounds
- `momentum: object` - Momentum physics
- `snap: object` - Snap-to-point behavior
- `constraints: object` - Movement restrictions
- `onDragStart: function` - Drag start callback
- `onDragEnd: function` - Drag end callback

```jsx
const { ref, isDragging, position } = useDragAnimation({
  bounds: { left: -200, right: 200, top: -100, bottom: 100 },
  elastic: true,
  momentum: {
    enabled: true,
    friction: 0.85,
    maxVelocity: 1500
  },
  snap: {
    enabled: true,
    points: [[0, 0], [100, 0]],
    threshold: 40
  }
});
```

### `useSwipeGestures(options?)`
**Use Case:** Swipe navigation and interactions
**When to Use:** Carousels, mobile interfaces, galleries
**Properties:**
- `onSwipeLeft/Right/Up/Down: function` - Direction callbacks
- `threshold.distance: number` - Minimum swipe distance
- `threshold.velocity: number` - Minimum swipe speed
- `threshold.time: number` - Maximum swipe duration
- `preventDefault: boolean` - Prevent default behavior
- `continuous: boolean` - Allow continuous swiping

```jsx
const { ref } = useSwipeGestures({
  onSwipeLeft: (info) => nextSlide(info.velocity),
  onSwipeRight: (info) => prevSlide(info.velocity),
  threshold: {
    distance: 80,
    velocity: 0.4,
    time: 600
  }
});
```

### `usePinchZoom(options?)`
**Use Case:** Zoom interactions for images and content
**When to Use:** Image viewers, maps, detailed content
**Properties:**
- `minScale: number` - Minimum zoom level
- `maxScale: number` - Maximum zoom level
- `centerOnPinch: boolean` - Center zoom on pinch point
- `smoothReturn: boolean` - Smooth return to bounds
- `wheel.enabled: boolean` - Mouse wheel support
- `wheel.sensitivity: number` - Wheel zoom sensitivity

```jsx
const { ref, scale, reset } = usePinchZoom({
  minScale: 0.5,
  maxScale: 4,
  centerOnPinch: true,
  wheel: {
    enabled: true,
    sensitivity: 0.02
  }
});
```

### `useMultiTouch(options?)`
**Use Case:** Complex gesture recognition
**When to Use:** Advanced interfaces, drawing apps, music controllers
**Properties:**
- `maxTouches: number` - Maximum simultaneous touches
- `gestures: object` - Gesture definitions
- `preventDefault: boolean` - Prevent default actions
- `debounce: number` - Gesture debounce time
- `precision: number` - Touch precision threshold

```jsx
const { ref } = useMultiTouch({
  maxTouches: 5,
  gestures: {
    tap: { fingers: 1, onTap: handleTap },
    doubleTap: { fingers: 1, onDoubleTap: handleDoubleTap },
    twoFingerTap: { fingers: 2, onTap: handleTwoFingerTap },
    threeFingerSwipe: { 
      fingers: 3, 
      onSwipe: handleThreeFingerSwipe 
    }
  }
});
```

---

## 🤖 AI-Powered Features

### `useAIAnimation(prompt, options?)`
**Use Case:** Natural language animation generation
**When to Use:** Rapid prototyping, creative exploration, user requests
**Properties:**
- `prompt: string` - Natural language description
- `context: object` - Animation context information
- `learning.enabled: boolean` - Enable AI learning
- `learning.userFeedback: boolean` - Collect feedback
- `options.duration: object` - Duration preferences
- `options.easing: object` - Easing preferences
- `options.effects: string[]` - Available effects

```jsx
const { ref, suggestions, apply } = useAIAnimation(
  'Make this button feel premium and luxurious',
  {
    context: {
      element: 'button',
      brand: 'luxury',
      device: 'mobile'
    },
    options: {
      duration: { preferred: 0.6, range: [0.3, 1.2] },
      effects: ['scale', 'color', 'shadow', 'particles']
    }
  }
);
```

### `useAnimationMood(mood, options?)`
**Use Case:** Emotion-based animation styling
**When to Use:** Brand experiences, user preferences, adaptive UIs
**Properties:**
- `mood: string` - Current animation mood
- `moods: object` - Mood definitions
- `adaptToContent: boolean` - Content-aware adaptation
- `userPreferences: boolean` - Respect user settings
- `transition: number` - Mood change transition time

```jsx
const { ref, setMood } = useAnimationMood('energetic', {
  moods: {
    calm: { 
      duration: 'slow', 
      easing: 'gentle', 
      amplitude: 'subtle' 
    },
    energetic: { 
      duration: 'fast', 
      easing: 'bouncy', 
      amplitude: 'high' 
    },
    elegant: { 
      duration: 'medium', 
      easing: 'smooth', 
      amplitude: 'refined' 
    }
  }
});
```

### `useSmartStagger(elements, options?)`
**Use Case:** Intelligent stagger timing optimization
**When to Use:** Complex layouts, reading patterns, accessibility
**Properties:**
- `elements: string` - Element selector
- `analysis.visualHierarchy: boolean` - Analyze importance
- `analysis.readingPattern: string` - Reading flow pattern
- `analysis.semanticGrouping: boolean` - Group related elements
- `optimization.cognitiveLoad: string` - Balance complexity
- `optimization.accessibilityFirst: boolean` - Accessibility priority

```jsx
const { ref } = useSmartStagger('.card', {
  analysis: {
    visualHierarchy: true,
    readingPattern: 'F',
    semanticGrouping: true
  },
  optimization: {
    cognitiveLoad: 'medium',
    accessibilityFirst: true
  }
});
```

---

## 🎨 Advanced Visual Effects

### `usePathMorph(paths, options?)`
**Use Case:** SVG path morphing and shape transitions
**When to Use:** Icons, illustrations, data visualizations
**Properties:**
- `paths: string[]` - Array of SVG path data
- `duration: number` - Morph duration
- `ease: string` - Morph easing
- `autoOptimize: boolean` - Optimize path complexity
- `smoothing: number` - Path smoothing level

```jsx
const { ref, morphTo, morphToIndex } = usePathMorph([
  'M 0,0 L 100,0 L 100,100 L 0,100 Z', // Square
  'M 50,0 L 100,50 L 50,100 L 0,50 Z',  // Diamond
  'M 50,0 A 50,50 0 1,1 49,1 Z'          // Circle
], {
  duration: 1.2,
  ease: 'power2.inOut'
});
```

### `useMorphingIcon(icons, options?)`
**Use Case:** Icon state transitions
**When to Use:** Interactive buttons, state indicators, navigation
**Properties:**
- `icons: object` - Icon path definitions
- `size: number` - Icon size
- `duration: number` - Morph duration
- `strokeWidth: number` - Stroke width
- `colors: object` - Color definitions per state

```jsx
const { ref, morphTo } = useMorphingIcon({
  play: 'M8 5v14l11-7z',
  pause: 'M6 19h4V5H6v14zm8-14v14h4V5h-4z',
  stop: 'M6 6h12v12H6z'
}, {
  size: 32,
  duration: 0.4
});
```

---

## 📦 React Components

### `<AnimatedPresence>`
**Use Case:** Enter/exit animations for conditional rendering
**When to Use:** Modals, tooltips, conditional content
**Properties:**
- `mode: 'wait' | 'sync'` - Animation timing mode
- `initial: boolean` - Animate on mount
- `exitBeforeEnter: boolean` - Wait for exit before enter

```jsx
<AnimatedPresence>
  {isVisible && (
    <div>Animated content</div>
  )}
</AnimatedPresence>
```

### `<StaggerContainer>`
**Use Case:** Automatic child element staggering
**When to Use:** Lists, grids, navigation menus
**Properties:**
- `stagger: number` - Stagger delay
- `direction: string` - Animation direction
- `children: ReactNode` - Child elements

```jsx
<StaggerContainer stagger={0.15} direction="up">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</StaggerContainer>
```

### `<Scene3D>`
**Use Case:** Declarative 3D scene creation
**When to Use:** Product showcases, interactive 3D content
**Properties:**
- `width: number` - Canvas width
- `height: number` - Canvas height
- `camera: object` - Camera configuration
- `lights: ReactNode` - Light components
- `children: ReactNode` - 3D objects

```jsx
<Scene3D width={800} height={600}>
  <Camera3D position={[0, 0, 5]} />
  <Light3D type="ambient" intensity={0.5} />
  <Mesh3D
    geometry="box"
    material={{ color: '#ff0000' }}
    animate={{ rotation: { y: Math.PI * 2 } }}
  />
</Scene3D>
```

### `<ParticleSystem>`
**Use Case:** Declarative particle effects
**When to Use:** Background effects, interactions, celebrations
**Properties:**
- `type: string` - Particle type
- `count: number` - Particle count
- `emissionRate: number` - Particles per second
- `position: object` - Emission position
- `colors: string[]` - Particle colors

```jsx
<ParticleSystem
  type="fire"
  count={300}
  emissionRate={15}
  position={{ x: 400, y: 500 }}
  colors={['#ff4444', '#ff8800', '#ffaa00']}
/>
```

---

## ⚙️ Configuration & Optimization

### Global Configuration via `EsapProvider`
**Use Case:** App-wide animation settings
**Properties:**
- `config.reducedMotion: boolean` - Respect accessibility preferences
- `config.defaultDuration: number` - Default animation duration
- `config.defaultEase: string` - Default easing function
- `config.physics: object` - Physics engine settings
- `config.particles: object` - Particle system limits
- `config.three: object` - Three.js renderer settings

```jsx
<EsapProvider
  config={{
    reducedMotion: true,
    defaultDuration: 0.8,
    physics: {
      gravity: { x: 0, y: 1.2 }
    },
    particles: {
      maxCount: 10000,
      pooling: true
    }
  }}
>
  {children}
</EsapProvider>
```

### Performance Hooks

#### `useBatchAnimation(animations, options?)`
**Use Case:** Batch multiple animations for performance
**Properties:**
- `animations: object[]` - Animation definitions
- `batchSize: number` - Animations per batch
- `delay: number` - Delay between batches

```jsx
const { refs, trigger } = useBatchAnimation([
  { selector: '.card', animation: { y: 50, opacity: 0 } },
  { selector: '.button', animation: { scale: 0 } }
]);
```

#### `usePerformanceMonitor(options?)`
**Use Case:** Monitor animation performance
**Properties:**
- `fps: boolean` - Track frame rate
- `memory: boolean` - Monitor memory usage
- `warnings: boolean` - Performance warnings
- `onThresholdExceeded: function` - Performance callback

```jsx
const { metrics, optimize } = usePerformanceMonitor({
  fps: true,
  warnings: true,
  onThresholdExceeded: (metric) => {
    if (metric.fps < 30) {
      optimize('reduceParticles');
    }
  }
});
```

---

## 🎯 Advanced Utility Hooks

### `useGSAP(callback, options?)`
**Use Case:** Direct GSAP timeline access with React integration
**When to Use:** Complex custom animations, existing GSAP code migration
**Properties:**
- `callback: function` - GSAP timeline function
- `dependencies: any[]` - React dependencies array
- `scope: string` - Animation scope selector
- `revert: boolean` - Auto cleanup on unmount

```jsx
const { ref, timeline } = useGSAP(() => {
  return gsap.timeline()
    .to('.element', { rotation: 360, duration: 2 })
    .to('.element', { scale: 1.5, duration: 1 });
}, []);
```

### `useMediaQuery(query, options?)`
**Use Case:** Responsive animation adjustments
**When to Use:** Device-specific animations, responsive design
**Properties:**
- `query: string` - CSS media query
- `fallback: boolean` - Default value for SSR
- `observe: boolean` - Watch for changes

```jsx
const isMobile = useMediaQuery('(max-width: 768px)');
const ref = useFadeIn({ 
  duration: isMobile ? 0.5 : 1.0,
  distance: isMobile ? 20 : 50 
});
```

### `useReducedMotion(options?)`
**Use Case:** Accessibility-aware animations
**When to Use:** Respecting user preferences, inclusive design
**Properties:**
- `fallback: boolean` - Default reduced motion state
- `respectSystem: boolean` - Use system preference
- `customPreference: boolean` - Allow user override

```jsx
const prefersReducedMotion = useReducedMotion();
const ref = useFadeIn({ 
  duration: prefersReducedMotion ? 0.1 : 1.0,
  disable: prefersReducedMotion 
});
```

### `useIntersectionObserver(options?)`
**Use Case:** Scroll-triggered animations with custom logic
**When to Use:** Performance-optimized scroll effects, lazy loading
**Properties:**
- `threshold: number | number[]` - Intersection thresholds
- `root: Element` - Root element for intersection
- `rootMargin: string` - Root margin offset
- `triggerOnce: boolean` - Fire only once

```jsx
const { ref, inView, entry } = useIntersectionObserver({
  threshold: [0, 0.5, 1],
  rootMargin: '50px 0px',
  triggerOnce: true
});

useEffect(() => {
  if (inView && entry.intersectionRatio > 0.5) {
    // Trigger animation when 50% visible
  }
}, [inView, entry]);
```

---

## 🎮 Game & Interactive Features

### `useKeyboard(keys, options?)`
**Use Case:** Keyboard-controlled animations and interactions
**When to Use:** Games, shortcuts, interactive demos
**Properties:**
- `keys: string[]` - Key codes to monitor
- `preventDefault: boolean` - Prevent default key behavior
- `global: boolean` - Listen on document vs element
- `combinations: object` - Key combination definitions

```jsx
const keys = useKeyboard(['ArrowLeft', 'ArrowRight', 'Space'], {
  preventDefault: true,
  combinations: {
    'ctrl+z': 'undo',
    'shift+space': 'boost'
  }
});

useEffect(() => {
  if (keys.ArrowLeft) moveLeft();
  if (keys.Space) jump();
  if (keys.combinations.boost) activateBoost();
}, [keys]);
```

### `useGameLoop(callback, options?)`
**Use Case:** 60fps game loops and real-time animations
**When to Use:** Games, simulations, continuous animations
**Properties:**
- `fps: number` - Target frame rate (default: 60)
- `autoStart: boolean` - Start immediately
- `pauseOnBlur: boolean` - Pause when window loses focus
- `adaptive: boolean` - Adaptive frame rate

```jsx
const { start, stop, pause, resume, fps } = useGameLoop((deltaTime, totalTime) => {
  // Update game state
  updatePlayer(deltaTime);
  updateEnemies(deltaTime);
  checkCollisions();
}, {
  fps: 60,
  pauseOnBlur: true
});
```

### `useCollisionDetection(objects, options?)`
**Use Case:** 2D collision detection for games and interactions
**When to Use:** Games, drag-drop interfaces, interactive elements
**Properties:**
- `objects: object[]` - Objects with bounds
- `method: 'AABB' | 'circle' | 'SAT'` - Detection algorithm
- `continuous: boolean` - Continuous collision detection
- `spatial: boolean` - Spatial partitioning optimization

```jsx
const { collisions, checkCollision } = useCollisionDetection([
  { id: 'player', bounds: playerBounds },
  { id: 'enemy1', bounds: enemy1Bounds },
  { id: 'collectible', bounds: itemBounds }
], {
  method: 'AABB',
  continuous: true
});

useEffect(() => {
  collisions.forEach(({ objectA, objectB }) => {
    if (objectA.id === 'player' && objectB.id.startsWith('enemy')) {
      handlePlayerHit();
    }
  });
}, [collisions]);
```

---

## 🎨 Creative & Artistic Features

### `useFlowField(options?)`
**Use Case:** Organic, flowing particle movements
**When to Use:** Artistic backgrounds, natural simulations, ambient effects
**Properties:**
- `resolution: number` - Field resolution
- `strength: number` - Flow strength
- `noise: object` - Noise parameters
- `evolution: number` - Time-based evolution
- `boundaries: object` - Field boundaries

```jsx
const { ref, field, updateField } = useFlowField({
  resolution: 20,
  strength: 0.5,
  noise: {
    scale: 0.01,
    octaves: 3,
    persistence: 0.5
  },
  evolution: 0.01
});
```

### `useFractalAnimation(type, options?)`
**Use Case:** Mathematical fractal visualizations
**When to Use:** Abstract art, mathematical demonstrations, hypnotic backgrounds
**Properties:**
- `type: 'mandelbrot' | 'julia' | 'sierpinski' | 'dragon'` - Fractal type
- `iterations: number` - Calculation depth
- `zoom: number` - Zoom level
- `colors: string[]` - Color palette
- `animate: boolean` - Animate parameters
- `interactive: boolean` - User interaction

```jsx
const { ref, setParameters } = useFractalAnimation('mandelbrot', {
  iterations: 100,
  zoom: 1,
  colors: ['#000428', '#004e92', '#009ffd', '#00d2ff'],
  animate: true,
  parameters: {
    centerX: -0.5,
    centerY: 0,
    animateZoom: true
  }
});
```

### `useGenerativeArt(algorithm, options?)`
**Use Case:** Procedural art generation
**When to Use:** Dynamic backgrounds, unique visual experiences, creative coding
**Properties:**
- `algorithm: string` - Generation algorithm
- `seed: number` - Random seed
- `parameters: object` - Algorithm parameters
- `animate: boolean` - Animate generation
- `export: object` - Export options

```jsx
const { ref, generate, parameters } = useGenerativeArt('perlinLandscape', {
  seed: 12345,
  parameters: {
    octaves: 6,
    persistence: 0.5,
    scale: 0.1,
    amplitude: 100
  },
  animate: true,
  colors: ['#2c3e50', '#34495e', '#7f8c8d', '#ecf0f1']
});
```

---

## 📊 Data Visualization Features

### `useDataAnimation(data, options?)`
**Use Case:** Animated data visualizations and charts
**When to Use:** Dashboards, presentations, data storytelling
**Properties:**
- `data: any[]` - Dataset to animate
- `type: 'bar' | 'line' | 'pie' | 'scatter'` - Chart type
- `duration: number` - Animation duration
- `stagger: number` - Data point stagger
- `morphing: boolean` - Smooth data transitions

```jsx
const { ref, updateData, animate } = useDataAnimation(salesData, {
  type: 'bar',
  duration: 1.5,
  stagger: 0.1,
  morphing: true,
  colors: ['#3498db', '#e74c3c', '#2ecc71'],
  responsive: true
});
```

### `useChartTransition(charts, options?)`
**Use Case:** Smooth transitions between different chart types
**When to Use:** Interactive dashboards, data exploration
**Properties:**
- `charts: object[]` - Chart configurations
- `duration: number` - Transition duration
- `preserveData: boolean` - Maintain data relationships
- `morphAxes: boolean` - Animate axis changes

```jsx
const { ref, transitionTo } = useChartTransition([
  { type: 'bar', data: monthlyData },
  { type: 'line', data: monthlyData },
  { type: 'pie', data: categoryData }
], {
  duration: 1.2,
  preserveData: true,
  morphAxes: true
});
```

---

## 🌐 WebGL & Shader Effects

### `useShaderMaterial(vertexShader, fragmentShader, options?)`
**Use Case:** Custom WebGL shader effects
**When to Use:** Advanced visual effects, custom materials, artistic shaders
**Properties:**
- `vertexShader: string` - Vertex shader code
- `fragmentShader: string` - Fragment shader code
- `uniforms: object` - Shader uniforms
- `animate: boolean` - Animate uniform values
- `precision: string` - Shader precision

```jsx
const { ref, material, updateUniforms } = useShaderMaterial(
  vertexShaderCode,
  fragmentShaderCode,
  {
    uniforms: {
      time: 0,
      resolution: [window.innerWidth, window.innerHeight],
      color: [1.0, 0.5, 0.0]
    },
    animate: true
  }
);
```

### `usePostProcessing(effects, options?)`
**Use Case:** Post-processing effects for 3D scenes
**When to Use:** Cinematic effects, visual enhancement, artistic filters
**Properties:**
- `effects: string[]` - Post-processing effects
- `bloom: object` - Bloom effect settings
- `ssao: object` - Screen-space ambient occlusion
- `colorGrading: object` - Color correction
- `distortion: object` - Screen distortion

```jsx
const { ref, composer, setEffect } = usePostProcessing([
  'bloom', 'ssao', 'colorGrading'
], {
  bloom: {
    strength: 1.5,
    radius: 0.4,
    threshold: 0.85
  },
  ssao: {
    radius: 0.1,
    intensity: 0.5
  }
});
```

---

## 🎪 Advanced Animation Patterns

### `useSequentialAnimation(sequence, options?)`
**Use Case:** Complex, sequential animation choreography
**When to Use:** Onboarding flows, storytelling, complex UI transitions
**Properties:**
- `sequence: object[]` - Animation sequence steps
- `autoPlay: boolean` - Start automatically
- `loop: boolean` - Loop sequence
- `controls: boolean` - Playback controls

```jsx
const { ref, play, pause, currentStep } = useSequentialAnimation([
  { 
    target: '.title', 
    animation: { y: 0, opacity: 1 }, 
    duration: 1,
    delay: 0.5 
  },
  { 
    target: '.subtitle', 
    animation: { x: 0, opacity: 1 }, 
    duration: 0.8 
  },
  { 
    target: '.buttons', 
    animation: { scale: 1, opacity: 1 }, 
    duration: 0.6,
    stagger: 0.1 
  }
], {
  autoPlay: true,
  controls: true
});
```

### `useParallelAnimation(animations, options?)`
**Use Case:** Multiple simultaneous animations with coordination
**When to Use:** Complex UI states, synchronized effects
**Properties:**
- `animations: object[]` - Parallel animation definitions
- `sync: boolean` - Synchronize timing
- `master: string` - Master animation reference
- `onComplete: function` - All animations complete callback

```jsx
const { ref, start, stop } = useParallelAnimation([
  { 
    target: '.background', 
    animation: { scale: 1.1, opacity: 0.8 },
    duration: 2 
  },
  { 
    target: '.content', 
    animation: { y: 0, opacity: 1 },
    duration: 1,
    delay: 0.5 
  },
  { 
    target: '.particles', 
    animation: { emit: true, count: 100 },
    duration: 0.1 
  }
], {
  sync: true,
  master: 'content'
});
```

### `useConditionalAnimation(condition, animations, options?)`
**Use Case:** State-based animation switching
**When to Use:** Interactive states, user preference adaptation
**Properties:**
- `condition: any` - Condition to evaluate
- `animations: object` - Animation options per condition
- `transition: number` - State transition duration
- `immediate: boolean` - Skip transition on first render

```jsx
const { ref } = useConditionalAnimation(userTheme, {
  light: {
    backgroundColor: '#ffffff',
    color: '#333333',
    duration: 0.8
  },
  dark: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    duration: 0.8
  },
  auto: {
    // Uses system preference
    duration: 0.8
  }
}, {
  transition: 0.6,
  immediate: false
});
```

---

## 🔧 Development & Debug Tools

### `useAnimationDebugger(options?)`
**Use Case:** Debug and visualize animations during development
**When to Use:** Development phase, performance optimization, learning
**Properties:**
- `showTimelines: boolean` - Visualize GSAP timelines
- `showBounds: boolean` - Display element bounds
- `showFrameRate: boolean` - FPS monitoring
- `logPerformance: boolean` - Performance logging
- `overlay: boolean` - Debug overlay UI

```jsx
const { debugRef, toggleDebug, metrics } = useAnimationDebugger({
  showTimelines: true,
  showBounds: true,
  showFrameRate: true,
  overlay: process.env.NODE_ENV === 'development'
});
```

### `useAnimationRecorder(options?)`
**Use Case:** Record and replay animations
**When to Use:** Testing, demonstrations, animation refinement
**Properties:**
- `format: 'json' | 'mp4' | 'gif'` - Recording format
- `fps: number` - Recording frame rate
- `duration: number` - Maximum recording duration
- `quality: string` - Recording quality

```jsx
const { 
  startRecording, 
  stopRecording, 
  replay, 
  export: exportRecording 
} = useAnimationRecorder({
  format: 'json',
  fps: 30,
  duration: 10,
  onComplete: (recording) => {
    console.log('Recording complete:', recording);
  }
});
```

---

## 🎯 Specialized Use Case Hooks

### `useScrollStory(chapters, options?)`
**Use Case:** Scroll-driven storytelling and narratives
**When to Use:** Landing pages, case studies, interactive articles
**Properties:**
- `chapters: object[]` - Story chapter definitions
- `navigation: boolean` - Chapter navigation UI
- `progress: boolean` - Progress indicator
- `autoProgress: boolean` - Auto-advance chapters

```jsx
const { ref, currentChapter, goToChapter } = useScrollStory([
  {
    title: 'Chapter 1',
    content: 'Introduction content',
    animation: { backgroundImage: 'url(/bg1.jpg)' },
    duration: 2
  },
  {
    title: 'Chapter 2', 
    content: 'Development content',
    animation: { backgroundImage: 'url(/bg2.jpg)' },
    duration: 1.5
  }
], {
  navigation: true,
  progress: true
});
```

### `useProductShowcase(product, options?)`
**Use Case:** Interactive product demonstrations
**When to Use:** E-commerce, portfolio, product marketing
**Properties:**
- `product: object` - Product configuration
- `views: string[]` - Available viewing angles
- `interactions: object` - Interactive features
- `annotations: boolean` - Feature annotations

```jsx
const { 
  ref, 
  rotateToView, 
  highlightFeature, 
  currentView 
} = useProductShowcase({
  model: '/models/product.glb',
  views: ['front', 'back', 'side', 'top'],
  interactions: {
    rotate: true,
    zoom: true,
    annotate: true
  },
  features: [
    { name: 'Feature 1', position: [0, 1, 0] },
    { name: 'Feature 2', position: [1, 0, 0] }
  ]
});
```

### `useDataStory(data, narrative, options?)`
**Use Case:** Data-driven storytelling with animations
**When to Use:** Reports, presentations, data journalism
**Properties:**
- `data: any[]` - Dataset for story
- `narrative: object[]` - Story progression steps
- `charts: object` - Chart configurations
- `transitions: object` - Data transition effects

```jsx
const { ref, nextStep, previousStep, currentStep } = useDataStory(
  salesData,
  [
    {
      title: 'Sales Overview',
      focus: 'total',
      chart: 'bar',
      highlight: 'Q4'
    },
    {
      title: 'Regional Breakdown',
      focus: 'regions',
      chart: 'map',
      animation: 'zoomToRegion'
    }
  ],
  {
    autoAdvance: false,
    transitions: {
      duration: 1.5,
      ease: 'power2.inOut'
    }
  }
);
```

---

## 🌟 Premium Features

### `useAIVisualGenerator(prompt, options?)`
**Use Case:** AI-generated visual content and animations
**When to Use:** Rapid prototyping, creative exploration, personalized content
**Properties:**
- `prompt: string` - Visual description prompt
- `style: string` - Art style preference
- `resolution: string` - Output resolution
- `animated: boolean` - Generate animations
- `iterations: number` - Generation iterations

```jsx
const { 
  generate, 
  result, 
  isGenerating, 
  variations 
} = useAIVisualGenerator(
  'A serene mountain landscape at sunset',
  {
    style: 'realistic',
    resolution: '1920x1080',
    animated: true,
    iterations: 5
  }
);
```

### `useVoiceControlledAnimation(commands, options?)`
**Use Case:** Voice-controlled animation interfaces
**When to Use:** Accessibility, hands-free interaction, presentations
**Properties:**
- `commands: object` - Voice command mappings
- `language: string` - Recognition language
- `continuous: boolean` - Continuous listening
- `confidence: number` - Recognition confidence threshold

```jsx
const { 
  isListening, 
  startListening, 
  stopListening 
} = useVoiceControlledAnimation({
  'play animation': () => timeline.play(),
  'pause': () => timeline.pause(),
  'speed up': () => timeline.timeScale(2),
  'slow down': () => timeline.timeScale(0.5),
  'reset': () => timeline.restart()
}, {
  language: 'en-US',
  continuous: true,
  confidence: 0.7
});
```

### `useEyeTracking(options?)`
**Use Case:** Eye-tracking based animations and interactions
**When to Use:** Accessibility, user research, attention-based UIs
**Properties:**
- `calibrate: boolean` - Auto-calibration
- `precision: string` - Tracking precision
- `gazePath: boolean` - Track gaze path
- `dwellTime: number` - Dwell-time interactions

```jsx
const { 
  gazePosition, 
  isCalibrated, 
  focusedElement,
  calibrate
} = useEyeTracking({
  precision: 'high',
  gazePath: true,
  dwellTime: 1000,
  onFocus: (element) => {
    // Animate focused element
    gsap.to(element, { scale: 1.1, duration: 0.3 });
  }
});
```

---

## 📈 Performance Presets

### Animation Presets by Use Case

```javascript
const presets = {
  // Basic presets
  gentle: { duration: 1.2, ease: 'power1.out' },
  energetic: { duration: 0.6, ease: 'back.out(1.7)' },
  dramatic: { duration: 1.5, ease: 'power3.inOut' },
  subtle: { duration: 2, ease: 'none' },

  // Device-specific presets
  mobile: { 
    duration: 0.4, 
    ease: 'power2.out',
    reducedParticles: true 
  },
  desktop: { 
    duration: 0.8, 
    ease: 'power2.inOut',
    highQuality: true 
  },
  tablet: { 
    duration: 0.6, 
    ease: 'power1.out',
    mediumQuality: true 
  },

  // Context-specific presets  
  gaming: {
    duration: 0.2,
    ease: 'none',
    fps: 60,
    precision: 'high'
  },
  presentation: {
    duration: 1.0,
    ease: 'power2.inOut',
    dramatic: true,
    pausePoints: true
  },
  ecommerce: {
    duration: 0.5,
    ease: 'back.out(1.2)',
    highlighting: true,
    accessibility: 'high'
  },
  artistic: {
    duration: 'variable',
    ease: 'elastic.inOut',
    creative: true,
    experimental: true
  }
};
```

---

## 🎓 Best Practices & Tips

### Performance Optimization Guidelines

1. **Use Object Pooling for Particles**
```jsx
const particlesRef = useParticles({ 
  pooling: true,
  maxCount: 1000,
  recycleRate: 0.1 
});
```

2. **Batch DOM Updates**
```jsx
const batchRef = useBatchAnimation(animations, {
  batchSize: 10,
  rafOptimized: true
});
```

3. **Implement Level of Detail (LOD)**
```jsx
const distance = useDistance(camera, object);
const lodLevel = distance > 100 ? 'low' : distance > 50 ? 'medium' : 'high';
```

4. **Use Intersection Observer for Performance**
```jsx
const { inView } = useIntersectionObserver({
  threshold: 0.1,
  triggerOnce: true
});
// Only animate when visible
```

### Accessibility Best Practices

1. **Respect Reduced Motion Preference**
```jsx
const prefersReducedMotion = useReducedMotion();
const duration = prefersReducedMotion ? 0.1 : 1.0;
```

2. **Provide Animation Controls**
```jsx
const { play, pause, restart } = useAnimationControls({
  showControls: true,
  keyboard: true
});
```

3. **Ensure Focus Management**
```jsx
const { ref, onAnimationComplete } = useFadeIn({
  onComplete: () => {
    // Ensure focus is properly managed after animation
    ref.current?.focus();
  }
});
```

### Browser Compatibility Notes

- **Chrome/Edge 88+**: Full feature support
- **Firefox 78+**: Full support (some experimental features limited)  
- **Safari 14+**: Full support (WebGL features require iOS 14+)
- **Mobile browsers**: Automatic performance scaling
- **WebGL required**: For 3D features and advanced shaders
- **Web Audio API**: Required for audio-reactive features

### Bundle Size Considerations

- **Core**: ~12KB gzipped
- **3D Features**: +15KB (Three.js subset)
- **Physics**: +8KB (Matter.js subset) 
- **Particles**: +5KB
- **AI Features**: +20KB (when used)
- **Tree-shaking**: Only bundle what you import

---

This comprehensive guide covers all ESAP features with their use cases, properties, and implementation examples. The library provides a complete animation ecosystem for modern React applications, from simple fade effects to complex 3D scenes and AI-powered animations.