import { gsap } from 'gsap';
import { AdvancedAnimationEngine } from '../../core/AnimationEngine'; // Updated import
import type { StaggerOptions, AnimationInstance } from '../../types/core';

export class Stagger {
  private engine: AdvancedAnimationEngine; 
  private container: HTMLElement;
  private elements: HTMLElement[];
  private timeline: gsap.core.Timeline;
  private options: StaggerOptions;
  private observer?: IntersectionObserver;
  private isDestroyed = false;

  constructor(
    container: HTMLElement, 
    selector: string, 
    options: StaggerOptions = {}
  ) {
    this.engine = AdvancedAnimationEngine.getInstance(); // Fixed instance access
    this.container = container;
    this.elements = Array.from(container.querySelectorAll(selector));
    this.options = {
      duration: 0.8,
      delay: 0,
      ease: 'power2.out',
      stagger: 0.1,
      trigger: 'immediate',
      threshold: 0.1,
      once: true,
      from: 'start',
      ...options
    };
    
    this.timeline = this.engine.createTimeline(this.options);
    this.initialize();
  }

  private initialize(): void {
    this.setupTrigger();
    this.createAnimation();
  }

  private setupTrigger(): void {
    if (this.options.trigger === 'scroll') {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio >= this.options.threshold!) {
              this.play();
              if (this.options.once) {
                this.observer?.disconnect();
              }
            }
          });
        },
        { threshold: this.options.threshold }
      );
      this.observer.observe(this.container);
    }
  }

  private createAnimation(): void {
    if (this.elements.length === 0) return;

    gsap.set(this.elements, {
      opacity: 0,
      y: 30
    });

    this.timeline.to(this.elements, {
      opacity: 1,
      y: 0,
      duration: this.options.duration,
      ease: this.options.ease,
      stagger: {
        amount: this.options.stagger! * this.elements.length,
        from: this.options.from
      }
    });
  }

  play(): void {
    if (!this.isDestroyed) {
      this.timeline.play();
    }
  }

  pause(): void {
    if (!this.isDestroyed) {
      this.timeline.pause();
    }
  }

  restart(): void {
    if (!this.isDestroyed) {
      this.timeline.restart();
    }
  }

  reverse(): void {
    if (!this.isDestroyed) {
      this.timeline.reverse();
    }
  }

  progress(value?: number): number | void {
    if (this.isDestroyed) return 0;
    
    if (value !== undefined) {
      this.timeline.progress(value);
    } else {
      return this.timeline.progress();
    }
  }

  destroy(): void {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    this.timeline.kill();
    this.observer?.disconnect();
  }

  getInstance(): AnimationInstance {
    return {
      element: this.container,
      timeline: this.timeline,
      options: this.options,
      destroy: this.destroy.bind(this),
      play: this.play.bind(this),
      pause: this.pause.bind(this),
      restart: this.restart.bind(this),
      reverse: this.reverse.bind(this),
      progress: this.progress.bind(this)
    };
  }
}

export function createStagger(
  container: HTMLElement | string,
  selector: string,
  options: StaggerOptions = {}
): Stagger {
  const el = typeof container === 'string' ? 
    document.querySelector(container) as HTMLElement : 
    container;
  if (!el) throw new Error(`Container not found: ${container}`);
  
  return new Stagger(el, selector, options);
}