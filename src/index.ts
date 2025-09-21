import AdvancedAnimationEngine from './core/AnimationEngine';
import { AnimationManager } from './core/AnimationManager';

// Core exports
export { AdvancedAnimationEngine } from './core/AnimationEngine';
export { AnimationManager } from './core/AnimationManager';
export { BaseAnimation } from './core/BaseAnimation';

// Animation classes
export { FadeIn, createFadeIn } from './hooks/core/FadeIn';
export { SlideIn, createSlideIn } from './hooks/core/SlideIn';
export { Stagger, createStagger } from './hooks/core/Stagger';
export { Parallax, createParallax } from './hooks/core/Parallax';
export { TextReveal, createTextReveal } from './hooks/core/TextReveal';
export { Morphing, createAdvancedMorphing } from './hooks/core/Morphing';
export { ScrollTriggerAnimation, createScrollTriggerAnimation } from './hooks/core/ScrollTriggerAnimation';

// Utilities
export { AnimationHelpers } from './utils/helpers';

// Type exports - using type-only imports
export type {
  AnimationOptions,
  TriggerOptions,
  FadeInOptions,
  SlideInOptions,
  StaggerOptions,
  ParallaxOptions,
  MorphingOptions,
  ScrollTriggerOptions,
  TextRevealOptions,
  AnimationInstance,
  ScrollTriggerInstance
} from './types/core';

// ESAP class with corrected references
export class ESAP {
  private manager: AnimationManager;

  constructor() {
    this.manager = AnimationManager.getInstance();
  }

  // Core animation methods with proper typing
  fadeIn(element: HTMLElement | string, options: import('./types/core').FadeInOptions = {}): string {
    return this.manager.fadeIn(element, options);
  }

  slideIn(element: HTMLElement | string, options: import('./types/core').SlideInOptions): string {
    return this.manager.slideIn(element, options);
  }

  stagger(
    container: HTMLElement | string, 
    selector: string, 
    options: import('./types/core').StaggerOptions = {}
  ): string {
    return this.manager.stagger(container, selector, options);
  }

  parallax(element: HTMLElement | string, options: import('./types/core').ParallaxOptions = {}): string {
    return this.manager.parallax(element, options);
  }

  textReveal(element: HTMLElement | string, options: import('./types/core').TextRevealOptions = {}): string {
    return this.manager.textReveal(element, options);
  }

  morphing(element: HTMLElement | string, options: import('./types/core').MorphingOptions = {}): string {
    return this.manager.morphing(element, options);
  }

  scrollTrigger(
    element: HTMLElement | string,
    fromVars: gsap.TweenVars,
    toVars: gsap.TweenVars,
    options: import('./types/core').ScrollTriggerOptions = {}
  ): string {
    return this.manager.scrollTrigger(element, fromVars, toVars, options);
  }

  // Control methods
  play(id: string): this {
    this.manager.play(id);
    return this;
  }

  pause(id: string): this {
    this.manager.pause(id);
    return this;
  }

  restart(id: string): this {
    this.manager.restart(id);
    return this;
  }

  reverse(id: string): this {
    this.manager.reverse(id);
    return this;
  }

  destroy(id: string): this {
    this.manager.destroy(id);
    return this;
  }

  destroyAll(): this {
    this.manager.destroyAll();
    return this;
  }

  // Utility methods
  setGlobalDuration(duration: number): this {
    AdvancedAnimationEngine.getInstance().setGlobalDuration(duration); // Fixed
    return this;
  }

  setGlobalEase(ease: string): this {
    AdvancedAnimationEngine.getInstance().setGlobalEase(ease); // Fixed
    return this;
  }

  enableDebug(enable: boolean = true): this {
    AdvancedAnimationEngine.getInstance().enableDebugMode(enable); // Fixed
    return this;
  }

  // Get animation instance
  getAnimation(id: string): any {
    return this.manager.getAnimation(id);
  }
}

// Create and export default instance
const esap = new ESAP();
export default esap;