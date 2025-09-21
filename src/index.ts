// Simple, working ESAP library without complex dependencies

// Import only the classes that actually exist
import { FadeIn } from './hooks/core/FadeIn';
import { SlideIn } from './hooks/core/SlideIn';
import { TextReveal } from './hooks/core/TextReveal';

// Try to import AnimationManager, but don't fail if it doesn't exist
let AnimationManager: any = null;
try {
  const { AnimationManager: AM } = require('./core/AnimationManager');
  AnimationManager = AM;
} catch {
  console.warn('AnimationManager not available, using direct animation creation');
}

// Simple local interfaces
interface FadeOptions {
  duration?: number;
  delay?: number;
  ease?: string;
  from?: number;
  to?: number;
}

interface SlideOptions {
  direction: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
  delay?: number;
  ease?: string;
}

interface TextOptions {
  type?: 'chars' | 'words' | 'lines' | 'sentences';
  duration?: number;
  delay?: number;
  ease?: string;
  preserveSpaces?: boolean;
}

interface AnimationResult {
  id: string;
  success: boolean;
  error?: string;
  animation?: any;
}

// Simple animation storage
class SimpleAnimationStore {
  private animations = new Map<string, any>();
  private counter = 0;

  generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${++this.counter}`;
  }

  store(id: string, animation: any): void {
    this.animations.set(id, animation);
  }

  get(id: string): any {
    return this.animations.get(id);
  }

  has(id: string): boolean {
    return this.animations.has(id);
  }

  delete(id: string): boolean {
    return this.animations.delete(id);
  }

  clear(): void {
    this.animations.clear();
  }

  size(): number {
    return this.animations.size;
  }

  getAll(): any[] {
    return Array.from(this.animations.values());
  }
}

export class ESAP {
  private store = new SimpleAnimationStore();
  private manager: any = null;

  constructor() {
    if (AnimationManager) {
      try {
        this.manager = AnimationManager.getInstance ? AnimationManager.getInstance() : new AnimationManager();
      } catch (error) {
        console.warn('Failed to initialize AnimationManager:', error);
      }
    }
  }

  fadeIn(element: HTMLElement | string, options: FadeOptions = {}): AnimationResult {
    try {
      // Get element
      const el = typeof element === 'string' 
        ? document.querySelector(element) as HTMLElement
        : element;

      if (!el) {
        return {
          id: '',
          success: false,
          error: `Element not found: ${element}`
        };
      }

      // Create animation
      const animation = new FadeIn(el, options as any);
      const id = this.store.generateId('fade');
      
      this.store.store(id, animation);
      animation.play();

      return {
        id,
        success: true,
        animation
      };

    } catch (error) {
      return {
        id: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  slideIn(element: HTMLElement | string, options: SlideOptions): AnimationResult {
    try {
      // Get element
      const el = typeof element === 'string' 
        ? document.querySelector(element) as HTMLElement
        : element;

      if (!el) {
        return {
          id: '',
          success: false,
          error: `Element not found: ${element}`
        };
      }

      // Ensure direction is set
      if (!options.direction) {
        options.direction = 'up';
      }

      // Create animation
      const animation = new SlideIn(el, options as any);
      const id = this.store.generateId('slide');
      
      this.store.store(id, animation);
      animation.play();

      return {
        id,
        success: true,
        animation
      };

    } catch (error) {
      return {
        id: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  textReveal(element: HTMLElement | string, options: TextOptions = {}): AnimationResult {
    try {
      // Get element
      const el = typeof element === 'string' 
        ? document.querySelector(element) as HTMLElement
        : element;

      if (!el) {
        return {
          id: '',
          success: false,
          error: `Element not found: ${element}`
        };
      }

      // Create animation
      const animation = new TextReveal(el, options as any);
      const id = this.store.generateId('text');
      
      this.store.store(id, animation);
      animation.play();

      return {
        id,
        success: true,
        animation
      };

    } catch (error) {
      return {
        id: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Batch methods
  batchFadeIn(selector: string, options: FadeOptions = {}): AnimationResult[] {
    const elements = document.querySelectorAll(selector);
    return Array.from(elements).map(el => this.fadeIn(el as HTMLElement, options));
  }

  batchSlideIn(selector: string, options: SlideOptions): AnimationResult[] {
    const elements = document.querySelectorAll(selector);
    return Array.from(elements).map(el => this.slideIn(el as HTMLElement, options));
  }

  batchTextReveal(selector: string, options: TextOptions = {}): AnimationResult[] {
    const elements = document.querySelectorAll(selector);
    return Array.from(elements).map(el => this.textReveal(el as HTMLElement, options));
  }

  // Control methods
  play(id: string): boolean {
    try {
      const animation = this.store.get(id);
      if (animation && typeof animation.play === 'function') {
        animation.play();
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to play animation ${id}:`, error);
      return false;
    }
  }

  pause(id: string): boolean {
    try {
      const animation = this.store.get(id);
      if (animation && typeof animation.pause === 'function') {
        animation.pause();
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to pause animation ${id}:`, error);
      return false;
    }
  }

  restart(id: string): boolean {
    try {
      const animation = this.store.get(id);
      if (animation && typeof animation.restart === 'function') {
        animation.restart();
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to restart animation ${id}:`, error);
      return false;
    }
  }

  reverse(id: string): boolean {
    try {
      const animation = this.store.get(id);
      if (animation && typeof animation.reverse === 'function') {
        animation.reverse();
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to reverse animation ${id}:`, error);
      return false;
    }
  }

  destroy(id: string): boolean {
    try {
      const animation = this.store.get(id);
      if (animation && typeof animation.destroy === 'function') {
        animation.destroy();
      }
      return this.store.delete(id);
    } catch (error) {
      console.error(`Failed to destroy animation ${id}:`, error);
      return false;
    }
  }

  destroyAll(): void {
    try {
      this.store.getAll().forEach(animation => {
        if (animation && typeof animation.destroy === 'function') {
          animation.destroy();
        }
      });
      this.store.clear();
    } catch (error) {
      console.error('Failed to destroy all animations:', error);
    }
  }

  // Utility methods
  getAnimation(id: string): any {
    return this.store.get(id);
  }

  hasAnimation(id: string): boolean {
    return this.store.has(id);
  }

  getAnimationCount(): number {
    return this.store.size();
  }

  getAllAnimations(): any[] {
    return this.store.getAll();
  }

  // Status
  getStatus() {
    return {
      animationCount: this.getAnimationCount(),
      managerAvailable: !!this.manager,
      store: 'active'
    };
  }
}

// Create default instance
const esap = new ESAP();

// Simple exports
export default esap;

export const fade = (element: HTMLElement | string, options?: FadeOptions) => 
  esap.fadeIn(element, options);

export const slide = (element: HTMLElement | string, direction: 'up' | 'down' | 'left' | 'right' = 'up', options?: Omit<SlideOptions, 'direction'>) => 
  esap.slideIn(element, { direction, ...options });

export const text = (element: HTMLElement | string, options?: TextOptions) => 
  esap.textReveal(element, options);

// Quick presets
export const presets = {
  quickFade: { duration: 0.3 },
  smoothFade: { duration: 1.2 },
  quickSlide: { duration: 0.4, direction: 'up' as const },
  smoothSlide: { duration: 1, direction: 'up' as const },
  charReveal: { type: 'chars' as const, duration: 0.8 },
  wordReveal: { type: 'words' as const, duration: 1 }
};

// Re-export classes for direct use
export { FadeIn, SlideIn, TextReveal };

// Version
export const version = '1.0.0';