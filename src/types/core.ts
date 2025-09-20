// Fixed type definitions for core animation system

export interface AnimationOptions {
  duration?: number;
  delay?: number;
  ease?: string;
  repeat?: number;
  yoyo?: boolean;
  onComplete?: () => void;
  onStart?: () => void;
  onUpdate?: (progress: number) => void;
}

export interface TriggerOptions {
  trigger?: 'immediate' | 'scroll' | 'click' | 'hover';
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export interface FadeInOptions extends AnimationOptions, TriggerOptions {
  from?: number;
  to?: number;
}

export interface SlideInOptions extends AnimationOptions, TriggerOptions {
  direction: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}

export interface StaggerOptions extends AnimationOptions, TriggerOptions {
  stagger?: number;
  from?: 'start' | 'center' | 'end' | 'edges';
}

export interface ParallaxOptions extends AnimationOptions {
  speed?: number;
  direction?: 'vertical' | 'horizontal';
  smooth?: boolean;
  bounds?: { start?: string; end?: string };
}

// Fixed ScrollTriggerOptions - callbacks are optional
export interface ScrollTriggerOptions extends AnimationOptions {
 start?: string;
  end?: string;
  scrub?: boolean | number;
  pin?: boolean;
  snap?: boolean | number | number[];
  markers?: boolean;
  priority?: number;
  // All callbacks remain optional - no Required wrapper needed
}

// Fixed TextRevealOptions - callbacks are optional  
export interface TextRevealOptions extends AnimationOptions, TriggerOptions {
  type?: 'chars' | 'words' | 'lines' | 'sentences';
  preserveSpaces?: boolean;
  // Callbacks inherited from AnimationOptions are already optional
}

// Fixed MorphingOptions - callbacks are optional
export interface MorphingOptions extends AnimationOptions {
  morphType?: 'transform' | 'path' | 'color' | 'shape' | 'liquid' | 'elastic';
  colorInterpolation?: 'rgb' | 'hsl' | 'lab';
  pathResolution?: number;
  smoothing?: number;
  // All callbacks remain optional from AnimationOptions
}

export interface AnimationInstance {
  element: HTMLElement;
  timeline?: gsap.core.Timeline;
  options: AnimationOptions;
  destroy: () => void;
  play: () => void;
  pause: () => void;
  restart: () => void;
  reverse: () => void;
  progress: (value?: number) => number | void;
}

// Fixed ScrollTriggerInstance - no Required wrapper
export interface ScrollTriggerInstance {
  element: HTMLElement;
  scrollTrigger: ScrollTrigger | null;
  timeline: gsap.core.Timeline;
  options: ScrollTriggerOptions; // Not Required<ScrollTriggerOptions>
  id?: string;
  isDestroyed?: boolean;
  destroy: () => void;
  enable: () => boolean;
  disable: () => boolean;
  refresh: () => boolean;
  progress: (value?: number) => number;
  updateTrigger?: (options: Partial<ScrollTriggerOptions>) => boolean;
}