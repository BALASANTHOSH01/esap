import { EnhancedAnimationEngine } from './AnimationEngine';
import type { AnimationInstance, AnimationOptions, TriggerOptions, } from '../types/core';

export abstract class BaseAnimation {
  protected engine: EnhancedAnimationEngine;
  protected element: HTMLElement;
  protected timeline: gsap.core.Timeline;
  protected options: AnimationOptions & TriggerOptions;
  protected observer?: IntersectionObserver;
  protected isDestroyed = false;

  constructor(element: HTMLElement, options: AnimationOptions & TriggerOptions = {}) {
    this.engine = EnhancedAnimationEngine.getInstance();
    this.element = element;
    this.options = this.mergeDefaultOptions(options);
    this.timeline = this.engine.createTimeline(this.options);
    
    this.initialize();
  }

  protected mergeDefaultOptions(options: AnimationOptions & TriggerOptions): AnimationOptions & TriggerOptions {
    return {
      duration: 1,
      delay: 0,
      ease: 'power2.out',
      trigger: 'immediate',
      threshold: 0.1,
      once: true,
      ...options
    };
  }

  protected initialize(): void {
    this.setupTrigger();
    this.createAnimation();
  }

  protected setupTrigger(): void {
    switch (this.options.trigger) {
      case 'scroll':
        this.setupScrollTrigger();
        break;
      case 'click':
        this.element.addEventListener('click', this.handleTrigger.bind(this));
        break;
      case 'hover':
        this.element.addEventListener('mouseenter', this.handleTrigger.bind(this));
        break;
      case 'immediate':
      default:
        // Animation will start immediately after creation
        break;
    }
  }

  protected setupScrollTrigger(): void {
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
      {
        threshold: this.options.threshold,
        rootMargin: this.options.rootMargin || '0px'
      }
    );
    this.observer.observe(this.element);
  }

  protected handleTrigger(): void {
    this.play();
  }

  protected abstract createAnimation(): void;

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
    
    // Clean up event listeners
    this.element.removeEventListener('click', this.handleTrigger.bind(this));
    this.element.removeEventListener('mouseenter', this.handleTrigger.bind(this));
  }

  getInstance(): AnimationInstance {
    return {
      element: this.element,
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