import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ScrollTriggerOptions, ScrollTriggerInstance } from '../../types/core';

// Register ScrollTrigger plugin (free)
gsap.registerPlugin(ScrollTrigger);

export class ScrollTriggerAnimation {
  private element: HTMLElement;
  private timeline: gsap.core.Timeline;
  private scrollTrigger: ScrollTrigger | null = null;
  private options: ScrollTriggerOptions & {
    duration: number;
    ease: string;
    start: string;
    end: string;
    scrub: boolean | number;
    pin: boolean;
    snap: boolean | number | number[];
    markers: boolean;
    delay: number;
    repeat: number;
    yoyo: boolean;
  };
  private isDestroyed = false;
  private animationId: string;

  constructor(
    element: HTMLElement, 
    fromVars: gsap.TweenVars,
    toVars: gsap.TweenVars,
    options: ScrollTriggerOptions = {}
  ) {
    this.element = element;
    this.animationId = `st_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.options = {
      duration: Math.max(0.1, options.duration ?? 1),
      ease: this.validateEase(options.ease) ?? 'power2.out',
      start: options.start ?? 'top 80%',
      end: options.end ?? 'bottom 20%',
      scrub: options.scrub ?? false,
      pin: options.pin ?? false,
      snap: this.validateSnap(options.snap) ?? false,
      markers: options.markers ?? false,
      delay: Math.max(0, options.delay ?? 0),
      repeat: Math.max(-1, options.repeat ?? 0),
      yoyo: options.yoyo ?? false,
      onComplete: options.onComplete,
      onStart: options.onStart,
      onUpdate: options.onUpdate
    };
    
    this.timeline = gsap.timeline({ paused: true });
    this.initialize(fromVars, toVars);
  }

  private validateEase(ease?: string): string | undefined {
    if (!ease) return undefined;
    
    const validEases = [
      'none', 'power1', 'power2', 'power3', 'power4',
      'back', 'elastic', 'bounce', 'circ', 'expo', 'sine'
    ];
    
    const easeTypes = ['.in', '.out', '.inOut'];
    const isValidEase = validEases.some(validEase => 
      ease.startsWith(validEase) || 
      easeTypes.some(type => ease === validEase + type)
    );
    
    return isValidEase ? ease : 'power2.out';
  }

  private validateSnap(snap?: boolean | number | number[]): number | number[] | undefined {
  if (typeof snap === 'boolean') {
    return snap ? 0.1 : undefined; // Convert true to 0.1 (default snap value), false to undefined
  }
  if (typeof snap === 'number') {
    return Math.max(0, snap);
  }
  if (Array.isArray(snap)) {
    return snap.filter(n => typeof n === 'number' && n >= 0);
  }
  return undefined;
}

  private initialize(fromVars: gsap.TweenVars, toVars: gsap.TweenVars): void {
    try {
      const safeFromVars = this.sanitizeVars(fromVars);
      const safeToVars = this.sanitizeVars(toVars);
      
      gsap.set(this.element, safeFromVars);

      this.timeline.to(this.element, {
        ...safeToVars,
        duration: this.options.duration,
        ease: this.options.ease,
        delay: this.options.delay,
        repeat: this.options.repeat,
        yoyo: this.options.yoyo,
        onComplete: this.options.onComplete
      });

      this.scrollTrigger = ScrollTrigger.create({
        trigger: this.element,
        start: this.options.start,
        end: this.options.end,
        scrub: this.options.scrub,
        pin: this.options.pin,
        snap: this.options.snap,
        markers: this.options.markers,
        animation: this.timeline,
        id: this.animationId,
        
        onEnter: this.createSafeCallback(() => {
          if (!this.options.scrub && !this.isDestroyed) {
            this.timeline.play();
          }
          this.options.onStart?.();
        }),
        
        onLeave: this.createSafeCallback(() => {
          if (!this.options.scrub && !this.isDestroyed) {
            this.timeline.reverse();
          }
        }),
        
        onEnterBack: this.createSafeCallback(() => {
          if (!this.options.scrub && !this.isDestroyed) {
            this.timeline.play();
          }
        }),
        
        onLeaveBack: this.createSafeCallback(() => {
          if (!this.options.scrub && !this.isDestroyed) {
            this.timeline.reverse();
          }
        }),
        
        onUpdate: this.createSafeCallback((self: ScrollTrigger) => {
          if (!this.isDestroyed) {
            this.options.onUpdate?.(self.progress);
          }
        }),

        onRefresh: () => {
          if (this.isDestroyed) return;
          this.handleRefresh();
        }
      });

    } catch (error) {
      console.error('ScrollTrigger initialization failed:', error);
      this.handleInitializationError(error);
    }
  }

  private sanitizeVars(vars: gsap.TweenVars): gsap.TweenVars {
    const sanitized: gsap.TweenVars = {};
    
    const safeProps = [
      'x', 'y', 'z', 'rotation', 'rotationX', 'rotationY', 'rotationZ',
      'scaleX', 'scaleY', 'scale', 'skewX', 'skewY', 'opacity',
      'width', 'height', 'left', 'top', 'right', 'bottom',
      'backgroundColor', 'color', 'borderColor', 'borderWidth'
    ];

    Object.keys(vars).forEach(key => {
      if (safeProps.includes(key) && vars[key] !== undefined) {
        sanitized[key] = vars[key];
      }
    });

    return sanitized;
  }

  private createSafeCallback<T extends any[]>(callback: (...args: T) => void) {
    return (...args: T) => {
      try {
        if (!this.isDestroyed) {
          callback(...args);
        }
      } catch (error) {
        console.error('ScrollTrigger callback error:', error);
      }
    };
  }

  private handleRefresh(): void {
    if (this.scrollTrigger && !this.isDestroyed) {
      this.scrollTrigger.refresh();
    }
  }

  private handleInitializationError(error: any): void {
    this.isDestroyed = true;
    console.error(`ScrollTrigger failed to initialize for element:`, this.element, error);
  }

  updateTrigger(options: Partial<ScrollTriggerOptions>): boolean {
    if (this.isDestroyed) return false;

    try {
      const newOptions = { 
        ...this.options, 
        ...options,
        duration: options.duration !== undefined ? Math.max(0.1, options.duration) : this.options.duration,
        ease: options.ease ? this.validateEase(options.ease) || this.options.ease : this.options.ease,
        snap: options.snap !== undefined ? this.validateSnap(options.snap) || this.options.snap : this.options.snap
      };
      
      this.options = newOptions;
      this.refresh();
      return true;
    } catch (error) {
      console.error('Failed to update trigger:', error);
      return false;
    }
  }

  refresh(): boolean {
    if (!this.scrollTrigger || this.isDestroyed) return false;
    
    try {
      this.scrollTrigger.refresh();
      return true;
    } catch (error) {
      console.error('Failed to refresh ScrollTrigger:', error);
      return false;
    }
  }

  enable(): boolean {
    if (!this.scrollTrigger || this.isDestroyed) return false;
    
    try {
      this.scrollTrigger.enable();
      return true;
    } catch (error) {
      console.error('Failed to enable ScrollTrigger:', error);
      return false;
    }
  }

  disable(): boolean {
    if (!this.scrollTrigger || this.isDestroyed) return false;
    
    try {
      this.scrollTrigger.disable();
      return true;
    } catch (error) {
      console.error('Failed to disable ScrollTrigger:', error);
      return false;
    }
  }

  progress(value?: number): number {
    if (this.isDestroyed || !this.scrollTrigger) return 0;
    
    try {
      if (value !== undefined) {
        const clampedValue = Math.max(0, Math.min(1, value));
        this.scrollTrigger.scroll(clampedValue); // Use scroll() to set progress indirectly
        return clampedValue;
      }
      return this.scrollTrigger.progress; // Getter works directly
    } catch (error) {
      console.error('Failed to get/set progress:', error);
      return 0;
    }
  }

  destroy(): void {
    if (this.isDestroyed) return;
    
    try {
      this.isDestroyed = true;
      
      if (this.timeline) {
        this.timeline.kill();
      }
      
      if (this.scrollTrigger) {
        this.scrollTrigger.kill();
        this.scrollTrigger = null;
      }
      
      this.element = null as any;
      this.timeline = null as any;
      
    } catch (error) {
      console.error('Error during destroy:', error);
    }
  }

  getInstance(): ScrollTriggerInstance {
    return {
      element: this.element,
      scrollTrigger: this.scrollTrigger,
      timeline: this.timeline,
      options: { ...this.options },
      id: this.animationId,
      isDestroyed: this.isDestroyed,
      destroy: this.destroy.bind(this),
      enable: this.enable.bind(this),
      disable: this.disable.bind(this),
      refresh: this.refresh.bind(this),
      progress: this.progress.bind(this),
      updateTrigger: this.updateTrigger.bind(this)
    };
  }

  isActive(): boolean {
    return !this.isDestroyed && this.scrollTrigger !== null;
  }

  getElement(): HTMLElement | null {
    return this.isDestroyed ? null : this.element;
  }

  getId(): string {
    return this.animationId;
  }
}

export function createScrollTriggerAnimation(
  element: HTMLElement | string,
  fromVars: gsap.TweenVars,
  toVars: gsap.TweenVars,
  options: ScrollTriggerOptions = {}
): ScrollTriggerAnimation {
  try {
    const el = typeof element === 'string' ? 
      document.querySelector(element) as HTMLElement : 
      element;
      
    if (!el) {
      throw new Error(`Element not found: ${element}`);
    }
    
    if (!fromVars || typeof fromVars !== 'object') {
      throw new Error('fromVars must be a valid object');
    }
    
    if (!toVars || typeof toVars !== 'object') {
      throw new Error('toVars must be a valid object');
    }
    
    return new ScrollTriggerAnimation(el, fromVars, toVars, options);
    
  } catch (error) {
    console.error('Failed to create ScrollTrigger animation:', error);
    throw error;
  }
}

export function createScrollTriggerBatch(
  elements: (HTMLElement | string)[],
  fromVars: gsap.TweenVars,
  toVars: gsap.TweenVars,
  options: ScrollTriggerOptions = {}
): ScrollTriggerAnimation[] {
  const animations: ScrollTriggerAnimation[] = [];
  
  elements.forEach((element, index) => {
    try {
      const animation = createScrollTriggerAnimation(
        element, 
        fromVars, 
        toVars, 
        {
          ...options,
          delay: (options.delay || 0) + (index * 0.1)
        }
      );
      animations.push(animation);
    } catch (error) {
      console.warn(`Failed to create animation for element at index ${index}:`, error);
    }
  });
  
  return animations;
}