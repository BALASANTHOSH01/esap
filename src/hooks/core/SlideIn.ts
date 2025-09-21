import { gsap } from "gsap";
import { BaseAnimation } from "../../core/BaseAnimation";
import type { SlideInOptions, Vector3 } from "../../types/core";

// Focused, extended options without over-engineering
interface EnhancedSlideInOptions extends Omit<SlideInOptions, 'direction'> {
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  
  // Only add genuinely useful enhancements
  stagger?: {
    selector?: string;
    amount?: number;
    from?: "start" | "center" | "end";
  };
  
  overshoot?: {
    amount?: number;
    duration?: number;
  };
  
  // Simple blur effect
  blur?: {
    from?: number;
    to?: number;
  };
  
  // Performance settings
  gpu?: boolean;
  respectReducedMotion?: boolean;
}

export class SlideIn extends BaseAnimation {
  private slideOptions: EnhancedSlideInOptions;
  private childElements: HTMLElement[] = [];
  private resizeObserver?: ResizeObserver;

  constructor(element: HTMLElement, options: EnhancedSlideInOptions = {}) {
    // Clean, focused defaults - ensure direction is set
    const enhancedOptions: EnhancedSlideInOptions = {
      direction: options.direction || "up", // Fix: ensure direction is always set
      distance: options.distance ?? 50,     // Fix: use nullish coalescing
      duration: options.duration ?? 1,
      ease: options.ease || "power2.out",
      gpu: options.gpu ?? true,
      respectReducedMotion: options.respectReducedMotion ?? true,
      ...options,
    };

    super(element, enhancedOptions);
    this.slideOptions = enhancedOptions;

    // Simple reduced motion check
    if (this.slideOptions.respectReducedMotion && this.prefersReducedMotion()) {
      this.slideOptions.duration = 0.15;
      this.slideOptions.blur = undefined;
      this.slideOptions.overshoot = undefined;
    }

    this.initializeFeatures();
  }

  private prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  protected initializeFeatures(): void {
    // GPU optimization
    if (this.slideOptions.gpu) {
      this.element.style.willChange = "transform, opacity";
      this.element.style.transform = "translateZ(0)";
    }

    // Setup stagger children if specified
    if (this.slideOptions.stagger) {
      this.setupStaggerChildren();
    }

    // Setup resize observer for responsive behavior
    this.setupResizeObserver();
  }

  protected setupStaggerChildren(): void {
    const stagger = this.slideOptions.stagger!;
    const selector = stagger.selector || "> *";
    
    this.childElements = Array.from(
      this.element.querySelectorAll(selector)
    ) as HTMLElement[];

    // Set initial state for children
    this.childElements.forEach(child => {
      const initialProps = this.getInitialProps();
      gsap.set(child, initialProps);
    });
  }

  protected setupResizeObserver(): void {
    if (!window.ResizeObserver) return;

    this.resizeObserver = new ResizeObserver(() => {
      // Fix: Check if timeline exists and has isActive method
      if (this.timeline && typeof this.timeline.isActive === 'function' && this.timeline.isActive()) {
        if (typeof this.timeline.invalidate === 'function') {
          this.timeline.invalidate();
        }
      }
    });

    this.resizeObserver.observe(this.element);
  }

  protected createAnimation(): void {
    // Get initial and target properties
    const fromProps = this.getInitialProps();
    const toProps = this.getTargetProps();

    // Set initial state
    gsap.set(this.element, fromProps);

    // Create main animation
    this.timeline.to(this.element, {
      ...toProps,
      duration: this.slideOptions.duration,
      ease: this.slideOptions.ease,
    });

    // Add blur animation if specified
    if (this.slideOptions.blur) {
      this.addBlurAnimation();
    }

    // Add overshoot effect if specified
    if (this.slideOptions.overshoot) {
      this.addOvershootAnimation();
    }

    // Add stagger animation if children exist
    if (this.childElements.length > 0) {
      this.addStaggerAnimation();
    }
  }

  protected getInitialProps(): gsap.TweenVars {
    const { direction, distance } = this.slideOptions;
    const props: gsap.TweenVars = { opacity: 0 };
    const slideDistance = distance ?? 50; // Fix: ensure distance is always a number

    switch (direction) {
      case "up":
        props.y = slideDistance;
        break;
      case "down":
        props.y = -slideDistance; // Fix: use slideDistance consistently
        break;
      case "left":
        props.x = slideDistance;
        break;
      case "right":
        props.x = -slideDistance; // Fix: use slideDistance consistently
        break;
    }

    // Add initial blur if specified
    if (this.slideOptions.blur) {
      props.filter = `blur(${this.slideOptions.blur.from ?? 10}px)`; // Fix: use nullish coalescing
    }

    return props;
  }

  protected getTargetProps(): gsap.TweenVars {
    const props: gsap.TweenVars = {
      opacity: 1,
      x: 0,
      y: 0,
    };

    // Add target blur if specified
    if (this.slideOptions.blur) {
      props.filter = `blur(${this.slideOptions.blur.to ?? 0}px)`; // Fix: use nullish coalescing
    }

    return props;
  }

  protected addBlurAnimation(): void {
    if (!this.slideOptions.blur) return;

    this.timeline.fromTo(
      this.element,
      {
        filter: `blur(${this.slideOptions.blur.from ?? 10}px)`, // Fix: use nullish coalescing
      },
      {
        filter: `blur(${this.slideOptions.blur.to ?? 0}px)`, // Fix: use nullish coalescing
        duration: this.slideOptions.duration,
        ease: this.slideOptions.ease,
      },
      0
    );
  }

  protected addOvershootAnimation(): void {
    if (!this.slideOptions.overshoot) return;

    const overshoot = this.slideOptions.overshoot;
    const { direction } = this.slideOptions;
    const overshootProps: gsap.TweenVars = {};
    const overshootAmount = overshoot.amount ?? 20; // Fix: ensure amount is always a number

    // Calculate overshoot direction
    switch (direction) {
      case "up":
        overshootProps.y = -overshootAmount;
        break;
      case "down":
        overshootProps.y = overshootAmount;
        break;
      case "left":
        overshootProps.x = -overshootAmount;
        break;
      case "right":
        overshootProps.x = overshootAmount;
        break;
    }

    // Add overshoot to timeline
    this.timeline
      .to(this.element, {
        ...overshootProps,
        duration: overshoot.duration ?? 0.3, // Fix: use nullish coalescing
        ease: "back.out(1.7)",
      })
      .to(this.element, {
        x: 0,
        y: 0,
        duration: 0.2,
        ease: "power2.out",
      });
  }

  protected addStaggerAnimation(): void {
    if (!this.slideOptions.stagger) return;

    const stagger = this.slideOptions.stagger;
    const targetProps = this.getTargetProps();
    const animationDuration = this.slideOptions.duration ?? 1; // Fix: ensure duration is always a number

    this.timeline.to(
      this.childElements,
      {
        ...targetProps,
        duration: animationDuration * 0.8,
        ease: this.slideOptions.ease,
        stagger: {
          amount: stagger.amount ?? 0.3, // Fix: use nullish coalescing
          from: stagger.from ?? "start", // Fix: use nullish coalescing
        },
      },
      animationDuration * 0.2
    );
  }

  // Helper methods for common use cases
  slideInWithCallback(callback: () => void): void {
    if (this.timeline && typeof this.timeline.eventCallback === 'function') {
      this.timeline.eventCallback("onComplete", callback);
    }
    this.play();
  }

  setDistance(distance: number): void {
    this.slideOptions.distance = distance;
    // Recreate animation with new distance
    if (this.timeline && typeof this.timeline.clear === 'function') {
      this.timeline.clear();
    }
    this.createAnimation();
  }

  getCurrentPosition(): Vector3 {
    // Fix: Add proper error handling for gsap.getProperty
    const getPos = (prop: string): number => {
      try {
        return (gsap.getProperty(this.element, prop) as number) || 0;
      } catch {
        return 0;
      }
    };

    return {
      x: getPos("x"),
      y: getPos("y"),
      z: 0,
    };
  }

  // Clean destroy method
  destroy(): void {
    // Clean up resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }

    // Reset GPU optimization
    if (this.slideOptions.gpu && this.element) {
      this.element.style.willChange = "auto";
    }

    // Reset transform
    if (this.element) {
      this.element.style.transform = "";
    }

    // Call parent destroy
    super.destroy();
  }
}

// Simple factory function
export function createSlideIn(
  element: HTMLElement | string,
  options: EnhancedSlideInOptions = {}
): SlideIn {
  const el = typeof element === "string"
    ? document.querySelector(element) as HTMLElement
    : element;

  if (!el) {
    throw new Error(`SlideIn: Element not found - ${element}`);
  }

  return new SlideIn(el, options);
}

// Batch creation utility
export function createBatchSlideIn(
  elements: HTMLElement[] | NodeList | string,
  options: EnhancedSlideInOptions = {}
): SlideIn[] {
  const elementsArray = typeof elements === "string"
    ? Array.from(document.querySelectorAll(elements))
    : Array.from(elements);

  return elementsArray
    .filter((el): el is HTMLElement => el instanceof HTMLElement)
    .map(el => new SlideIn(el, options));
}

// Focused presets without bloat
export const SlideInPresets = {
  quick: {
    duration: 0.4,
    ease: "power2.out",
    direction: "up" as const,
  } as EnhancedSlideInOptions,

  smooth: {
    duration: 1.2,
    ease: "power2.out",
    blur: { from: 5, to: 0 },
    direction: "up" as const,
  } as EnhancedSlideInOptions,

  bouncy: {
    duration: 1,
    ease: "back.out(1.7)",
    overshoot: { amount: 20, duration: 0.3 },
    direction: "up" as const,
  } as EnhancedSlideInOptions,

  staggered: {
    duration: 0.8,
    stagger: { amount: 0.4, from: "start" },
    direction: "up" as const,
  } as EnhancedSlideInOptions,

  accessible: {
    duration: 0.6,
    respectReducedMotion: true,
    ease: "power2.out",
    direction: "up" as const,
  } as EnhancedSlideInOptions,
};