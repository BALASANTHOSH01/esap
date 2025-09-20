// In Parallax.ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ParallaxOptions, AnimationInstance } from '../../types/core';

export class Parallax {
  private element: HTMLElement;
  private options: ParallaxOptions;
  private scrollTrigger?: ScrollTrigger;
  private isDestroyed = false;

  constructor(element: HTMLElement, options: ParallaxOptions = {}) {
    this.element = element;
    this.options = {
      speed: 0.5,
      direction: 'vertical',
      smooth: true,
      bounds: {},
      ...options
    };
    
    this.initialize();
  }

  private initialize(): void {
    this.createParallax();
  }

  private createParallax(): void {
    const { speed, direction, smooth } = this.options;
    
    if (direction === 'vertical') {
      this.scrollTrigger = ScrollTrigger.create({
        trigger: this.element,
        start: this.options.bounds?.start || 'top bottom',
        end: this.options.bounds?.end || 'bottom top',
        scrub: smooth ? 1 : true,
        onUpdate: (self) => {
          const progress = self.progress;
          const yPos = progress * (speed! * 100);
          gsap.set(this.element, { y: yPos });
        }
      });
    } else {
      this.scrollTrigger = ScrollTrigger.create({
        trigger: this.element,
        start: this.options.bounds?.start || 'left right',
        end: this.options.bounds?.end || 'right left',
        horizontal: true,
        scrub: smooth ? 1 : true,
        onUpdate: (self) => {
          const progress = self.progress;
          const xPos = progress * (speed! * 100);
          gsap.set(this.element, { x: xPos });
        }
      });
    }
  }

  updateSpeed(speed: number): void {
    this.options.speed = speed;
    this.refresh();
  }

  refresh(): void {
    if (this.scrollTrigger) {
      this.scrollTrigger.refresh();
    }
  }

  destroy(): void {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    if (this.scrollTrigger) {
      this.scrollTrigger.kill();
    }
  }

  getInstance(): AnimationInstance {
    return {
      element: this.element,
      options: this.options,
      destroy: this.destroy.bind(this),
      play: () => {}, // No play functionality, empty implementation
      pause: () => {}, // No pause functionality, empty implementation
      restart: () => {}, // No restart functionality, empty implementation
      reverse: () => {}, // No reverse functionality, empty implementation
      progress: () => 0 // Return 0 as no progress tracking
    };
  }
}

export function createParallax(
  element: HTMLElement | string,
  options: ParallaxOptions = {}
): Parallax {
  const el = typeof element === 'string' ? 
    document.querySelector(element) as HTMLElement : 
    element;
  if (!el) throw new Error(`Element not found: ${element}`);
  
  return new Parallax(el, options);
}