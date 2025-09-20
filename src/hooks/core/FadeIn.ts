import { gsap } from "gsap";
import { BaseAnimation } from "../../core/BaseAnimation";
import type { FadeInOptions } from "../../types/core";

export class FadeIn extends BaseAnimation {
  private fadeOptions: FadeInOptions;

  constructor(element: HTMLElement, options: FadeInOptions = {}) {
    super(element, options);
    this.fadeOptions = {
      from: 0,
      to: 1,
      ...options,
    };
  }

  protected createAnimation(): void {
    // Set initial state
    gsap.set(this.element, {
      opacity: this.fadeOptions.from,
    });

    // Create fade animation
    this.timeline.to(this.element, {
      opacity: this.fadeOptions.to,
      duration: this.options.duration,
      ease: this.options.ease,
    });
  }
}

// Factory function for ease of use
export function createFadeIn(
  element: HTMLElement | string,
  options: FadeInOptions = {}
): FadeIn {
  const el =
    typeof element === "string"
      ? (document.querySelector(element) as HTMLElement)
      : element;
  if (!el) throw new Error(`Element not found: ${element}`);

  return new FadeIn(el, options);
}
