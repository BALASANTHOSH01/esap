import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import type { AnimationInstance, AnimationOptions } from '../types/core';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin);

// Enhanced performance monitoring
export interface PerformanceMetrics {
  totalAnimations: number;
  activeAnimations: number;
  averageFPS: number;
  memoryUsage: number;
  lastFrameTime: number;
  droppedFrames: number;
}

// Animation registry for better management
export interface AnimationRegistryEntry {
  id: string;
  instance: AnimationInstance | any;
  type: 'basic' | 'scroll' | 'text' | 'morph' | 'stagger' | 'parallax' | 'custom';
  element: HTMLElement;
  createdAt: number;
  lastUpdated: number;
  priority: number;
}

// Enhanced animation engine with superior performance and features
export class EnhancedAnimationEngine {
  private static instance: EnhancedAnimationEngine;
  private animationRegistry: Map<string, AnimationRegistryEntry> = new Map();
  private performanceMonitor: PerformanceMonitor;
  private rafId: number | null = null;
  private isRunning = false;

  private globalSettings = {
    defaultDuration: 1,
    defaultEase: 'power2.out',
    respectReducedMotion: true,
    debugMode: false,
    maxConcurrentAnimations: 50,
    targetFPS: 60,
    autoOptimize: true,
    memoryThreshold: 100, // MB
    prioritySystem: true
  };

  private reducedMotionSettings = {
    duration: 0.01,
    ease: 'none',
    skipAnimations: false
  };

  static getInstance(): EnhancedAnimationEngine {
    if (!EnhancedAnimationEngine.instance) {
      EnhancedAnimationEngine.instance = new EnhancedAnimationEngine();
    }
    return EnhancedAnimationEngine.instance;
  }

  private constructor() {
    this.performanceMonitor = new PerformanceMonitor();
    this.initialize();
  }

  private initialize(): void {
    this.setupReducedMotionHandling();
    this.setupGlobalSettings();
    this.setupPerformanceMonitoring();
    this.setupVisibilityHandling();
    this.setupMemoryManagement();
    
    // Start the engine
    this.start();
  }

  private setupReducedMotionHandling(): void {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleReducedMotion = (e: MediaQueryListEvent | MediaQueryList) => {
      if (this.globalSettings.respectReducedMotion && e.matches) {
        // Apply reduced motion settings
        gsap.defaults({
          duration: this.reducedMotionSettings.duration,
          ease: this.reducedMotionSettings.ease
        });
        
        // Optionally skip animations entirely
        if (this.reducedMotionSettings.skipAnimations) {
          this.pauseAll();
        }
      } else {
        // Restore normal settings
        gsap.defaults({
          duration: this.globalSettings.defaultDuration,
          ease: this.globalSettings.defaultEase
        });
        
        if (this.reducedMotionSettings.skipAnimations) {
          this.resumeAll();
        }
      }
    };

    // Initial check
    handleReducedMotion(mediaQuery);
    
    // Listen for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleReducedMotion);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleReducedMotion);
    }
  }

  private setupGlobalSettings(): void {
    gsap.defaults({
      duration: this.globalSettings.defaultDuration,
      ease: this.globalSettings.defaultEase
    });

    // Set up global scroll trigger defaults
    ScrollTrigger.defaults({
      toggleActions: 'play pause resume reverse',
      scroller: window
    });

    // Configure debug mode if enabled
    if (this.globalSettings.debugMode) {
      ScrollTrigger.defaults({ markers: true });
    }
  }

  private setupPerformanceMonitoring(): void {
    this.performanceMonitor.onPerformanceIssue((metrics) => {
      if (this.globalSettings.autoOptimize) {
        this.handlePerformanceIssue(metrics);
      }
    });
  }

  private setupVisibilityHandling(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAll();
      } else {
        this.resumeAll();
      }
    });

    // Handle window focus/blur
    window.addEventListener('focus', () => this.resumeAll());
    window.addEventListener('blur', () => this.pauseAll());
  }

  private setupMemoryManagement(): void {
    // Periodic cleanup
    setInterval(() => {
      this.cleanupInactiveAnimations();
      this.optimizeMemory();
    }, 30000); // Every 30 seconds

    // Listen for memory pressure (if available)
    if ('memory' in performance) {
      setInterval(() => {
        const memInfo = (performance as any).memory;
        if (memInfo.usedJSHeapSize > this.globalSettings.memoryThreshold * 1024 * 1024) {
          this.handleMemoryPressure();
        }
      }, 10000);
    }
  }

  // Enhanced animation creation with better management
  createTimeline(options: AnimationOptions = {}): gsap.core.Timeline {
    const timeline = gsap.timeline({
      duration: options.duration || this.globalSettings.defaultDuration,
      delay: options.delay || 0,
      ease: options.ease || this.globalSettings.defaultEase,
      repeat: options.repeat || 0,
      yoyo: options.yoyo || false,
      onComplete: options.onComplete,
      onStart: options.onStart,
      onUpdate: () => {
        if (options.onUpdate) {
          options.onUpdate(timeline.progress());
        }
        this.performanceMonitor.recordFrame();
      }
    });

    return timeline;
  }

  // Enhanced registration with better metadata
  registerAnimation(
    id: string, 
    instance: AnimationInstance | any, 
    element: HTMLElement,
    type: AnimationRegistryEntry['type'] = 'basic',
    priority: number = 1
  ): boolean {
    try {
      // Check if we've hit the concurrent animation limit
      if (this.getActiveAnimationCount() >= this.globalSettings.maxConcurrentAnimations) {
        if (this.globalSettings.prioritySystem) {
          this.removeLowestPriorityAnimation();
        } else {
          console.warn('Maximum concurrent animations reached');
          return false;
        }
      }

      const entry: AnimationRegistryEntry = {
        id,
        instance,
        type,
        element,
        createdAt: Date.now(),
        lastUpdated: Date.now(),
        priority
      };

      this.animationRegistry.set(id, entry);
      
      // Add cleanup when animation completes
      if (instance.timeline) {
        const originalOnComplete = instance.timeline.vars.onComplete;
        instance.timeline.vars.onComplete = () => {
          if (originalOnComplete) originalOnComplete();
          this.unregisterAnimation(id);
        };
      }

      return true;
    } catch (error) {
      console.error('Failed to register animation:', error);
      return false;
    }
  }

  unregisterAnimation(id: string): boolean {
    try {
      const entry = this.animationRegistry.get(id);
      if (entry) {
        // Proper cleanup
        if (entry.instance.destroy) {
          entry.instance.destroy();
        } else if (entry.instance.kill) {
          entry.instance.kill();
        }
        
        this.animationRegistry.delete(id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to unregister animation:', error);
      return false;
    }
  }

  // Enhanced control methods
  pauseAll(): void {
    this.animationRegistry.forEach(entry => {
      try {
        if (entry.instance.pause) {
          entry.instance.pause();
        } else if (entry.instance.timeline && entry.instance.timeline.pause) {
          entry.instance.timeline.pause();
        }
      } catch (error) {
        console.warn(`Failed to pause animation ${entry.id}:`, error);
      }
    });
  }

  resumeAll(): void {
    this.animationRegistry.forEach(entry => {
      try {
        if (entry.instance.play) {
          entry.instance.play();
        } else if (entry.instance.timeline && entry.instance.timeline.play) {
          entry.instance.timeline.play();
        }
      } catch (error) {
        console.warn(`Failed to resume animation ${entry.id}:`, error);
      }
    });
  }

  pauseByType(type: AnimationRegistryEntry['type']): void {
    this.getAnimationsByType(type).forEach(entry => {
      try {
        if (entry.instance.pause) {
          entry.instance.pause();
        }
      } catch (error) {
        console.warn(`Failed to pause ${type} animation ${entry.id}:`, error);
      }
    });
  }

  resumeByType(type: AnimationRegistryEntry['type']): void {
    this.getAnimationsByType(type).forEach(entry => {
      try {
        if (entry.instance.play) {
          entry.instance.play();
        }
      } catch (error) {
        console.warn(`Failed to resume ${type} animation ${entry.id}:`, error);
      }
    });
  }

  killAll(): void {
    const entries = Array.from(this.animationRegistry.values());
    entries.forEach(entry => {
      this.unregisterAnimation(entry.id);
    });
    this.animationRegistry.clear();
  }

  killByType(type: AnimationRegistryEntry['type']): void {
    this.getAnimationsByType(type).forEach(entry => {
      this.unregisterAnimation(entry.id);
    });
  }

  // Advanced query methods
  getAnimationsByType(type: AnimationRegistryEntry['type']): AnimationRegistryEntry[] {
    return Array.from(this.animationRegistry.values()).filter(entry => entry.type === type);
  }

  getAnimationsByElement(element: HTMLElement): AnimationRegistryEntry[] {
    return Array.from(this.animationRegistry.values()).filter(entry => entry.element === element);
  }

  getAnimationById(id: string): AnimationRegistryEntry | undefined {
    return this.animationRegistry.get(id);
  }

  getActiveAnimationCount(): number {
    return Array.from(this.animationRegistry.values()).filter(entry => {
      try {
        if (entry.instance.timeline) {
          return entry.instance.timeline.isActive();
        }
        return entry.instance.isActive ? entry.instance.isActive() : false;
      } catch {
        return false;
      }
    }).length;
  }

  // Performance optimization methods
  private handlePerformanceIssue(metrics: PerformanceMetrics): void {
    if (metrics.averageFPS < this.globalSettings.targetFPS * 0.8) {
      // Reduce animation quality
      this.reduceAnimationQuality();
    }

    if (metrics.droppedFrames > 10) {
      // Pause low priority animations
      this.pauseLowPriorityAnimations();
    }
  }

  private reduceAnimationQuality(): void {
    this.animationRegistry.forEach(entry => {
      if (entry.instance.timeline) {
        // Reduce frame rate for complex animations
        entry.instance.timeline.timeScale(0.8);
      }
    });
  }

  private pauseLowPriorityAnimations(): void {
    const sortedAnimations = Array.from(this.animationRegistry.values())
      .sort((a, b) => a.priority - b.priority);
    
    const lowPriorityCount = Math.floor(sortedAnimations.length * 0.3);
    sortedAnimations.slice(0, lowPriorityCount).forEach(entry => {
      try {
        if (entry.instance.pause) {
          entry.instance.pause();
        }
      } catch (error) {
        console.warn(`Failed to pause low priority animation ${entry.id}:`, error);
      }
    });
  }

  private removeLowestPriorityAnimation(): void {
    let lowestPriority = Infinity;
    let lowestPriorityId = '';

    this.animationRegistry.forEach((entry, id) => {
      if (entry.priority < lowestPriority) {
        lowestPriority = entry.priority;
        lowestPriorityId = id;
      }
    });

    if (lowestPriorityId) {
      this.unregisterAnimation(lowestPriorityId);
    }
  }

  private cleanupInactiveAnimations(): void {
    const now = Date.now();
    const inactiveThreshold = 60000; // 1 minute

    const toRemove: string[] = [];
    this.animationRegistry.forEach((entry, id) => {
      // Check if animation is inactive
      const isInactive = now - entry.lastUpdated > inactiveThreshold;
      const isComplete = entry.instance.timeline ? 
        entry.instance.timeline.progress() >= 1 : false;

      if (isInactive || isComplete) {
        toRemove.push(id);
      }
    });

    toRemove.forEach(id => this.unregisterAnimation(id));
  }

  private optimizeMemory(): void {
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }

    // Clear GSAP cache periodically
    gsap.globalTimeline.clear();
  }

  private handleMemoryPressure(): void {
    console.warn('Memory pressure detected, optimizing...');
    
    // Kill oldest animations first
    const sortedByAge = Array.from(this.animationRegistry.values())
      .sort((a, b) => a.createdAt - b.createdAt);
    
    const toKill = sortedByAge.slice(0, Math.floor(sortedByAge.length * 0.5));
    toKill.forEach(entry => this.unregisterAnimation(entry.id));
  }

  // Enhanced settings management
  updateSettings(newSettings: Partial<typeof this.globalSettings>): void {
    const oldSettings = { ...this.globalSettings };
    this.globalSettings = { ...this.globalSettings, ...newSettings };

    // Apply setting changes
    if (newSettings.defaultDuration !== undefined) {
      gsap.defaults({ duration: newSettings.defaultDuration });
    }

    if (newSettings.defaultEase !== undefined) {
      gsap.defaults({ ease: newSettings.defaultEase });
    }

    if (newSettings.debugMode !== undefined) {
      ScrollTrigger.defaults({ markers: newSettings.debugMode });
    }

    // Handle reduced motion changes
    if (newSettings.respectReducedMotion !== oldSettings.respectReducedMotion) {
      this.setupReducedMotionHandling();
    }
  }

  setGlobalDuration(duration: number): void {
    this.updateSettings({ defaultDuration: Math.max(0.01, duration) });
  }

  setGlobalEase(ease: string): void {
    this.updateSettings({ defaultEase: this.validateEase(ease) });
  }

  enableDebugMode(enable: boolean = true): void {
    this.updateSettings({ debugMode: enable });
  }

  setMaxConcurrentAnimations(max: number): void {
    this.updateSettings({ maxConcurrentAnimations: Math.max(1, max) });
  }

  setTargetFPS(fps: number): void {
    this.updateSettings({ targetFPS: Math.max(24, Math.min(120, fps)) });
  }

  // Validation methods
  private validateEase(ease: string): string {
    const validEases = [
      'none', 'power1', 'power2', 'power3', 'power4',
      'back', 'elastic', 'bounce', 'circ', 'expo', 'sine'
    ];
    
    const easeTypes = ['.in', '.out', '.inOut'];
    const isValidEase = validEases.some(validEase => 
      ease.startsWith(validEase) || 
      easeTypes.some(type => ease === validEase + type)
    );
    
    return isValidEase ? ease : this.globalSettings.defaultEase;
  }

  // Engine lifecycle
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.performanceMonitor.start();
    
    const tick = () => {
      if (!this.isRunning) return;
      
      this.performanceMonitor.tick();
      this.updateAnimations();
      
      this.rafId = requestAnimationFrame(tick);
    };
    
    this.rafId = requestAnimationFrame(tick);
  }

  stop(): void {
    this.isRunning = false;
    this.performanceMonitor.stop();
    
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private updateAnimations(): void {
    const now = Date.now();
    
    this.animationRegistry.forEach(entry => {
      if (entry.instance.timeline && entry.instance.timeline.isActive()) {
        entry.lastUpdated = now;
      }
    });
  }

  // Public API for getting information
  getActiveAnimations(): Map<string, AnimationRegistryEntry> {
    const activeAnimations = new Map<string, AnimationRegistryEntry>();
    
    this.animationRegistry.forEach((entry, id) => {
      try {
        const isActive = entry.instance.timeline ? 
          entry.instance.timeline.isActive() : 
          entry.instance.isActive?.() || false;
          
        if (isActive) {
          activeAnimations.set(id, entry);
        }
      } catch {
        // Animation might be in invalid state, skip it
      }
    });
    
    return activeAnimations;
  }

  getPerformanceMetrics(): PerformanceMetrics {
    return this.performanceMonitor.getMetrics();
  }

  getEngineStats(): EngineStats {
    return {
      totalAnimations: this.animationRegistry.size,
      activeAnimations: this.getActiveAnimationCount(),
      settings: { ...this.globalSettings },
      performance: this.performanceMonitor.getMetrics(),
      memoryUsage: this.getMemoryUsage(),
      uptime: Date.now() - this.performanceMonitor.startTime
    };
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / (1024 * 1024); // MB
    }
    return 0;
  }

  // Utility methods for batch operations
  createAnimationBatch(operations: BatchOperation[]): Promise<void[]> {
    return Promise.all(operations.map(op => op()));
  }

  async createStaggeredBatch(
    operations: BatchOperation[], 
    stagger: number = 100
  ): Promise<void[]> {
    const results: Promise<void>[] = [];
    
    for (let i = 0; i < operations.length; i++) {
      const delay = i * stagger;
      const result = new Promise<void>(resolve => {
        setTimeout(async () => {
          await operations[i]();
          resolve();
        }, delay);
      });
      results.push(result);
    }
    
    return Promise.all(results);
  }

  // Cleanup and disposal
  dispose(): void {
    this.stop();
    this.killAll();
    this.performanceMonitor.dispose();
    
    // Clear all references
    this.animationRegistry.clear();
    
    // Reset GSAP
    gsap.killTweensOf('*');
    ScrollTrigger.killAll();
  }
}

// Performance monitoring class
class PerformanceMonitor {
  private fps = 60;
  private frameCount = 0;
  private lastTime = performance.now();
  private fpsHistory: number[] = [];
  private droppedFrames = 0;
  private callbacks: Array<(metrics: PerformanceMetrics) => void> = [];
  public startTime = Date.now();

  start(): void {
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.droppedFrames = 0;
  }

  tick(): void {
    const now = performance.now();
    const delta = now - this.lastTime;
    
    if (delta >= 16.67) { // ~60fps
      this.frameCount++;
      const currentFPS = 1000 / delta;
      
      this.fpsHistory.push(currentFPS);
      if (this.fpsHistory.length > 60) { // Keep last 60 frames
        this.fpsHistory.shift();
      }
      
      // Count dropped frames
      if (delta > 20) { // More than 20ms between frames
        this.droppedFrames++;
      }
      
      this.lastTime = now;
      
      // Check for performance issues
      if (this.frameCount % 60 === 0) { // Every 60 frames
        const metrics = this.getMetrics();
        this.callbacks.forEach(callback => callback(metrics));
      }
    }
  }

  recordFrame(): void {
    // Additional frame recording for specific animations
  }

  onPerformanceIssue(callback: (metrics: PerformanceMetrics) => void): void {
    this.callbacks.push(callback);
  }

  getMetrics(): PerformanceMetrics {
    const averageFPS = this.fpsHistory.length > 0 
      ? this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length 
      : 60;

    return {
      totalAnimations: 0, // Will be filled by engine
      activeAnimations: 0, // Will be filled by engine
      averageFPS,
      memoryUsage: this.getMemoryUsage(),
      lastFrameTime: this.lastTime,
      droppedFrames: this.droppedFrames
    };
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / (1024 * 1024);
    }
    return 0;
  }

  stop(): void {
    this.callbacks = [];
  }

  dispose(): void {
    this.stop();
    this.fpsHistory = [];
  }
}

// Type definitions
interface EngineStats {
  totalAnimations: number;
  activeAnimations: number;
  settings: any;
  performance: PerformanceMetrics;
  memoryUsage: number;
  uptime: number;
}

type BatchOperation = () => Promise<void>;

// Export enhanced engine as singleton
export const AnimationEngine = EnhancedAnimationEngine.getInstance();