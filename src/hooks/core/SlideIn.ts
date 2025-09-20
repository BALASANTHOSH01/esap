import { gsap } from 'gsap';
import { BaseAnimation } from '../../core/BaseAnimation';
import type { SlideInOptions } from '../../types/core';

export class SlideIn extends BaseAnimation {
  private slideOptions: SlideInOptions;

  constructor(element: HTMLElement, options: SlideInOptions) {
    super(element, options);
    this.slideOptions = {
      distance: 50,
      ...options
    };
  }

  protected createAnimation(): void {
    const { direction, distance } = this.slideOptions;
    const fromProps: gsap.TweenVars = { opacity: 0 };
    const toProps: gsap.TweenVars = { opacity: 1 };

    // Set initial position based on direction
    switch (direction) {
      case 'up':
        fromProps.y = distance;
        toProps.y = 0;
        break;
      case 'down':
        fromProps.y = -distance!;
        toProps.y = 0;
        break;
      case 'left':
        fromProps.x = distance;
        toProps.x = 0;
        break;
      case 'right':
        fromProps.x = -distance!;
        toProps.x = 0;
        break;
    }

    // Set initial state
    gsap.set(this.element, fromProps);

    // Create slide animation
    this.timeline.to(this.element, {
      ...toProps,
      duration: this.options.duration,
      ease: this.options.ease
    });
  }
}

export function createSlideIn(
  element: HTMLElement | string, 
  options: SlideInOptions
): SlideIn {
  const el = typeof element === 'string' ? document.querySelector(element) as HTMLElement : element;
  if (!el) throw new Error(`Element not found: ${element}`);
  
  return new SlideIn(el, options);
}