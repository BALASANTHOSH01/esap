// Vector3 type for 3D coordinates
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// Basic animation options
export interface AnimationOptions {
  duration?: number;
  delay?: number;
  ease?: string;
  repeat?: number;
  yoyo?: boolean;
  onComplete?: () => void;
  onStart?: () => void;
  onUpdate?: (progress: number) => void;
  gpu?: boolean;
  willChange?: boolean;
}

// Trigger configuration
export interface TriggerOptions {
  trigger?: 'immediate' | 'scroll' | 'click' | 'hover' | 'proximity' | 'deviceOrientation';
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  proximityThreshold?: number;
}

// Physics simulation options
export interface PhysicsOptions {
  mass?: number;
  damping?: number;
  gravity?: number;
  spring?: {
    target: Vector3;
    stiffness: number;
  };
  constraints?: {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
    minZ?: number;
    maxZ?: number;
    bounce?: number;
  };
}



export interface AnimationError {
  id: string;
  type: string;
  error: Error;
  timestamp: number;
  element?: HTMLElement;
}


// Three.js lighting configuration
export interface LightOptions {
  type: 'ambient' | 'directional' | 'point';
  color?: number;
  intensity?: number;
  x?: number;
  y?: number;
  z?: number;
}


// Three.js 3D options
export interface ThreeDOptions {
  fov?: number;
  near?: number;
  far?: number;
  cameraZ?: number;
  antialias?: boolean;
  container?: HTMLElement;
  lights?: LightOptions[];
}

// Gesture recognition options
export interface GestureOptions {
  swipe?: boolean;
  pinch?: boolean;
  tap?: boolean;
  longPress?: boolean;
  sensitivity?: number;
  onSwipe?: (direction: string) => void;
  onPinch?: (scale: number) => void;
  onTap?: () => void;
  onLongPress?: () => void;
}

// Motion path animation options
export interface MotionPathOptions {
  path: string | SVGPathElement;
  duration?: number;
  ease?: string;
  autoRotate?: boolean;
  alignOrigin?: [number, number] | string;
}

// GSAP MotionPath configuration (internal use)
export interface GSAPMotionPathConfig {
  path: SVGPathElement | string;
  autoRotate?: boolean;
  alignOrigin?: number[];
  align?: string;
}

// Particle system configuration
export interface ParticleSystemOptions {
  count?: number;
  spread?: number;
  size?: number;
  opacity?: number;
  duration?: number;
  colors?: number[];
  velocity?: Vector3;
  acceleration?: Vector3;
}

// Extended animation options that include all features
export interface ExtendedAnimationOptions {
  duration?: number;
  delay?: number;
  ease?: string;
  trigger?: 'immediate' | 'scroll' | 'click' | 'hover' | 'proximity' | 'deviceOrientation';
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  gpu?: boolean;
  willChange?: boolean;
  proximityThreshold?: number;
  physics?: PhysicsOptions;
  threeDimensional?: ThreeDOptions;
  gestures?: GestureOptions;
  motionPath?: MotionPathOptions;
  onStart?: () => void;
  onUpdate?: (progress: number) => void;
  onComplete?: () => void;
}

// Animation instance interface
export interface AnimationInstance {
  element: HTMLElement;
  timeline: gsap.core.Timeline;
  options: ExtendedAnimationOptions;
  id: string;
  isDestroyed: boolean;
  destroy: () => void;
  play: () => void;
  pause: () => void;
  restart: () => void;
  reverse: () => void;
  progress: (value?: number) => number;
  setTimeScale: (scale: number) => void;
  seek: (time: number) => void;
  addLabel: (label: string, position?: number | string) => void;
  gotoAndPlay: (position: number | string) => void;
  gotoAndStop: (position: number | string) => void;
}

// Fade animation options
export interface FadeInOptions extends AnimationOptions, TriggerOptions {
  from?: number;
  to?: number;
  priority?: number; // Added
}

// Slide animation options
export interface SlideInOptions extends AnimationOptions, TriggerOptions {
  direction: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  priority?: number; // Added
}

// Stagger animation options
export interface StaggerOptions extends AnimationOptions, TriggerOptions {
  stagger?: number;
  from?: 'start' | 'center' | 'end' | 'edges';
  priority?: number; // Added
}

// Parallax scroll options
export interface ParallaxOptions extends AnimationOptions {
  speed?: number;
  direction?: 'vertical' | 'horizontal';
  smooth?: boolean;
  bounds?: { start?: string; end?: string };
  priority?: number; // Added
}

// ScrollTrigger options
export interface ScrollTriggerOptions extends AnimationOptions {
  start?: string;
  end?: string;
  scrub?: boolean | number;
  pin?: boolean;
  snap?: boolean | number | number[];
  markers?: boolean;
  priority?: number;
}

// Text reveal animation options
export interface TextRevealOptions extends AnimationOptions, TriggerOptions {
  type?: 'chars' | 'words' | 'lines' | 'sentences';
  preserveSpaces?: boolean;
  priority?: number; // Added
}

// Morphing animation options
export interface MorphingOptions extends AnimationOptions {
  morphType?: 'transform' | 'path' | 'color' | 'shape' | 'liquid' | 'elastic';
  colorInterpolation?: 'rgb' | 'hsl' | 'lab';
  pathResolution?: number;
  smoothing?: number;
  priority?: number; // Added
}

// ScrollTrigger instance interface
export interface ScrollTriggerInstance {
  element: HTMLElement;
  scrollTrigger: any; // ScrollTrigger type from gsap
  timeline: gsap.core.Timeline;
  options: ScrollTriggerOptions;
  id?: string;
  isDestroyed?: boolean;
  destroy: () => void;
  enable: () => boolean;
  disable: () => boolean;
  refresh: () => boolean;
  progress: (value?: number) => number;
  updateTrigger?: (options: Partial<ScrollTriggerOptions>) => boolean;
}

// Event handler types
export type EventHandler = (...args: any[]) => void;

export interface EventEmitter {
  on(event: string, handler: EventHandler): void;
  off(event: string, handler: EventHandler): void;
  emit(event: string, ...args: any[]): void;
}

// Animation state
export type AnimationState = 'idle' | 'running' | 'paused' | 'completed' | 'reversed';

// Export all types for use in other files
export type {
  Vector3 as Vector3Type,
  AnimationOptions as AnimationOptionsType,
  TriggerOptions as TriggerOptionsType,
  PhysicsOptions as PhysicsOptionsType,
  ThreeDOptions as ThreeDOptionsType,
  ExtendedAnimationOptions as ExtendedAnimationOptionsType,
  AnimationInstance as AnimationInstanceType
};