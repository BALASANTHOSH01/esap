import { gsap } from "gsap";
import { BaseAnimation } from "../../core/BaseAnimation";
import type {
  FadeInOptions,
  Vector3,
  PhysicsOptions,
  ParticleSystemOptions,
} from "../../types/core";

// Enhanced FadeIn options with advanced features
interface EnhancedFadeInOptions extends FadeInOptions {
  // Basic fade properties
  from?: number;
  to?: number;
  priority?: number;

  // Advanced visual effects
  blur?: {
    from?: number;
    to?: number;
    unit?: "px" | "rem";
  };

  // Transform effects during fade
  transform?: {
    scale?: { from?: number; to?: number };
    rotation?: { from?: number; to?: number };
    translation?: { from?: Vector3; to?: Vector3 };
  };

  // Color effects
  color?: {
    from?: string;
    to?: string;
    property?: "color" | "backgroundColor" | "borderColor";
  };

  // Advanced easing with custom curves
  customEase?: {
    type: "bounce" | "elastic" | "back" | "expo" | "circ" | "sine";
    strength?: number;
  };

  // Stagger effects for child elements
  staggerChildren?: {
    selector?: string;
    amount?: number;
    from?: "start" | "center" | "end" | "edges" | "random";
    axis?: "x" | "y";
  };

  // Masking effects
  mask?: {
    type: "reveal" | "wipe" | "iris" | "split";
    direction?: "left" | "right" | "up" | "down" | "center";
    shape?: "rectangle" | "circle" | "polygon";
  };

  // Particle effects
  particles?: ParticleSystemOptions & {
    fadeSync?: boolean;
    spawnRate?: number;
  };

  // Audio integration
  audio?: {
    url?: string;
    volume?: number;
    fadeAudio?: boolean;
  };

  // Advanced physics integration
  physics?: PhysicsOptions & {
    fadeBasedForces?: boolean;
    gravitySync?: boolean;
  };

  // Performance optimizations
  performance?: {
    useRAF?: boolean;
    batchUpdates?: boolean;
    skipInvisible?: boolean;
    layerize?: boolean;
    maxFPS?: number;
  };

  // Accessibility features
  accessibility?: {
    respectPrefersReducedMotion?: boolean;
    announceCompletion?: boolean;
    focusOnComplete?: boolean;
    ariaUpdates?: boolean;
    maxAnnouncements?: number;
  };

  // Advanced callbacks with more context
  onProgress?: (
    progress: number,
    element: HTMLElement,
    currentOpacity: number
  ) => void;
  onHalfway?: (element: HTMLElement) => void;
  onBeforeStart?: (element: HTMLElement) => void;
  onAfterComplete?: (element: HTMLElement) => void;

  // Conditional execution
  conditions?: {
    viewport?: boolean;
    mediaQuery?: string;
    elementVisible?: boolean;
    userInteraction?: boolean;
  };

  // CSS safety
  cssMode?: "inline" | "classes" | "cssVariables";
  preserveStyles?: boolean;
}

// Animation queue system
class AnimationQueue {
  private static instance: AnimationQueue;
  private queue: Array<() => void> = [];
  private isProcessing = false;
  private maxConcurrent = 3;
  private currentAnimations = 0;

  static getInstance(): AnimationQueue {
    if (!AnimationQueue.instance) {
      AnimationQueue.instance = new AnimationQueue();
    }
    return AnimationQueue.instance;
  }

  add(animation: () => void, priority = 0): void {
    this.queue.push(animation);
    this.queue.sort((a: any, b: any) => (b.priority || 0) - (a.priority || 0));
    this.process();
  }

  private async process(): Promise<void> {
    if (this.isProcessing || this.currentAnimations >= this.maxConcurrent) return;
    
    this.isProcessing = true;
    
    while (this.queue.length > 0 && this.currentAnimations < this.maxConcurrent) {
      const animation = this.queue.shift();
      if (animation) {
        this.currentAnimations++;
        try {
          await animation();
        } finally {
          this.currentAnimations--;
        }
      }
    }
    
    this.isProcessing = false;
  }
}

// Global AudioContext pool to prevent memory leaks
class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private bufferCache = new Map<string, AudioBuffer>();
  private maxCacheSize = 10;

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  async getAudioContext(): Promise<AudioContext | null> {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      try {
        this.audioContext = new (window.AudioContext || 
          (window as any).webkitAudioContext)();
      } catch {
        return null;
      }
    }
    return this.audioContext;
  }

  async loadAudio(url: string): Promise<AudioBuffer | null> {
    if (this.bufferCache.has(url)) {
      return this.bufferCache.get(url)!;
    }

    const context = await this.getAudioContext();
    if (!context) return null;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await context.decodeAudioData(arrayBuffer);
      
      // Manage cache size
      if (this.bufferCache.size >= this.maxCacheSize) {
        const firstKey = this.bufferCache.keys().next().value;
        if (firstKey) {
          this.bufferCache.delete(firstKey);
        }
      }
      
      this.bufferCache.set(url, audioBuffer);
      return audioBuffer;
    } catch {
      return null;
    }
  }

  cleanup(): void {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    this.bufferCache.clear();
  }
}

// Accessibility announcement manager
class A11yAnnouncer {
  private static instance: A11yAnnouncer;
  private announcements: string[] = [];
  private maxAnnouncements = 3;
  private cooldownMs = 1000;
  private lastAnnouncement = 0;

  static getInstance(): A11yAnnouncer {
    if (!A11yAnnouncer.instance) {
      A11yAnnouncer.instance = new A11yAnnouncer();
    }
    return A11yAnnouncer.instance;
  }

  announce(message: string, maxAnnouncements?: number): void {
    const now = Date.now();
    const limit = maxAnnouncements || this.maxAnnouncements;
    
    // Prevent spam
    if (now - this.lastAnnouncement < this.cooldownMs) return;
    if (this.announcements.length >= limit) return;

    this.announcements.push(message);
    this.lastAnnouncement = now;

    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.style.cssText = `
      position: absolute !important;
      left: -10000px !important;
      width: 1px !important;
      height: 1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
    `;
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
      const index = this.announcements.indexOf(message);
      if (index > -1) {
        this.announcements.splice(index, 1);
      }
    }, 2000);
  }
}

export class FadeIn extends BaseAnimation {
  // Static tracking for race condition prevention
  private static activeAnimations = new WeakMap<HTMLElement, FadeIn>();
  private static frameRateController = new Map<number, number>();

  private fadeOptions: EnhancedFadeInOptions;
  private childElements: HTMLElement[] = [];
  private audioBuffer: AudioBuffer | null = null;
  private audioSource: AudioBufferSourceNode | null = null;
  private isHalfwayTriggered = false;
  private observerRefs: IntersectionObserver[] = [];
  private mediaQueryList: MediaQueryList | null = null;
  private originalStyles = new Map<string, string>();
  protected isDestroyed = false; // Changed to protected to match BaseAnimation
  private frameRateLimit = 60;
  private lastFrameTime = 0;

  // Cleanup functions for better memory management
  private cleanupFunctions: (() => void)[] = [];

  constructor(element: HTMLElement, options: EnhancedFadeInOptions = {}) {
    // Prevent multiple animations on same element
    const existingAnimation = FadeIn.activeAnimations.get(element);
    if (existingAnimation && !existingAnimation.isDestroyed) {
      console.warn('Destroying existing animation on element');
      existingAnimation.destroy();
    }

    // Enhanced defaults with safety features
    const enhancedOptions = {
      from: 0,
      to: 1,
      duration: 1,
      ease: "power2.out",
      gpu: true,
      willChange: true,
      cssMode: "cssVariables" as const,
      preserveStyles: true,
      accessibility: {
        respectPrefersReducedMotion: true,
        announceCompletion: false,
        focusOnComplete: false,
        ariaUpdates: true,
        maxAnnouncements: 2,
      },
      performance: {
        useRAF: true,
        batchUpdates: true,
        skipInvisible: true,
        layerize: true,
        maxFPS: 60,
      },
      ...options,
    };

    super(element, enhancedOptions);
    this.fadeOptions = enhancedOptions;
    this.frameRateLimit = enhancedOptions.performance?.maxFPS || 60;

    // Register this animation
    FadeIn.activeAnimations.set(element, this);

    // Preserve original styles if requested
    if (this.fadeOptions.preserveStyles) {
      this.preserveOriginalStyles();
    }

    this.initializeWithErrorHandling();
  }

  private preserveOriginalStyles(): void {
    const computedStyles = window.getComputedStyle(this.element);
    const propertiesToPreserve = [
      'opacity', 'transform', 'filter', 'clip-path', 
      'will-change', 'backface-visibility'
    ];

    propertiesToPreserve.forEach(prop => {
      this.originalStyles.set(prop, computedStyles.getPropertyValue(prop));
    });
  }

  private initializeWithErrorHandling(): void {
    try {
      this.initializeAdvancedFeatures();
      this.setupAccessibility();
      
      // Queue the animation instead of running immediately
      const queue = AnimationQueue.getInstance();
      queue.add(() => this.conditionalStart(), this.fadeOptions.priority);
      
    } catch (error) {
      console.error('FadeIn initialization failed:', error);
      this.fallbackToBasicFade();
    }
  }

  private fallbackToBasicFade(): void {
    // Simple fallback animation without advanced features
    gsap.fromTo(this.element, 
      { opacity: this.fadeOptions.from || 0 },
      { 
        opacity: this.fadeOptions.to || 1,
        duration: this.fadeOptions.duration || 1,
        ease: this.fadeOptions.ease || "power2.out"
      }
    );
  }

  private conditionalStart(): Promise<void> {
    return new Promise((resolve) => {
      if (this.checkConditions()) {
        this.play();
        resolve();
      } else {
        // Setup listeners for condition changes
        this.setupConditionListeners(resolve);
      }
    });
  }

  private setupConditionListeners(resolve: () => void): void {
    const conditions = this.fadeOptions.conditions;
    if (!conditions) return;

    // Media query listener
    if (conditions.mediaQuery) {
      this.mediaQueryList = window.matchMedia(conditions.mediaQuery);
      const handler = () => {
        if (this.mediaQueryList!.matches && this.checkConditions()) {
          this.play();
          resolve();
        }
      };
      this.mediaQueryList.addListener(handler);
      this.cleanupFunctions.push(() => {
        this.mediaQueryList?.removeListener(handler);
      });
    }
  }

  protected initializeAdvancedFeatures(): void {
    // Setup child elements for stagger with error handling
    if (this.fadeOptions.staggerChildren) {
      this.setupChildStaggerSafely();
    }

    // Setup audio with improved error handling
    if (this.fadeOptions.audio?.url) {
      this.setupAudioSafely();
    }

    // Setup particles if specified
    if (this.fadeOptions.particles) {
      this.setupParticlesSafely();
    }

    // Setup masking effects with fallback
    if (this.fadeOptions.mask) {
      this.setupMaskSafely();
    }

    // Setup performance optimizations
    if (this.fadeOptions.performance?.layerize) {
      this.optimizeForAnimation();
    }
  }

  private setupChildStaggerSafely(): void {
    try {
      const stagger = this.fadeOptions.staggerChildren!;
      const selector = stagger.selector || "*";

      const elements = this.element.querySelectorAll(selector);
      this.childElements = Array.from(elements).filter(
        (el): el is HTMLElement => el instanceof HTMLElement
      );

      // Prepare children for animation with error handling
      this.childElements.forEach((child, index) => {
        try {
          this.setCSSProperty(child, 'opacity', String(this.fadeOptions.from || 0));

          // Add performance optimizations
          if (this.fadeOptions.performance?.layerize) {
            this.setCSSProperty(child, 'will-change', 'transform, opacity');
            this.setCSSProperty(child, 'transform', 'translateZ(0)');
          }
        } catch (error) {
          console.warn(`Failed to setup child ${index}:`, error);
        }
      });
    } catch (error) {
      console.warn('Failed to setup child stagger:', error);
      this.childElements = [];
    }
  }

  private async setupAudioSafely(): Promise<void> {
    if (!this.fadeOptions.audio?.url) return;

    try {
      const audioManager = AudioManager.getInstance();
      this.audioBuffer = await audioManager.loadAudio(this.fadeOptions.audio.url);
      
      if (!this.audioBuffer) {
        console.warn('Failed to load audio, continuing without sound');
      }
    } catch (error) {
      console.warn('Audio setup failed:', error);
      this.audioBuffer = null;
    }
  }

  private setupParticlesSafely(): void {
    if (!this.fadeOptions.particles || !this.options.threeDimensional) return;

    try {
      // Create particle system using the 3D integration
      const particleSystem = this.createParticleSystem({
        count: this.fadeOptions.particles.count || 100,
        spread: this.fadeOptions.particles.spread || 5,
        size: this.fadeOptions.particles.size || 0.05,
        opacity: this.fadeOptions.particles.opacity || 0.5,
        duration: this.fadeOptions.particles.duration || this.fadeOptions.duration,
      });

      if (particleSystem && this.fadeOptions.particles.fadeSync) {
        // Sync particle opacity with main fade
        gsap.to(particleSystem.material, {
          opacity: this.fadeOptions.to || 1,
          duration: this.fadeOptions.duration,
          ease: this.fadeOptions.ease,
        });
      }
    } catch (error) {
      console.warn('Particle setup failed:', error);
    }
  }

  private setupMaskSafely(): void {
    try {
      const mask = this.fadeOptions.mask!;
      
      // Check for CSS support before applying
      if (!this.supportsCSSFeature('clip-path')) {
        console.warn('clip-path not supported, skipping mask');
        return;
      }

      switch (mask.type) {
        case "reveal":
          this.setupRevealMask(mask);
          break;
        case "wipe":
          this.setupWipeMask(mask);
          break;
        case "iris":
          this.setupIrisMask(mask);
          break;
        case "split":
          this.setupSplitMask(mask);
          break;
      }
    } catch (error) {
      console.warn('Mask setup failed:', error);
    }
  }

  private supportsCSSFeature(property: string): boolean {
    const testElement = document.createElement('div');
    const capitalizedProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    
    return (
      property in testElement.style ||
      capitalizedProperty in testElement.style ||
      `webkit${capitalizedProperty.charAt(0).toUpperCase()}${capitalizedProperty.slice(1)}` in testElement.style
    );
  }

  private setupRevealMask(mask: NonNullable<EnhancedFadeInOptions["mask"]>): void {
    const maskElement = document.createElement("div");
    const rect = this.element.getBoundingClientRect();

    maskElement.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: black;
      pointer-events: none;
      z-index: 1;
    `;

    this.element.style.position = this.element.style.position || "relative";
    this.element.appendChild(maskElement);

    // Store for cleanup
    maskElement.setAttribute('data-fade-mask', 'true');

    // Animate mask reveal
    const direction = mask.direction || "right";
    const transform = this.getMaskTransform(direction, rect);

    gsap.fromTo(
      maskElement,
      { ...transform.from },
      {
        ...transform.to,
        duration: this.fadeOptions.duration,
        ease: this.fadeOptions.ease,
      }
    );
  }

  private setupWipeMask(mask: NonNullable<EnhancedFadeInOptions["mask"]>): void {
    const direction = mask.direction || "left";
    const clipValues = {
      left: "inset(0 100% 0 0)",
      right: "inset(0 0 0 100%)",
      up: "inset(100% 0 0 0)",
      down: "inset(0 0 100% 0)",
    };

    this.setCSSProperty(this.element, 'clip-path', clipValues[direction as keyof typeof clipValues]);

    gsap.to(this.element, {
      clipPath: "inset(0 0 0 0)",
      duration: this.fadeOptions.duration,
      ease: this.fadeOptions.ease,
    });
  }

  private setupIrisMask(mask: NonNullable<EnhancedFadeInOptions["mask"]>): void {
    const shape = mask.shape || "circle";
    const startValue = shape === "circle"
      ? "circle(0% at 50% 50%)"
      : "ellipse(0% 0% at 50% 50%)";
    const endValue = shape === "circle"
      ? "circle(100% at 50% 50%)"
      : "ellipse(100% 100% at 50% 50%)";

    this.setCSSProperty(this.element, 'clip-path', startValue);

    gsap.to(this.element, {
      clipPath: endValue,
      duration: this.fadeOptions.duration,
      ease: this.fadeOptions.ease,
    });
  }

  private setupSplitMask(mask: NonNullable<EnhancedFadeInOptions["mask"]>): void {
    this.setCSSProperty(this.element, 'clip-path', "inset(0 50% 0 50%)");

    gsap.to(this.element, {
      clipPath: "inset(0 0 0 0)",
      duration: this.fadeOptions.duration,
      ease: this.fadeOptions.ease,
    });
  }

  private getMaskTransform(direction: string, rect: DOMRect): { from: any; to: any } {
    const transforms = {
      left: { from: { x: 0 }, to: { x: -rect.width } },
      right: { from: { x: 0 }, to: { x: rect.width } },
      up: { from: { y: 0 }, to: { y: -rect.height } },
      down: { from: { y: 0 }, to: { y: rect.height } },
    };

    return transforms[direction as keyof typeof transforms] || transforms.right;
  }

  private setCSSProperty(element: HTMLElement, property: string, value: string): void {
    const mode = this.fadeOptions.cssMode || 'cssVariables';
    
    switch (mode) {
      case 'inline':
        (element.style as any)[property.replace(/-([a-z])/g, (g: string) => g[1].toUpperCase())] = value;
        break;
      
      case 'classes':
        // Would require pre-defined CSS classes
        element.classList.add(`fade-${property}-${value}`);
        break;
      
      case 'cssVariables':
        element.style.setProperty(`--fade-${property}`, value);
        break;
    }
  }

  private optimizeForAnimation(): void {
    // Use CSS variables to avoid inline style conflicts
    this.setCSSProperty(this.element, 'will-change', 'transform, opacity');
    this.setCSSProperty(this.element, 'transform', 'translateZ(0)');
    this.setCSSProperty(this.element, 'backface-visibility', 'hidden');
    this.setCSSProperty(this.element, 'isolation', 'isolate');
    
    // Use contain with broader support
    if (this.supportsCSSFeature('contain')) {
      this.setCSSProperty(this.element, 'contain', 'layout style');
    }
  }

  private setupAccessibility(): void {
    const a11y = this.fadeOptions.accessibility!;

    // Respect reduced motion preference with proper fallback
    if (a11y.respectPrefersReducedMotion) {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (prefersReducedMotion.matches) {
        this.fadeOptions.duration = 0.01; // Nearly instant
        this.fadeOptions.ease = "none";
        
        // Disable advanced effects
        this.fadeOptions.blur = undefined;
        this.fadeOptions.transform = undefined;
        this.fadeOptions.particles = undefined;
      }
    }

    // Setup ARIA updates with error handling
    if (a11y.ariaUpdates) {
      try {
        this.element.setAttribute("aria-hidden", "true");
      } catch (error) {
        console.warn('Failed to set ARIA attributes:', error);
      }
    }
  }

  private checkConditions(): boolean {
    const conditions = this.fadeOptions.conditions;
    if (!conditions) return true;

    try {
      // Check viewport condition
      if (conditions.viewport && !this.isInViewport()) {
        this.setupViewportObserver();
        return false;
      }

      // Check media query condition
      if (conditions.mediaQuery && !window.matchMedia(conditions.mediaQuery).matches) {
        return false;
      }

      // Check element visibility condition
      if (conditions.elementVisible && !this.isElementVisible()) {
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Condition check failed:', error);
      return true; // Default to allowing animation
    }
  }

  private isInViewport(): boolean {
    try {
      const rect = this.element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
      );
    } catch {
      return true; // Default to true if check fails
    }
  }

  private isElementVisible(): boolean {
    try {
      return this.element.offsetParent !== null;
    } catch {
      return true; // Default to true if check fails
    }
  }

  private setupViewportObserver(): void {
    try {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && this.checkConditions()) {
              this.play();
              observer.disconnect();
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(this.element);
      this.observerRefs.push(observer);
      
      // Add to cleanup
      this.cleanupFunctions.push(() => observer.disconnect());
    } catch (error) {
      console.warn('Failed to setup viewport observer:', error);
    }
  }

  protected createAnimation(): void {
    if (this.isDestroyed) return;

    try {
      // Frame rate limiting
      const now = performance.now();
      if (now - this.lastFrameTime < 1000 / this.frameRateLimit) {
        requestAnimationFrame(() => this.createAnimation());
        return;
      }
      this.lastFrameTime = now;

      // Call beforeStart callback
      this.fadeOptions.onBeforeStart?.(this.element);

      // Create master timeline with enhanced error handling
      const tl = gsap.timeline({
        onStart: () => {
          if (!this.isDestroyed) {
            this.playAudioSafely();
            this.options.onStart?.();
          }
        },
        onUpdate: () => {
          if (this.isDestroyed) return;
          
          try {
            const progress = tl.progress();
            const currentOpacity = gsap.getProperty(this.element, "opacity") as number;

            this.fadeOptions.onProgress?.(progress, this.element, currentOpacity);
            this.options.onUpdate?.(progress);

            // Trigger halfway callback
            if (progress >= 0.5 && !this.isHalfwayTriggered) {
              this.isHalfwayTriggered = true;
              this.fadeOptions.onHalfway?.(this.element);
            }

            // Update physics if synced
            this.updatePhysicsSync(progress);
          } catch (error) {
            console.warn('Animation update error:', error);
          }
        },
        onComplete: () => {
          if (!this.isDestroyed) {
            this.handleComplete();
          }
        },
      });

      // Set initial states
      this.setInitialState();

      // Build animation timeline
      this.addMainFadeAnimation(tl);
      this.addTransformAnimations(tl);
      this.addColorAnimations(tl);
      this.addBlurAnimations(tl);
      this.addStaggerAnimations(tl);

      // Store timeline reference
      this.timeline = tl as any;

    } catch (error) {
      console.error('Failed to create animation:', error);
      this.fallbackToBasicFade();
    }
  }

  private setInitialState(): void {
    try {
      const fromOpacity = this.fadeOptions.from || 0;

      // Set initial opacity
      gsap.set(this.element, { opacity: fromOpacity });

      // Set initial transform states
      if (this.fadeOptions.transform) {
        const t = this.fadeOptions.transform;
        gsap.set(this.element, {
          scale: t.scale?.from || 1,
          rotation: t.rotation?.from || 0,
          x: t.translation?.from?.x || 0,
          y: t.translation?.from?.y || 0,
          z: t.translation?.from?.z || 0,
        });
      }

      // Set initial color
      if (this.fadeOptions.color) {
        const colorProp = this.fadeOptions.color.property || "color";
        gsap.set(this.element, {
          [colorProp]: this.fadeOptions.color.from || "transparent",
        });
      }

      // Set initial blur
      if (this.fadeOptions.blur) {
        const unit = this.fadeOptions.blur.unit || "px";
        const fromBlur = this.fadeOptions.blur.from || 10;
        gsap.set(this.element, {
          filter: `blur(${fromBlur}${unit})`,
        });
      }

      // Update ARIA
      if (this.fadeOptions.accessibility?.ariaUpdates) {
        this.element.setAttribute("aria-hidden", fromOpacity === 0 ? "true" : "false");
      }
    } catch (error) {
      console.warn('Failed to set initial state:', error);
    }
  }

  private addMainFadeAnimation(tl: gsap.core.Timeline): void {
    const ease = this.getAdvancedEase();

    tl.to(this.element, {
      opacity: this.fadeOptions.to || 1,
      duration: this.fadeOptions.duration || 1,
      ease: ease,
    }, 0);
  }

  private addTransformAnimations(tl: gsap.core.Timeline): void {
    if (!this.fadeOptions.transform) return;

    const t = this.fadeOptions.transform;
    const ease = this.getAdvancedEase();
    const duration = this.fadeOptions.duration || 1;

    if (t.scale) {
      tl.to(this.element, {
        scale: t.scale.to || 1,
        duration: duration,
        ease: ease,
      }, 0);
    }

    if (t.rotation) {
      tl.to(this.element, {
        rotation: t.rotation.to || 0,
        duration: duration,
        ease: ease,
      }, 0);
    }

    if (t.translation) {
      tl.to(this.element, {
        x: t.translation.to?.x || 0,
        y: t.translation.to?.y || 0,
        z: t.translation.to?.z || 0,
        duration: duration,
        ease: ease,
      }, 0);
    }
  }

  private addColorAnimations(tl: gsap.core.Timeline): void {
    if (!this.fadeOptions.color) return;

    const colorProp = this.fadeOptions.color.property || "color";
    const ease = this.getAdvancedEase();
    const duration = this.fadeOptions.duration || 1;

    tl.to(this.element, {
      [colorProp]: this.fadeOptions.color.to || "inherit",
      duration: duration,
      ease: ease,
    }, 0);
  }

  private addBlurAnimations(tl: gsap.core.Timeline): void {
    if (!this.fadeOptions.blur) return;

    const unit = this.fadeOptions.blur.unit || "px";
    const toBlur = this.fadeOptions.blur.to || 0;
    const ease = this.getAdvancedEase();
    const duration = this.fadeOptions.duration || 1;

    tl.to(this.element, {
      filter: `blur(${toBlur}${unit})`,
      duration: duration,
      ease: ease,
    }, 0);
  }

  private addStaggerAnimations(tl: gsap.core.Timeline): void {
    if (!this.fadeOptions.staggerChildren || this.childElements.length === 0) return;

    const stagger = this.fadeOptions.staggerChildren;
    const ease = this.getAdvancedEase();

    tl.to(this.childElements, {
      opacity: this.fadeOptions.to || 1,
      duration: (this.fadeOptions.duration || 1) * 0.8,
      ease: ease,
      stagger: {
        amount: stagger.amount || 0.3,
        from: stagger.from || "start",
        axis: stagger.axis,
      },
    }, (this.fadeOptions.duration || 1) * 0.2);
  }

  private getAdvancedEase(): string {
    if (this.fadeOptions.customEase) {
      const { type, strength = 1.7 } = this.fadeOptions.customEase;

      switch (type) {
        case "bounce":
          return `back.out(${strength})`;
        case "elastic":
          return `elastic.out(${strength}, 0.3)`;
        case "back":
          return `back.out(${strength})`;
        case "expo":
          return "expo.out";
        case "circ":
          return "circ.out";
        case "sine":
          return "sine.out";
        default:
          return this.fadeOptions.ease || "power2.out";
      }
    }

    return this.fadeOptions.ease || "power2.out";
  }

  private async playAudioSafely(): Promise<void> {
    if (!this.audioBuffer || this.isDestroyed) return;

    try {
      const audioManager = AudioManager.getInstance();
      const context = await audioManager.getAudioContext();
      if (!context) return;

      this.audioSource = context.createBufferSource();
      this.audioSource.buffer = this.audioBuffer;

      // Setup gain node for volume control
      const gainNode = context.createGain();
      const volume = this.fadeOptions.audio?.volume || 1;
      
      if (this.fadeOptions.audio?.fadeAudio) {
        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(
          volume,
          context.currentTime + (this.fadeOptions.duration || 1)
        );
      } else {
        gainNode.gain.value = volume;
      }

      this.audioSource.connect(gainNode);
      gainNode.connect(context.destination);

      // Cleanup on end
      this.audioSource.onended = () => {
        this.audioSource = null;
      };

      this.audioSource.start();

      // Add to cleanup
      this.cleanupFunctions.push(() => {
        if (this.audioSource) {
          this.audioSource.stop();
          this.audioSource.disconnect();
          this.audioSource = null;
        }
      });

    } catch (error) {
      console.warn('Failed to play fade audio:', error);
    }
  }

  private updatePhysicsSync(progress: number): void {
    if (!this.fadeOptions.physics?.fadeBasedForces || this.isDestroyed) return;

    try {
      const opacity = gsap.getProperty(this.element, "opacity") as number;

      // Apply forces based on opacity
      this.applyPhysicsForce({
        x: 0,
        y: -opacity * 50, // Upward force as element becomes visible
        z: 0,
      });
    } catch (error) {
      console.warn('Physics sync error:', error);
    }
  }

  private handleComplete(): void {
    if (this.isDestroyed) return;

    try {
      // Update ARIA
      if (this.fadeOptions.accessibility?.ariaUpdates) {
        const finalOpacity = this.fadeOptions.to || 1;
        this.element.setAttribute("aria-hidden", finalOpacity === 0 ? "true" : "false");
      }

      // Focus if specified
      if (this.fadeOptions.accessibility?.focusOnComplete) {
        this.element.focus();
      }

      // Announce completion with rate limiting
      if (this.fadeOptions.accessibility?.announceCompletion) {
        const announcer = A11yAnnouncer.getInstance();
        announcer.announce(
          `Element animation completed`,
          this.fadeOptions.accessibility.maxAnnouncements
        );
      }

      // Cleanup performance optimizations
      if (this.fadeOptions.performance?.layerize) {
        this.setCSSProperty(this.element, 'will-change', 'auto');
      }

      // Call callbacks
      this.fadeOptions.onAfterComplete?.(this.element);
      this.options.onComplete?.();

    } catch (error) {
      console.warn('Completion handler error:', error);
    }
  }

  // Enhanced control methods with error handling
  fadeInWithPhysics(force: Vector3): void {
    try {
      this.applyPhysicsForce(force);
      this.play();
    } catch (error) {
      console.warn('Physics fade failed:', error);
      this.play(); // Fallback to normal fade
    }
  }

  fadeInWithSound(audioUrl?: string): void {
    if (audioUrl) {
      this.fadeOptions.audio = { url: audioUrl };
      this.setupAudioSafely();
    }
    this.play();
  }

  setOpacity(value: number, animate: boolean = true): void {
    if (this.isDestroyed) return;

    try {
      if (animate) {
        gsap.to(this.element, {
          opacity: value,
          duration: 0.3,
          ease: "power2.out",
        });
      } else {
        gsap.set(this.element, { opacity: value });
      }
    } catch (error) {
      console.warn('Set opacity failed:', error);
    }
  }

  // Enhanced destroy method with comprehensive cleanup
  destroy(): void {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;

    try {
      // Run all cleanup functions
      this.cleanupFunctions.forEach(cleanup => {
        try {
          cleanup();
        } catch (error) {
          console.warn('Cleanup function failed:', error);
        }
      });
      this.cleanupFunctions = [];

      // Stop and cleanup audio
      if (this.audioSource) {
        this.audioSource.stop();
        this.audioSource.disconnect();
        this.audioSource = null;
      }

      // Disconnect observers
      this.observerRefs.forEach(observer => {
        try {
          observer.disconnect();
        } catch (error) {
          console.warn('Observer disconnect failed:', error);
        }
      });
      this.observerRefs = [];

      // Remove media query listeners
      if (this.mediaQueryList) {
        // Note: removeListener is deprecated but kept for compatibility
        try {
          this.mediaQueryList.removeEventListener('change', () => {});
        } catch {
          // Ignore errors for older browsers
        }
      }

      // Restore original styles if preserved
      if (this.fadeOptions.preserveStyles && this.originalStyles.size > 0) {
        this.originalStyles.forEach((value, property) => {
          try {
            (this.element.style as any)[property.replace(/-([a-z])/g, (g: string) => g[1].toUpperCase())] = value;
          } catch (error) {
            console.warn(`Failed to restore style ${property}:`, error);
          }
        });
      }

      // Reset performance optimizations
      if (this.fadeOptions.performance?.layerize) {
        this.element.style.willChange = "auto";
        this.element.style.transform = "";
        this.element.style.backfaceVisibility = "";
      }

      // Clean up mask elements
      const maskElements = this.element.querySelectorAll("[data-fade-mask]");
      maskElements.forEach(mask => {
        try {
          mask.remove();
        } catch (error) {
          console.warn('Failed to remove mask element:', error);
        }
      });

      // Remove from active animations tracking
      FadeIn.activeAnimations.delete(this.element);

      // Call parent destroy
      super.destroy();

    } catch (error) {
      console.error('Destroy method failed:', error);
    }
  }

  // Static cleanup method for global resources
  static cleanup(): void {
    try {
      // Cleanup audio manager
      const audioManager = AudioManager.getInstance();
      audioManager.cleanup();

      // Clear frame rate controller
      FadeIn.frameRateController.clear();
    } catch (error) {
      console.warn('Static cleanup failed:', error);
    }
  }
}

// Factory function with enhanced error handling
export function createFadeIn(
  element: HTMLElement | string,
  options: EnhancedFadeInOptions = {}
): FadeIn | null {
  try {
    const el = typeof element === "string"
      ? document.querySelector(element) as HTMLElement
      : element;

    if (!el) {
      console.error(`Element not found: ${element}`);
      return null;
    }

    return new FadeIn(el, options);
  } catch (error) {
    console.error('Failed to create FadeIn:', error);
    return null;
  }
}

// Utility function for batch fade creation with error handling
export function createBatchFadeIn(
  elements: HTMLElement[] | NodeList | string,
  options: EnhancedFadeInOptions = {}
): FadeIn[] {
  try {
    const elementsArray = typeof elements === "string"
      ? Array.from(document.querySelectorAll(elements))
      : Array.from(elements);

    return elementsArray
      .filter((el): el is HTMLElement => el instanceof HTMLElement)
      .map(el => {
        try {
          return new FadeIn(el, options);
        } catch (error) {
          console.warn('Failed to create FadeIn for element:', el, error);
          return null;
        }
      })
      .filter((fadeIn): fadeIn is FadeIn => fadeIn !== null);
  } catch (error) {
    console.error('Batch fade creation failed:', error);
    return [];
  }
}

// Enhanced preset configurations with safety features
export const FadeInPresets = {
  // Quick and snappy fade
  quick: {
    duration: 0.3,
    ease: "power2.out",
    performance: { maxFPS: 60 },
    accessibility: { respectPrefersReducedMotion: true },
  } as EnhancedFadeInOptions,

  // Smooth and elegant
  smooth: {
    duration: 1.2,
    ease: "power2.out",
    transform: {
      translation: { from: { x: 0, y: 30, z: 0 }, to: { x: 0, y: 0, z: 0 } },
    },
    performance: { maxFPS: 60, layerize: true },
    accessibility: { respectPrefersReducedMotion: true },
  } as EnhancedFadeInOptions,

  // Dramatic with blur
  dramatic: {
    duration: 2,
    ease: "power2.out",
    blur: { from: 20, to: 0 },
    transform: {
      scale: { from: 1.1, to: 1 },
    },
    performance: { maxFPS: 30, layerize: true }, // Lower FPS for blur
    accessibility: { respectPrefersReducedMotion: true },
  } as EnhancedFadeInOptions,

  // Bouncy entrance
  bouncy: {
    duration: 1,
    customEase: { type: "bounce", strength: 1.5 },
    transform: {
      scale: { from: 0, to: 1 },
    },
    performance: { maxFPS: 60, layerize: true },
    accessibility: { respectPrefersReducedMotion: true },
  } as EnhancedFadeInOptions,

  // Staggered children
  staggered: {
    duration: 0.8,
    staggerChildren: {
      amount: 0.4,
      from: "start",
    },
    performance: { maxFPS: 60, batchUpdates: true },
    accessibility: { 
      respectPrefersReducedMotion: true,
      maxAnnouncements: 1, // Limit announcements for multiple elements
    },
  } as EnhancedFadeInOptions,

  // Accessible fade with maximum compatibility
  accessible: {
    duration: 0.8,
    ease: "power2.out",
    cssMode: "cssVariables",
    preserveStyles: true,
    accessibility: {
      respectPrefersReducedMotion: true,
      announceCompletion: true,
      ariaUpdates: true,
      maxAnnouncements: 2,
    },
    performance: {
      useRAF: true,
      batchUpdates: true,
      skipInvisible: true,
      maxFPS: 60,
    },
  } as EnhancedFadeInOptions,

  // Performance optimized for mobile
  mobile: {
    duration: 0.6,
    ease: "power2.out",
    performance: {
      maxFPS: 30, // Lower for battery life
      layerize: true,
      skipInvisible: true,
      batchUpdates: true,
    },
    accessibility: { respectPrefersReducedMotion: true },
  } as EnhancedFadeInOptions,

  // Safe mode - minimal features for maximum compatibility
  safe: {
    duration: 1,
    ease: "power2.out",
    cssMode: "inline",
    preserveStyles: false,
    performance: { maxFPS: 30 },
    accessibility: { respectPrefersReducedMotion: true },
  } as EnhancedFadeInOptions,
};