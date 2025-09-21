import { AdvancedAnimationEngine } from "./AnimationEngine"; 
import type {
  AnimationInstance,
  FadeInOptions,
  SlideInOptions,
  StaggerOptions,
  ParallaxOptions,
  TextRevealOptions,
  MorphingOptions,
  ScrollTriggerOptions,
  AnimationState,
  EventHandler,
  AnimationError,
} from "../types/core";
import { FadeIn } from "../hooks/core/FadeIn";
import { SlideIn } from "../hooks/core/SlideIn";
import { Stagger } from "../hooks/core/Stagger";
import { Parallax } from "../../dev/Parallax";
import { TextReveal } from "../hooks/core/TextReveal";
import { Morphing } from "../../dev/Morphing";
import { ScrollTriggerAnimation } from "../../dev/ScrollTriggerAnimation";

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  activeAnimations: number;
  droppedFrames: number;
  cpuUsage: number;
  gpuUsage?: number;
}

// Enhanced event system
interface AnimationEvents {
  animationCreated: (id: string, type: string, element: HTMLElement) => void;
  animationDestroyed: (id: string, type: string) => void;
  animationStateChange: (
    id: string,
    state: AnimationState,
    progress?: number
  ) => void;
  animationError: (id: string, error: Error) => void;
  batchComplete: (batchId: string, completedAnimations: string[]) => void;
  performanceWarning: (metrics: PerformanceMetrics) => void;
}

interface AnimationMetadata {
  id: string;
  type: string;
  element: HTMLElement;
  instance: AnimationInstance | any;
  createdAt: number;
  state: AnimationState;
  priority: number;
  tags: Set<string>;
}

interface BatchAnimation {
  id: string;
  animationIds: string[];
  options: {
    sequence?: boolean;
    stagger?: number;
    onComplete?: () => void;
  };
}

interface AnimationQuery {
  type?: string;
  state?: AnimationState;
  element?: HTMLElement;
  tags?: string[];
  priority?: number;
  createdAfter?: number;
  createdBefore?: number;
}

export class AnimationManager {
  private static instance: AnimationManager;
  private engine: AdvancedAnimationEngine;
  private animations: Map<string, AnimationMetadata> = new Map();
  private batches: Map<string, BatchAnimation> = new Map();
  private eventListeners: Map<string, Set<EventHandler>> = new Map();
  private performanceMonitor?: number;
  private isMonitoring = false;
  private maxAnimations = 50;
  private cleanupInterval?: number;
  private errorLog: AnimationError[] = []; // Track errors properly
  private isDestroyed = false;

  static getInstance(): AnimationManager {
    if (!AnimationManager.instance) {
      AnimationManager.instance = new AnimationManager();
    }
    return AnimationManager.instance;
  }

  private constructor() {
    this.engine = AdvancedAnimationEngine.getInstance();
    this.engine.start(); // Ensure engine is running
    this.setupPerformanceMonitoring();
    this.setupAutomaticCleanup();
  }

  private handleAnimationError(id: string, type: string, error: Error): void {
    const errorRecord: AnimationError = {
      id,
      type,
      error,
      timestamp: Date.now(),
    };

    this.errorLog.push(errorRecord);

    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }

    this.emit("animationError", id, error);
  }

  // Performance and cleanup setup
  private setupPerformanceMonitoring(): void {
    this.startPerformanceMonitoring();
  }

  private setupAutomaticCleanup(): void {
    // Clean up completed animations every 30 seconds
    this.cleanupInterval = window.setInterval(() => {
      this.cleanupCompletedAnimations();
    }, 30000);
  }

  private startPerformanceMonitoring(): void {
    if (this.isMonitoring || this.isDestroyed) return;

    this.isMonitoring = true;
    this.performanceMonitor = window.setInterval(() => {
      // Check if manager is destroyed
      if (this.isDestroyed) {
        this.stopPerformanceMonitoring();
        return;
      }

      try {
        const metrics = this.getPerformanceMetrics();

        // Warning thresholds
        if (
          metrics.activeAnimations > this.maxAnimations ||
          metrics.fps < 30 ||
          metrics.memoryUsage > 200
        ) {
          this.emit("performanceWarning", metrics);
        }
      } catch (error) {
        console.error("Performance monitoring error:", error);
        this.stopPerformanceMonitoring();
      }
    }, 5000);
  }

  private stopPerformanceMonitoring(): void {
    if (this.performanceMonitor) {
      clearInterval(this.performanceMonitor);
      this.performanceMonitor = undefined;
    }
    this.isMonitoring = false;
  }

  // Element resolution with better error handling
  private getElement(element: HTMLElement | string): HTMLElement {
    try {
      if (typeof element === "string") {
        const el = document.querySelector(element) as HTMLElement;
        if (!el) {
          throw new Error(`Element not found with selector: "${element}"`);
        }
        return el;
      }

      if (!(element instanceof HTMLElement)) {
        throw new Error("Invalid element provided");
      }

      return element;
    } catch (error) {
      console.error("Element resolution failed:", error);
      throw error;
    }
  }

  // Enhanced animation creation methods
  fadeIn(
    element: HTMLElement | string,
    options: FadeInOptions = {},
    tags: string[] = []
  ): string {
    try {
      const el = this.getElement(element);
      const animation = new FadeIn(el, options);
      const id = this.generateId("fadeIn");

      this.registerAnimation(
        id,
        "fadeIn",
        el,
        animation,
        options.priority || 1,
        tags
      );
      return id;
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const id = this.generateId("fadeIn_error");

      // Use proper error tracking instead of temporary IDs
      this.handleAnimationError(id, "fadeIn", errorObj);

      throw errorObj;
    }
  }

  slideIn(
    element: HTMLElement | string,
    options: SlideInOptions,
    tags: string[] = []
  ): string {
    try {
      const el = this.getElement(element);
      const animation = new SlideIn(el, options);
      const id = this.generateId("slideIn");

      this.registerAnimation(
        id,
        "slideIn",
        el,
        animation,
        options.priority || 1,
        tags
      );
      return id;
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const id = this.generateId("slideIn_error");

      this.handleAnimationError(id, "slideIn", errorObj);

      throw errorObj;
    }
  }

  stagger(
    container: HTMLElement | string,
    selector: string,
    options: StaggerOptions = {},
    tags: string[] = []
  ): string {
    try {
      const el = this.getElement(container);
      const animation = new Stagger(el, selector, options);
      const id = this.generateId("stagger");

      this.registerAnimation(
        id,
        "stagger",
        el,
        animation,
        options.priority || 1,
        tags
      );
      return id;
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const tempId = this.generateId("stagger_error");
      this.emit("animationError", tempId, errorObj);
      throw errorObj;
    }
  }

  parallax(
    element: HTMLElement | string,
    options: ParallaxOptions = {},
    tags: string[] = []
  ): string {
    try {
      const el = this.getElement(element);
      const animation = new Parallax(el, options);
      const id = this.generateId("parallax");

      this.registerAnimation(
        id,
        "parallax",
        el,
        animation,
        options.priority || 2,
        tags
      );
      return id;
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const tempId = this.generateId("parallax_error");
      this.emit("animationError", tempId, errorObj);
      throw errorObj;
    }
  }

  textReveal(
    element: HTMLElement | string,
    options: TextRevealOptions = {},
    tags: string[] = []
  ): string {
    try {
      const el = this.getElement(element);
      const animation = new TextReveal(el, options);
      const id = this.generateId("textReveal");

      this.registerAnimation(
        id,
        "textReveal",
        el,
        animation,
        options.priority || 1,
        tags
      );
      return id;
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const tempId = this.generateId("textReveal_error");
      this.emit("animationError", tempId, errorObj);
      throw errorObj;
    }
  }

  morphing(
    element: HTMLElement | string,
    options: MorphingOptions = {},
    tags: string[] = []
  ): string {
    try {
      const el = this.getElement(element);
      const animation = new Morphing(el, options);
      const id = this.generateId("morphing");

      this.registerAnimation(
        id,
        "morphing",
        el,
        animation,
        options.priority || 2,
        tags
      );
      return id;
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const tempId = this.generateId("morphing_error");
      this.emit("animationError", tempId, errorObj);
      throw errorObj;
    }
  }

  scrollTrigger(
    element: HTMLElement | string,
    fromVars: gsap.TweenVars,
    toVars: gsap.TweenVars,
    options: ScrollTriggerOptions = {},
    tags: string[] = []
  ): string {
    try {
      const el = this.getElement(element);
      const animation = new ScrollTriggerAnimation(
        el,
        fromVars,
        toVars,
        options
      );
      const id = this.generateId("scrollTrigger");

      this.registerAnimation(
        id,
        "scrollTrigger",
        el,
        animation,
        options.priority || 3,
        tags
      );
      return id;
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const tempId = this.generateId("scrollTrigger_error");
      this.emit("animationError", tempId, errorObj);
      throw errorObj;
    }
  }

  // Enhanced registration system
  private registerAnimation(
    id: string,
    type: string,
    element: HTMLElement,
    animation: any,
    priority: number = 1,
    tags: string[] = []
  ): void {
    // Check animation limit
    if (this.animations.size >= this.maxAnimations) {
      console.warn(
        `Animation limit (${this.maxAnimations}) reached. Consider cleaning up completed animations.`
      );
      this.cleanupCompletedAnimations();
    }

    const metadata: AnimationMetadata = {
      id,
      type,
      element,
      instance: animation,
      createdAt: Date.now(),
      state: "idle",
      priority,
      tags: new Set(tags),
    };

    this.animations.set(id, metadata);

    // Setup state change monitoring
    this.setupAnimationMonitoring(metadata);

    this.emit("animationCreated", id, type, element);
  }

  private setupAnimationMonitoring(metadata: AnimationMetadata): void {
    const { instance, id } = metadata;

    // Monitor animation state changes
    if (instance.onStart) {
      const originalOnStart = instance.onStart;
      instance.onStart = () => {
        metadata.state = "running";
        this.emit("animationStateChange", id, "running");
        originalOnStart();
      };
    }

    if (instance.onComplete) {
      const originalOnComplete = instance.onComplete;
      instance.onComplete = () => {
        metadata.state = "completed";
        this.emit("animationStateChange", id, "completed");
        originalOnComplete();
      };
    }

    if (instance.onUpdate) {
      const originalOnUpdate = instance.onUpdate;
      instance.onUpdate = (progress: number) => {
        this.emit("animationStateChange", id, "running", progress);
        originalOnUpdate(progress);
      };
    }
  }

  // Batch animation system
  createBatch(
    animationIds: string[],
    options: BatchAnimation["options"] = {}
  ): string {
    const batchId = this.generateId("batch");
    const batch: BatchAnimation = {
      id: batchId,
      animationIds: [...animationIds],
      options,
    };

    this.batches.set(batchId, batch);

    if (options.sequence) {
      this.playSequence(animationIds, options.stagger);
    } else if (options.stagger) {
      this.playStaggered(animationIds, options.stagger);
    }

    return batchId;
  }

  private playSequence(animationIds: string[], delay: number = 0): void {
    animationIds.forEach((id, index) => {
      setTimeout(() => {
        this.play(id);
      }, index * delay * 1000);
    });
  }

  private playStaggered(animationIds: string[], stagger: number): void {
    animationIds.forEach((id, index) => {
      setTimeout(() => {
        this.play(id);
      }, index * stagger * 1000);
    });
  }

  // Enhanced control methods
  play(id: string): boolean {
    const metadata = this.animations.get(id);
    if (!metadata?.instance?.play) return false;

    try {
      metadata.instance.play();
      metadata.state = "running";
      this.emit("animationStateChange", id, "running");
      return true;
    } catch (error) {
      this.emit(
        "animationError",
        id,
        error instanceof Error ? error : new Error(String(error))
      );
      return false;
    }
  }

  pause(id: string): boolean {
    const metadata = this.animations.get(id);
    if (!metadata?.instance?.pause) return false;

    try {
      metadata.instance.pause();
      metadata.state = "paused";
      this.emit("animationStateChange", id, "paused");
      return true;
    } catch (error) {
      this.emit(
        "animationError",
        id,
        error instanceof Error ? error : new Error(String(error))
      );
      return false;
    }
  }

  restart(id: string): boolean {
    const metadata = this.animations.get(id);
    if (!metadata?.instance?.restart) return false;

    try {
      metadata.instance.restart();
      metadata.state = "running";
      this.emit("animationStateChange", id, "running");
      return true;
    } catch (error) {
      this.emit(
        "animationError",
        id,
        error instanceof Error ? error : new Error(String(error))
      );
      return false;
    }
  }

  reverse(id: string): boolean {
    const metadata = this.animations.get(id);
    if (!metadata?.instance?.reverse) return false;

    try {
      metadata.instance.reverse();
      metadata.state = "running";
      this.emit("animationStateChange", id, "running");
      return true;
    } catch (error) {
      this.emit(
        "animationError",
        id,
        error instanceof Error ? error : new Error(String(error))
      );
      return false;
    }
  }

  // Batch control methods
  playBatch(batchId: string): boolean {
    const batch = this.batches.get(batchId);
    if (!batch) return false;

    const results = batch.animationIds.map((id) => this.play(id));
    return results.every(Boolean);
  }

  pauseBatch(batchId: string): boolean {
    const batch = this.batches.get(batchId);
    if (!batch) return false;

    const results = batch.animationIds.map((id) => this.pause(id));
    return results.every(Boolean);
  }

  // Query system
  query(filters: AnimationQuery): AnimationMetadata[] {
    const results: AnimationMetadata[] = [];

    this.animations.forEach((metadata) => {
      let matches = true;

      if (filters.type && metadata.type !== filters.type) matches = false;
      if (filters.state && metadata.state !== filters.state) matches = false;
      if (filters.element && metadata.element !== filters.element)
        matches = false;
      if (filters.priority && metadata.priority !== filters.priority)
        matches = false;
      if (filters.createdAfter && metadata.createdAt < filters.createdAfter)
        matches = false;
      if (filters.createdBefore && metadata.createdAt > filters.createdBefore)
        matches = false;
      if (filters.tags) {
        const hasAllTags = filters.tags.every((tag) => metadata.tags.has(tag));
        if (!hasAllTags) matches = false;
      }

      if (matches) results.push(metadata);
    });

    return results;
  }

  // Bulk operations
  playByTag(tag: string): number {
    const animations = this.query({ tags: [tag] });
    let count = 0;
    animations.forEach((metadata) => {
      if (this.play(metadata.id)) count++;
    });
    return count;
  }

  pauseByTag(tag: string): number {
    const animations = this.query({ tags: [tag] });
    let count = 0;
    animations.forEach((metadata) => {
      if (this.pause(metadata.id)) count++;
    });
    return count;
  }

  destroyByTag(tag: string): number {
    const animations = this.query({ tags: [tag] });
    let count = 0;
    animations.forEach((metadata) => {
      if (this.destroy(metadata.id)) count++;
    });
    return count;
  }

  // Cleanup methods
  destroy(id: string): boolean {
    const metadata = this.animations.get(id);
    if (!metadata) return false;

    try {
      if (metadata.instance?.destroy) {
        metadata.instance.destroy();
      }
      this.animations.delete(id);
      this.emit("animationDestroyed", id, metadata.type);
      return true;
    } catch (error) {
      this.emit(
        "animationError",
        id,
        error instanceof Error ? error : new Error(String(error))
      );
      return false;
    }
  }

  destroyBatch(batchId: string): boolean {
    const batch = this.batches.get(batchId);
    if (!batch) return false;

    const results = batch.animationIds.map((id) => this.destroy(id));
    this.batches.delete(batchId);

    const completedIds = batch.animationIds.filter(
      (id, index) => results[index]
    );
    this.emit("batchComplete", batchId, completedIds);

    return results.every(Boolean);
  }

  destroyAll(): void {
    const ids = Array.from(this.animations.keys());
    ids.forEach((id) => this.destroy(id));
    this.batches.clear();
  }

  private cleanupCompletedAnimations(): void {
    const completedAnimations = this.query({ state: "completed" });
    const oldAnimations = completedAnimations.filter(
      (metadata) => Date.now() - metadata.createdAt > 300000 // 5 minutes
    );

    oldAnimations.forEach((metadata) => {
      this.destroy(metadata.id);
    });

    if (oldAnimations.length > 0) {
      console.log(`Cleaned up ${oldAnimations.length} completed animations`);
    }
  }

  // Information and statistics
  getAnimation(id: string): AnimationMetadata | undefined {
    return this.animations.get(id);
  }

  getAllAnimations(): Map<string, AnimationMetadata> {
    return new Map(this.animations);
  }

  getAnimationsByType(type: string): AnimationMetadata[] {
    return this.query({ type });
  }

  getAnimationsByState(state: AnimationState): AnimationMetadata[] {
    return this.query({ state });
  }

  getStats(): {
    total: number;
    byType: Record<string, number>;
    byState: Record<string, number>;
    batches: number;
  } {
    const stats = {
      total: this.animations.size,
      byType: {} as Record<string, number>,
      byState: {} as Record<string, number>,
      batches: this.batches.size,
    };

    this.animations.forEach((metadata) => {
      stats.byType[metadata.type] = (stats.byType[metadata.type] || 0) + 1;
      stats.byState[metadata.state] = (stats.byState[metadata.state] || 0) + 1;
    });

    return stats;
  }

  // Performance monitoring
  getPerformanceMetrics(): PerformanceMetrics & { totalAnimations: number } {
    const engineMetrics = this.engine.getPerformanceMetrics();
    const activeCount = this.query({ state: "running" }).length;

    return {
      ...engineMetrics,
      activeAnimations: activeCount,
      totalAnimations: this.animations.size,
    };
  }

  setMaxAnimations(max: number): void {
    this.maxAnimations = max;
  }

  // Event system
  on<T extends keyof AnimationEvents>(
    event: T,
    listener: AnimationEvents[T]
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener as EventHandler);
  }

  off<T extends keyof AnimationEvents>(
    event: T,
    listener: AnimationEvents[T]
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener as EventHandler);
    }
  }

  private emit<T extends keyof AnimationEvents>(
    event: T,
    ...args: Parameters<AnimationEvents[T]>
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          (listener as any)(...args);
        } catch (error) {
          console.error(`Event listener error for ${event}:`, error);
        }
      });
    }
  }

  // Add method to get error history
  getErrorHistory(): AnimationError[] {
    return [...this.errorLog];
  }

  // Add method to clear error history
  clearErrorHistory(): void {
    this.errorLog = [];
  }

  // Utility methods
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup and disposal
  dispose(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    // Stop monitoring first
    this.stopPerformanceMonitoring();

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }

    // Destroy all animations
    this.destroyAll();

    // Clear event listeners
    this.eventListeners.clear();

    // Clear error log
    this.errorLog = [];

    // Dispose engine
    if (this.engine && typeof this.engine.dispose === "function") {
      this.engine.dispose();
    }

    // Clear static instance
    (AnimationManager as any).instance = null;
  }
}
