import { EnhancedAnimationEngine } from "./AnimationEngine";
import type {
  AnimationInstance,
  FadeInOptions,
  SlideInOptions,
  StaggerOptions,
  ParallaxOptions,
  TextRevealOptions,
  MorphingOptions,
  ScrollTriggerOptions,
} from "../types/core";
import { FadeIn } from "../hooks/core/FadeIn";
import { SlideIn } from "../hooks/core/SlideIn";
import { Stagger } from "../hooks/core/Stagger";
import { Parallax } from "../hooks/core/Parallax";
import { TextReveal } from "../hooks/core/TextReveal";
import { Morphing } from "../hooks/core/Morphing";
import { ScrollTriggerAnimation } from "../hooks/core/ScrollTriggerAnimation";
import { EventEmitter } from "events";
import type { PerformanceMetrics } from "./AnimationEngine";

interface AnimationEvents {
  animationCreated: (id: string, type: string) => void;
  animationDestroyed: (id: string) => void;
  animationStateChange: (
    id: string,
    state: "play" | "pause" | "restart" | "reverse"
  ) => void;
}

export class AnimationManager {
  private static instance: AnimationManager;
  private engine: EnhancedAnimationEngine;
  private animations: Map<string, AnimationInstance | any> = new Map();
  private eventEmitter: EventEmitter = new EventEmitter();

  static getInstance(): AnimationManager {
    if (!AnimationManager.instance) {
      AnimationManager.instance = new AnimationManager();
    }
    return AnimationManager.instance;
  }

  private constructor() {
    this.engine = EnhancedAnimationEngine.getInstance();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.engine.getPerformanceMetrics = () => this.getPerformanceMetrics();
  }

  private getElement(element: HTMLElement | string): HTMLElement {
    const el =
      typeof element === "string"
        ? (document.querySelector(element) as HTMLElement)
        : element;
    if (!el) throw new Error(`Element not found: ${element}`);
    return el;
  }

  fadeIn(element: HTMLElement | string, options: FadeInOptions = {}): string {
    try {
      const animation = new FadeIn(this.getElement(element), options);
      const id = this.generateId("fadeIn");
      this.animations.set(id, animation);
      this.engine.registerAnimation(
        id,
        animation.getInstance(),
        this.getElement(element),
        "basic"
      );
      this.eventEmitter.emit("animationCreated", id, "fadeIn");
      return id;
    } catch (error) {
      console.error("Failed to create fadeIn animation:", error);
      throw error;
    }
  }

  slideIn(element: HTMLElement | string, options: SlideInOptions): string {
    try {
      const animation = new SlideIn(this.getElement(element), options);
      const id = this.generateId("slideIn");
      this.animations.set(id, animation);
      this.engine.registerAnimation(
        id,
        animation.getInstance(),
        this.getElement(element),
        "basic"
      );
      this.eventEmitter.emit("animationCreated", id, "slideIn");
      return id;
    } catch (error) {
      console.error("Failed to create slideIn animation:", error);
      throw error;
    }
  }

  stagger(
    container: HTMLElement | string,
    selector: string,
    options: StaggerOptions = {}
  ): string {
    try {
      const animation = new Stagger(
        this.getElement(container),
        selector,
        options
      );
      const id = this.generateId("stagger");
      this.animations.set(id, animation);
      this.engine.registerAnimation(
        id,
        animation.getInstance(),
        this.getElement(container),
        "stagger"
      );
      this.eventEmitter.emit("animationCreated", id, "stagger");
      return id;
    } catch (error) {
      console.error("Failed to create stagger animation:", error);
      throw error;
    }
  }

  parallax(
    element: HTMLElement | string,
    options: ParallaxOptions = {}
  ): string {
    try {
      const animation = new Parallax(this.getElement(element), options);
      const id = this.generateId("parallax");
      this.animations.set(id, animation);
      this.engine.registerAnimation(
        id,
        animation.getInstance(),
        this.getElement(element),
        "parallax"
      );
      this.eventEmitter.emit("animationCreated", id, "parallax");
      return id;
    } catch (error) {
      console.error("Failed to create parallax animation:", error);
      throw error;
    }
  }

  textReveal(
    element: HTMLElement | string,
    options: TextRevealOptions = {}
  ): string {
    try {
      const animation = new TextReveal(this.getElement(element), options);
      const id = this.generateId("textReveal");
      this.animations.set(id, animation);
      this.engine.registerAnimation(
        id,
        animation.getInstance(),
        this.getElement(element),
        "text"
      );
      this.eventEmitter.emit("animationCreated", id, "textReveal");
      return id;
    } catch (error) {
      console.error("Failed to create textReveal animation:", error);
      throw error;
    }
  }

  morphing(
    element: HTMLElement | string,
    options: MorphingOptions = {}
  ): string {
    try {
      const animation = new Morphing(this.getElement(element), options);
      const id = this.generateId("morphing");
      this.animations.set(id, animation);
      this.engine.registerAnimation(
        id,
        animation.getInstance(),
        this.getElement(element),
        "morph"
      );
      this.eventEmitter.emit("animationCreated", id, "morphing");
      return id;
    } catch (error) {
      console.error("Failed to create morphing animation:", error);
      throw error;
    }
  }

  scrollTrigger(
    element: HTMLElement | string,
    fromVars: gsap.TweenVars,
    toVars: gsap.TweenVars,
    options: ScrollTriggerOptions = {}
  ): string {
    try {
      const animation = new ScrollTriggerAnimation(
        this.getElement(element),
        fromVars,
        toVars,
        options
      );
      const id = this.generateId("scrollTrigger");
      this.animations.set(id, animation);
      this.engine.registerAnimation(
        id,
        animation.getInstance(),
        this.getElement(element),
        "scroll",
        options.priority || 1
      );
      this.eventEmitter.emit("animationCreated", id, "scrollTrigger");
      return id;
    } catch (error) {
      console.error("Failed to create scrollTrigger animation:", error);
      throw error;
    }
  }

  play(id: string): void {
    const animation = this.animations.get(id);
    if (animation?.play) {
      animation.play();
      this.eventEmitter.emit("animationStateChange", id, "play");
    }
  }

  pause(id: string): void {
    const animation = this.animations.get(id);
    if (animation?.pause) {
      animation.pause();
      this.eventEmitter.emit("animationStateChange", id, "pause");
    }
  }

  restart(id: string): void {
    const animation = this.animations.get(id);
    if (animation?.restart) {
      animation.restart();
      this.eventEmitter.emit("animationStateChange", id, "restart");
    }
  }

  reverse(id: string): void {
    const animation = this.animations.get(id);
    if (animation?.reverse) {
      animation.reverse();
      this.eventEmitter.emit("animationStateChange", id, "reverse");
    }
  }

  destroy(id: string): void {
    const animation = this.animations.get(id);
    if (animation?.destroy) {
      animation.destroy();
      this.animations.delete(id);
      this.engine.unregisterAnimation(id);
      this.eventEmitter.emit("animationDestroyed", id);
    }
  }

  destroyAll(): void {
    this.animations.forEach((animation, id) => {
      if (animation?.destroy) {
        animation.destroy();
        this.engine.unregisterAnimation(id);
        this.eventEmitter.emit("animationDestroyed", id);
      }
    });
    this.animations.clear();
  }

  getAnimation(id: string): AnimationInstance | undefined {
    return this.animations.get(id) as AnimationInstance | undefined;
  }

  getAllAnimations(): Map<string, AnimationInstance> {
    return new Map(this.animations) as Map<string, AnimationInstance>;
  }

  on<T extends keyof AnimationEvents>(
    event: T,
    listener: AnimationEvents[T]
  ): void {
    this.eventEmitter.on(event, listener);
  }

  off<T extends keyof AnimationEvents>(
    event: T,
    listener: AnimationEvents[T]
  ): void {
    this.eventEmitter.off(event, listener);
  }

  getPerformanceMetrics(): PerformanceMetrics {
    const engineStats = this.engine.getEngineStats();
    return {
      ...engineStats.performance,
      totalAnimations: engineStats.totalAnimations,
      activeAnimations: engineStats.activeAnimations,
    };
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  dispose(): void {
    this.destroyAll();
    this.engine.dispose();
    this.eventEmitter.removeAllListeners();
    AnimationManager.instance = null as any;
  }
}
