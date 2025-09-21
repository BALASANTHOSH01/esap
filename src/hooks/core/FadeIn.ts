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
    axis?: "x" | "y"; // Fixed: Removed 'both'
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
  };

  // Accessibility features
  accessibility?: {
    respectPrefersReducedMotion?: boolean;
    announceCompletion?: boolean;
    focusOnComplete?: boolean;
    ariaUpdates?: boolean;
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
}

export class FadeIn extends BaseAnimation {
  private fadeOptions: EnhancedFadeInOptions;
  private childElements: HTMLElement[] = [];
  private audioContext?: AudioContext;
  private audioBuffer?: AudioBuffer;
  private audioSource?: AudioBufferSourceNode;
  private isHalfwayTriggered = false;
  private observerRefs: IntersectionObserver[] = [];

  constructor(element: HTMLElement, options: EnhancedFadeInOptions = {}) {
    // Merge with intelligent defaults
    const enhancedOptions = {
      from: 0,
      to: 1,
      duration: 1,
      ease: "power2.out",
      gpu: true,
      willChange: true,
      accessibility: {
        respectPrefersReducedMotion: true,
        announceCompletion: false,
        focusOnComplete: false,
        ariaUpdates: true,
      },
      performance: {
        useRAF: true,
        batchUpdates: true,
        skipInvisible: true,
        layerize: true,
      },
      ...options,
    };

    super(element, enhancedOptions);
    this.fadeOptions = enhancedOptions;

    this.initializeAdvancedFeatures();
    this.setupAccessibility();
    this.checkConditions();
  }

  protected initializeAdvancedFeatures(): void {
    // Setup child elements for stagger
    if (this.fadeOptions.staggerChildren) {
      this.setupChildStagger();
    }

    // Setup audio if specified
    if (this.fadeOptions.audio?.url) {
      this.setupAudio();
    }

    // Setup particles if specified
    if (this.fadeOptions.particles) {
      this.setupParticles();
    }

    // Setup masking effects
    if (this.fadeOptions.mask) {
      this.setupMask();
    }

    // Setup performance optimizations
    if (this.fadeOptions.performance?.layerize) {
      this.optimizeForAnimation();
    }
  }

  private setupChildStagger(): void {
    const stagger = this.fadeOptions.staggerChildren!;
    const selector = stagger.selector || "*";

    this.childElements = Array.from(
      this.element.querySelectorAll(selector)
    ) as HTMLElement[];

    // Prepare children for animation
    this.childElements.forEach((child, index) => {
      gsap.set(child, { opacity: this.fadeOptions.from || 0 });

      // Add performance optimizations
      if (this.fadeOptions.performance?.layerize) {
        child.style.willChange = "transform, opacity";
        child.style.transform = "translateZ(0)";
      }
    });
  }

  private async setupAudio(): Promise<void> {
    if (!this.fadeOptions.audio?.url) return;

    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      const response = await fetch(this.fadeOptions.audio.url);
      const arrayBuffer = await response.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.warn("Failed to load audio for FadeIn animation:", error);
    }
  }

  private setupParticles(): void {
    if (!this.fadeOptions.particles || !this.options.threeDimensional) return;

    // Create particle system using the 3D integration
    const particleSystem = this.createParticleSystem({
      count: this.fadeOptions.particles.count || 100,
      spread: this.fadeOptions.particles.spread || 5,
      size: this.fadeOptions.particles.size || 0.05,
      opacity: this.fadeOptions.particles.opacity || 0.5,
      duration:
        this.fadeOptions.particles.duration || this.fadeOptions.duration,
    });

    if (particleSystem && this.fadeOptions.particles.fadeSync) {
      // Sync particle opacity with main fade
      gsap.to(particleSystem.material, {
        opacity: this.fadeOptions.to || 1,
        duration: this.fadeOptions.duration,
        ease: this.fadeOptions.ease,
      });
    }
  }

  private setupMask(): void {
    const mask = this.fadeOptions.mask!;
    const maskElement = document.createElement("div");

    // Create mask based on type
    switch (mask.type) {
      case "reveal":
        this.setupRevealMask(maskElement, mask);
        break;
      case "wipe":
        this.setupWipeMask(maskElement, mask);
        break;
      case "iris":
        this.setupIrisMask(maskElement, mask);
        break;
      case "split":
        this.setupSplitMask(maskElement, mask);
        break;
    }
  }

  private setupRevealMask(
    maskElement: HTMLElement,
    mask: NonNullable<EnhancedFadeInOptions["mask"]>
  ): void {
    const rect = this.element.getBoundingClientRect();

    maskElement.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: black;
      pointer-events: none;
      z-index: 1;
    `;

    this.element.style.position = "relative";
    this.element.appendChild(maskElement);

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

  private setupWipeMask(
    maskElement: HTMLElement,
    mask: NonNullable<EnhancedFadeInOptions["mask"]>
  ): void {
    this.element.style.clipPath = "inset(0 100% 0 0)";

    const clipValues = {
      left: "inset(0 100% 0 0)",
      right: "inset(0 0 0 100%)",
      up: "inset(100% 0 0 0)",
      down: "inset(0 0 100% 0)",
    };

    gsap.to(this.element, {
      clipPath: "inset(0 0 0 0)",
      duration: this.fadeOptions.duration,
      ease: this.fadeOptions.ease,
    });
  }

  private setupIrisMask(
    maskElement: HTMLElement,
    mask: NonNullable<EnhancedFadeInOptions["mask"]>
  ): void {
    const shape = mask.shape || "circle";
    const startValue =
      shape === "circle"
        ? "circle(0% at 50% 50%)"
        : "ellipse(0% 0% at 50% 50%)";
    const endValue =
      shape === "circle"
        ? "circle(100% at 50% 50%)"
        : "ellipse(100% 100% at 50% 50%)";

    this.element.style.clipPath = startValue;

    gsap.to(this.element, {
      clipPath: endValue,
      duration: this.fadeOptions.duration,
      ease: this.fadeOptions.ease,
    });
  }

  private setupSplitMask(
    maskElement: HTMLElement,
    mask: NonNullable<EnhancedFadeInOptions["mask"]>
  ): void {
    this.element.style.clipPath = "inset(0 50% 0 50%)";

    gsap.to(this.element, {
      clipPath: "inset(0 0 0 0)",
      duration: this.fadeOptions.duration,
      ease: this.fadeOptions.ease,
    });
  }

  private getMaskTransform(
    direction: string,
    rect: DOMRect
  ): { from: any; to: any } {
    const transforms = {
      left: {
        from: { x: 0 },
        to: { x: -rect.width },
      },
      right: {
        from: { x: 0 },
        to: { x: rect.width },
      },
      up: {
        from: { y: 0 },
        to: { y: -rect.height },
      },
      down: {
        from: { y: 0 },
        to: { y: rect.height },
      },
    };

    return transforms[direction as keyof typeof transforms] || transforms.right;
  }

  private optimizeForAnimation(): void {
    // Layer promotion for GPU acceleration
    this.element.style.willChange = "transform, opacity";
    this.element.style.transform = "translateZ(0)";
    this.element.style.backfaceVisibility = "hidden";

    // Reduce repaints
    this.element.style.isolation = "isolate";
    this.element.style.contain = "layout style paint"; // Fixed: Changed 'containment' to 'contain'
  }

  private setupAccessibility(): void {
    const a11y = this.fadeOptions.accessibility!;

    // Respect reduced motion preference
    if (
      a11y.respectPrefersReducedMotion &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      this.fadeOptions.duration = 0.01; // Nearly instant
      this.fadeOptions.ease = "none";
    }

    // Setup ARIA updates
    if (a11y.ariaUpdates) {
      this.element.setAttribute("aria-hidden", "true");
    }
  }

  private checkConditions(): boolean {
    const conditions = this.fadeOptions.conditions;
    if (!conditions) return true;

    // Check viewport condition
    if (conditions.viewport && !this.isInViewport()) {
      this.setupViewportObserver();
      return false;
    }

    // Check media query condition
    if (
      conditions.mediaQuery &&
      !window.matchMedia(conditions.mediaQuery).matches
    ) {
      return false;
    }

    // Check element visibility condition
    if (conditions.elementVisible && !this.isElementVisible()) {
      return false;
    }

    return true;
  }

  private isInViewport(): boolean {
    const rect = this.element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  }

  private isElementVisible(): boolean {
    return this.element.offsetParent !== null;
  }

  private setupViewportObserver(): void {
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
  }

  protected createAnimation(): void {
    // Call beforeStart callback
    this.fadeOptions.onBeforeStart?.(this.element);

    // Create master timeline
    const tl = gsap.timeline({
      onStart: () => {
        this.playAudio();
        this.options.onStart?.();
      },
      onUpdate: () => {
        const progress = tl.progress();
        const currentOpacity = gsap.getProperty(
          this.element,
          "opacity"
        ) as number;

        this.fadeOptions.onProgress?.(progress, this.element, currentOpacity);
        this.options.onUpdate?.(progress);

        // Trigger halfway callback
        if (progress >= 0.5 && !this.isHalfwayTriggered) {
          this.isHalfwayTriggered = true;
          this.fadeOptions.onHalfway?.(this.element);
        }

        // Update physics if synced
        this.updatePhysicsSync(progress);
      },
      onComplete: () => {
        this.handleComplete();
      },
    });

    // Set initial states
    this.setInitialState();

    // Main fade animation
    this.addMainFadeAnimation(tl);

    // Add transform animations
    this.addTransformAnimations(tl);

    // Add color animations
    this.addColorAnimations(tl);

    // Add blur animations
    this.addBlurAnimations(tl);

    // Add stagger animations
    this.addStaggerAnimations(tl);

    // Store timeline reference
    this.timeline = tl as any; // Type assertion needed due to wrapper differences
  }

  private setInitialState(): void {
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
      this.element.setAttribute(
        "aria-hidden",
        fromOpacity === 0 ? "true" : "false"
      );
    }
  }

  private addMainFadeAnimation(tl: gsap.core.Timeline): void {
    const ease = this.getAdvancedEase();

    tl.to(
      this.element,
      {
        opacity: this.fadeOptions.to || 1,
        duration: this.fadeOptions.duration || 1,
        ease: ease,
      },
      0
    );
  }

  private addTransformAnimations(tl: gsap.core.Timeline): void {
    if (!this.fadeOptions.transform) return;

    const t = this.fadeOptions.transform;
    const ease = this.getAdvancedEase();
    const duration = this.fadeOptions.duration || 1;

    if (t.scale) {
      tl.to(
        this.element,
        {
          scale: t.scale.to || 1,
          duration: duration,
          ease: ease,
        },
        0
      );
    }

    if (t.rotation) {
      tl.to(
        this.element,
        {
          rotation: t.rotation.to || 0,
          duration: duration,
          ease: ease,
        },
        0
      );
    }

    if (t.translation) {
      tl.to(
        this.element,
        {
          x: t.translation.to?.x || 0,
          y: t.translation.to?.y || 0,
          z: t.translation.to?.z || 0,
          duration: duration,
          ease: ease,
        },
        0
      );
    }
  }

  private addColorAnimations(tl: gsap.core.Timeline): void {
    if (!this.fadeOptions.color) return;

    const colorProp = this.fadeOptions.color.property || "color";
    const ease = this.getAdvancedEase();
    const duration = this.fadeOptions.duration || 1;

    tl.to(
      this.element,
      {
        [colorProp]: this.fadeOptions.color.to || "inherit",
        duration: duration,
        ease: ease,
      },
      0
    );
  }

  private addBlurAnimations(tl: gsap.core.Timeline): void {
    if (!this.fadeOptions.blur) return;

    const unit = this.fadeOptions.blur.unit || "px";
    const toBlur = this.fadeOptions.blur.to || 0;
    const ease = this.getAdvancedEase();
    const duration = this.fadeOptions.duration || 1;

    tl.to(
      this.element,
      {
        filter: `blur(${toBlur}${unit})`,
        duration: duration,
        ease: ease,
      },
      0
    );
  }

  private addStaggerAnimations(tl: gsap.core.Timeline): void {
    if (!this.fadeOptions.staggerChildren || this.childElements.length === 0)
      return;

    const stagger = this.fadeOptions.staggerChildren;
    const ease = this.getAdvancedEase();

    tl.to(
      this.childElements,
      {
        opacity: this.fadeOptions.to || 1,
        duration: (this.fadeOptions.duration || 1) * 0.8, // Slightly shorter for overlap
        ease: ease,
        stagger: {
          amount: stagger.amount || 0.3,
          from: stagger.from || "start",
          axis: stagger.axis, // Fixed: Type-safe, as axis is now 'x' | 'y' | undefined
        },
      },
      (this.fadeOptions.duration || 1) * 0.2
    ); // Start slightly after main animation
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

  private playAudio(): void {
    if (!this.audioContext || !this.audioBuffer) return;

    try {
      this.audioSource = this.audioContext.createBufferSource();
      this.audioSource.buffer = this.audioBuffer;

      if (this.fadeOptions.audio?.volume !== undefined) {
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = this.fadeOptions.audio.volume;
        this.audioSource.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
      } else {
        this.audioSource.connect(this.audioContext.destination);
      }

      this.audioSource.start();

      // Fade audio if specified
      if (this.fadeOptions.audio?.fadeAudio) {
        const gainNode = this.audioContext.createGain();
        this.audioSource.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(
          this.fadeOptions.audio?.volume || 1,
          this.audioContext.currentTime + (this.fadeOptions.duration || 1)
        );
      }
    } catch (error) {
      console.warn("Failed to play fade audio:", error);
    }
  }

  private updatePhysicsSync(progress: number): void {
    if (!this.fadeOptions.physics?.fadeBasedForces) return;

    const opacity = gsap.getProperty(this.element, "opacity") as number;

    // Apply forces based on opacity
    this.applyPhysicsForce({
      x: 0,
      y: -opacity * 50, // Upward force as element becomes visible
      z: 0,
    });
  }

  private handleComplete(): void {
    // Update ARIA
    if (this.fadeOptions.accessibility?.ariaUpdates) {
      const finalOpacity = this.fadeOptions.to || 1;
      this.element.setAttribute(
        "aria-hidden",
        finalOpacity === 0 ? "true" : "false"
      );
    }

    // Focus if specified
    if (this.fadeOptions.accessibility?.focusOnComplete) {
      this.element.focus();
    }

    // Announce completion
    if (this.fadeOptions.accessibility?.announceCompletion) {
      this.announceCompletion();
    }

    // Cleanup performance optimizations
    if (this.fadeOptions.performance?.layerize) {
      this.element.style.willChange = "auto";
    }

    // Call callbacks
    this.fadeOptions.onAfterComplete?.(this.element);
    this.options.onComplete?.();
  }

  private announceCompletion(): void {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.style.cssText =
      "position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;";
    announcement.textContent = `Element animation completed`;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Enhanced control methods
  fadeInWithPhysics(force: Vector3): void {
    this.applyPhysicsForce(force);
    this.play();
  }

  fadeInWithSound(audioUrl?: string): void {
    if (audioUrl) {
      this.fadeOptions.audio = { url: audioUrl };
      this.setupAudio();
    }
    this.play();
  }

  setOpacity(value: number, animate: boolean = true): void {
    if (animate) {
      gsap.to(this.element, {
        opacity: value,
        duration: 0.3,
        ease: "power2.out",
      });
    } else {
      gsap.set(this.element, { opacity: value });
    }
  }

  // Override destroy to cleanup advanced features
  destroy(): void {
    // Stop audio
    if (this.audioSource) {
      this.audioSource.stop();
      this.audioSource.disconnect();
    }

    if (this.audioContext) {
      this.audioContext.close();
    }

    // Disconnect observers
    this.observerRefs.forEach((observer) => observer.disconnect());
    this.observerRefs = [];

    // Reset performance optimizations
    if (this.fadeOptions.performance?.layerize) {
      this.element.style.willChange = "auto";
      this.element.style.transform = "";
      this.element.style.backfaceVisibility = "";
    }

    // Clean up mask elements
    const maskElements = this.element.querySelectorAll("[data-fade-mask]");
    maskElements.forEach((mask) => mask.remove());

    // Call parent destroy
    super.destroy();
  }
}

// Factory function with intelligent defaults
export function createFadeIn(
  element: HTMLElement | string,
  options: EnhancedFadeInOptions = {}
): FadeIn {
  const el =
    typeof element === "string"
      ? (document.querySelector(element) as HTMLElement)
      : element;

  if (!el) {
    throw new Error(`Element not found: ${element}`);
  }

  return new FadeIn(el, options);
}

// Utility function for batch fade creation
export function createBatchFadeIn(
  elements: HTMLElement[] | NodeList | string,
  options: EnhancedFadeInOptions = {}
): FadeIn[] {
  const elementsArray =
    typeof elements === "string"
      ? Array.from(document.querySelectorAll(elements))
      : Array.from(elements);

  return elementsArray
    .filter((el): el is HTMLElement => el instanceof HTMLElement)
    .map((el) => new FadeIn(el, options));
}

// Preset configurations
export const FadeInPresets = {
  // Quick and snappy fade
  quick: {
    duration: 0.3,
    ease: "power2.out",
  } as EnhancedFadeInOptions,

  // Smooth and elegant
  smooth: {
    duration: 1.2,
    ease: "power2.out",
    transform: {
      translation: { from: { x: 0, y: 30, z: 0 }, to: { x: 0, y: 0, z: 0 } },
    },
  } as EnhancedFadeInOptions,

  // Dramatic with blur
  dramatic: {
    duration: 2,
    ease: "power2.out",
    blur: { from: 20, to: 0 },
    transform: {
      scale: { from: 1.1, to: 1 },
    },
  } as EnhancedFadeInOptions,

  // Bouncy entrance
  bouncy: {
    duration: 1,
    customEase: { type: "bounce", strength: 1.5 },
    transform: {
      scale: { from: 0, to: 1 },
    },
  } as EnhancedFadeInOptions,

  // Staggered children
  staggered: {
    duration: 0.8,
    staggerChildren: {
      amount: 0.4,
      from: "start",
    },
  } as EnhancedFadeInOptions,

  // Accessible fade
  accessible: {
    duration: 0.8,
    accessibility: {
      respectPrefersReducedMotion: true,
      announceCompletion: true,
      ariaUpdates: true,
    },
  } as EnhancedFadeInOptions,
};
