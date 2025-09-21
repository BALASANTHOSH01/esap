import { gsap } from "gsap";

// Proper type definitions
interface TextRevealConfig {
  type?: 'chars' | 'words' | 'lines' | 'sentences';
  duration?: number;
  delay?: number;
  ease?: string;
  preserveSpaces?: boolean;
  onStart?: () => void;
  onComplete?: () => void;
  onUpdate?: (progress: number) => void;
}

interface SplitTextResult {
  elements: HTMLElement[];
  fragment: DocumentFragment;
  cleanup: () => void;
}

// Separate text processing class - single responsibility
class TextProcessor {
  private static tempElements: HTMLElement[] = [];

  static splitText(text: string, type: TextRevealConfig['type'], element?: HTMLElement): string[] {
    switch (type) {
      case 'chars':
        return this.splitByChars(text);
      case 'words': 
        return this.splitByWords(text);
      case 'lines':
        return element ? this.splitByLines(text, element) : this.splitBySimpleLines(text);
      case 'sentences':
        return this.splitBySentences(text);
      default:
        return this.splitByChars(text);
    }
  }

  private static splitByChars(text: string): string[] {
    return text.split('').map(char => {
      if (char === ' ') return '\u00A0';
      return char === '\n' ? '<br>' : char;
    });
  }

  private static splitByWords(text: string): string[] {
    return text.split(/(\s+)/).filter(word => word.length > 0);
  }

  private static splitBySimpleLines(text: string): string[] {
    return text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  }

  private static splitByLines(text: string, element: HTMLElement): string[] {
    // Fast path for simple cases
    if (text.includes('\n')) {
      return this.splitBySimpleLines(text);
    }

    const words = text.split(/\s+/).filter(word => word.length > 0);
    if (words.length <= 5) return [text];

    // Optimized measurement
    return this.measureLines(words, element);
  }

  private static measureLines(words: string[], element: HTMLElement): string[] {
    const temp = document.createElement('div');
    const style = getComputedStyle(element);
    
    temp.style.cssText = `
      position: absolute; visibility: hidden; white-space: nowrap;
      font: ${style.font}; letter-spacing: ${style.letterSpacing};
    `;
    
    document.body.appendChild(temp);
    this.tempElements.push(temp);

    const lines: string[] = [];
    let currentLine = '';
    const maxWidth = element.offsetWidth;

    try {
      words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        temp.textContent = testLine;

        if (temp.offsetWidth > maxWidth && currentLine) {
          lines.push(currentLine.trim());
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });

      if (currentLine) lines.push(currentLine.trim());
    } finally {
      document.body.removeChild(temp);
      this.tempElements = this.tempElements.filter(el => el !== temp);
    }

    return lines.filter(line => line.length > 0);
  }

  private static splitBySentences(text: string): string[] {
    return text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  }

  static cleanup(): void {
    this.tempElements.forEach(el => {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
    this.tempElements = [];
  }
}

// DOM factory - separate concern
class DOMElementFactory {
  static createSplitElements(
    parts: string[], 
    type: TextRevealConfig['type'],
  ): SplitTextResult {
    const fragment = document.createDocumentFragment();
    const elements: HTMLElement[] = [];

    parts.forEach(part => {
      if (part === '<br>') {
        fragment.appendChild(document.createElement('br'));
        return;
      }

      const element = this.createElement(part, type);
      fragment.appendChild(element);
      elements.push(element);
    });

    return {
      elements,
      fragment,
      cleanup: () => {
        elements.forEach(el => {
          if (el.parentNode) el.parentNode.removeChild(el);
        });
      }
    };
  }

  private static createElement(content: string, type: TextRevealConfig['type']): HTMLElement {
    const isLine = type === 'lines';
    const element = document.createElement(isLine ? 'div' : 'span');
    
    element.textContent = content.trim() || content;
    element.style.cssText = `
      ${isLine ? '' : 'display: inline-block;'}
      ${type === 'words' ? 'margin-right: 0.25em;' : ''}
      opacity: 0;
      transform: translateY(20px);
      will-change: transform, opacity;
    `;

    return element;
  }
}

// Animation controller - separate concern
class AnimationController {
  private timeline: gsap.core.Timeline | null = null;
  private elements: HTMLElement[] = [];
  private config: Required<Omit<TextRevealConfig, 'onStart' | 'onComplete' | 'onUpdate'>> & {
    onStart?: () => void;
    onComplete?: () => void;
    onUpdate?: (progress: number) => void;
  };

  constructor(elements: HTMLElement[], config: TextRevealConfig) {
    this.elements = elements;
    this.config = {
      type: config.type || 'chars',
      duration: Math.max(0.1, config.duration || 1),
      delay: Math.max(0, config.delay || 0),
      ease: config.ease || 'power2.out',
      preserveSpaces: config.preserveSpaces !== false,
      onStart: config.onStart,
      onComplete: config.onComplete,
      onUpdate: config.onUpdate,
    };
  }

  createMainAnimation(): gsap.core.Timeline {
    this.timeline = gsap.timeline({
      delay: this.config.delay,
      onStart: this.config.onStart,
      onComplete: this.config.onComplete,
      onUpdate: () => this.config.onUpdate?.(this.timeline?.progress() || 0),
    });

    const stagger = Math.min(0.1, this.config.duration / Math.max(this.elements.length, 1));

    this.timeline.to(this.elements, {
      opacity: 1,
      y: 0,
      duration: this.config.duration,
      ease: this.config.ease,
      stagger: {
        amount: stagger * this.elements.length,
        from: 'start',
      },
    });

    return this.timeline;
  }

  // Advanced animation methods
  async revealByIndex(index: number, duration = 0.3): Promise<void> {
    if (index < 0 || index >= this.elements.length) return;
    
    return new Promise(resolve => {
      gsap.to(this.elements[index], {
        opacity: 1, y: 0, duration,
        ease: 'power2.out',
        onComplete: resolve
      });
    });
  }

  async hideByIndex(index: number, duration = 0.3): Promise<void> {
    if (index < 0 || index >= this.elements.length) return;
    
    return new Promise(resolve => {
      gsap.to(this.elements[index], {
        opacity: 0, y: 20, duration,
        ease: 'power2.out',
        onComplete: resolve
      });
    });
  }

  async revealAll(duration?: number): Promise<void> {
    return new Promise(resolve => {
      gsap.to(this.elements, {
        opacity: 1, y: 0,
        duration: duration || this.config.duration,
        stagger: 0.03,
        ease: this.config.ease,
        onComplete: resolve
      });
    });
  }

  async hideAll(duration = 0.5): Promise<void> {
    return new Promise(resolve => {
      gsap.to(this.elements, {
        opacity: 0, y: 20, duration,
        stagger: 0.02,
        ease: 'power2.out',
        onComplete: resolve
      });
    });
  }

  async revealWave(direction: 'left' | 'right' | 'center' = 'left'): Promise<void> {
    return new Promise(resolve => {
      // Map direction to GSAP stagger from values
      const staggerFrom = direction === 'left' ? 'start' : 
                         direction === 'right' ? 'end' : 'center';
      
      gsap.to(this.elements, {
        opacity: 1, y: 0, scale: 1,
        duration: this.config.duration,
        stagger: {
          amount: this.config.duration,
          from: staggerFrom,
          ease: 'power2.out',
        },
        ease: this.config.ease,
        onComplete: resolve
      });
    });
  }

  async typeWriter(speed = 50): Promise<void> {
    return new Promise(resolve => {
      const delays: gsap.core.Tween[] = [];
      
      this.elements.forEach((element, index) => {
        const delay = gsap.delayedCall(index * (speed / 1000), () => {
          gsap.to(element, {
            opacity: 1, y: 0, duration: 0.1, ease: 'none',
            onComplete: index === this.elements.length - 1 ? resolve : undefined
          });
        });
        delays.push(delay);
      });

      // Store for cleanup
      (this as any)._typewriterDelays = delays;
    });
  }

  async glitchReveal(): Promise<void> {
    return new Promise(resolve => {
      this.elements.forEach((element, index) => {
        gsap.to(element, {
          opacity: 1, y: 0, duration: 0.1,
          delay: index * 0.02, ease: 'none',
          repeat: 2, yoyo: true,
          onComplete: index === this.elements.length - 1 ? resolve : undefined
        });
      });
    });
  }

  // Control methods
  play(): void { this.timeline?.play(); }
  pause(): void { this.timeline?.pause(); }
  restart(): void { this.timeline?.restart(); }
  reverse(): void { this.timeline?.reverse(); }
  seek(progress: number): void { this.timeline?.progress(Math.max(0, Math.min(1, progress))); }
  
  getProgress(): number { return this.timeline?.progress() || 0; }
  isComplete(): boolean { return this.getProgress() === 1; }

  destroy(): void {
    this.timeline?.kill();
    this.timeline = null;
    
    // Cleanup typewriter delays
    const delays = (this as any)._typewriterDelays as gsap.core.Tween[];
    if (delays) {
      delays.forEach(delay => delay.kill());
      delete (this as any)._typewriterDelays;
    }
    
    this.elements = [];
  }
}

// Main TextReveal class - orchestrates everything
export class TextReveal {
  private element: HTMLElement;
  private config: TextRevealConfig;
  private originalHTML: string;
  private splitResult: SplitTextResult | null = null;
  private animationController: AnimationController | null = null;
  private isDestroyed = false;
  private mediaQuery: MediaQueryList;

  constructor(element: HTMLElement, config: TextRevealConfig = {}) {
    if (!element || !(element instanceof HTMLElement)) {
      throw new Error('TextReveal requires a valid HTMLElement');
    }

    const text = element.textContent?.trim();
    if (!text) {
      throw new Error('TextReveal requires element with text content');
    }

    this.element = element;
    this.config = config;
    this.originalHTML = element.innerHTML;
    this.mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    this.initialize();
    this.setupAccessibility();
  }

  private initialize(): void {
    try {
      const text = this.element.textContent || '';
      const parts = TextProcessor.splitText(text, this.config.type, this.element);
      
      this.splitResult = DOMElementFactory.createSplitElements(
        parts, 
        this.config.type
      );

      // Single DOM write
      this.element.innerHTML = '';
      this.element.appendChild(this.splitResult.fragment);

      this.animationController = new AnimationController(
        this.splitResult.elements, 
        this.config
      );

      this.animationController.createMainAnimation();
    } catch (error) {
      this.cleanup();
      throw new Error(`TextReveal initialization failed: ${error}`);
    }
  }

  private setupAccessibility(): void {
    this.handleReducedMotion();
    this.mediaQuery.addEventListener('change', this.handleReducedMotion);
  }

  private handleReducedMotion = (): void => {
    if (this.mediaQuery.matches && this.animationController) {
      // Make animation nearly instant for reduced motion
      const timeline = (this.animationController as any).timeline;
      if (timeline) timeline.duration(0.01);
    }
  };

  // Public API - delegate to animation controller
  play(): this { this.animationController?.play(); return this; }
  pause(): this { this.animationController?.pause(); return this; }
  restart(): this { this.animationController?.restart(); return this; }
  reverse(): this { this.animationController?.reverse(); return this; }
  seek(progress: number): this { this.animationController?.seek(progress); return this; }

  // Advanced reveal methods
  async revealByIndex(index: number, duration?: number): Promise<void> {
    if (this.isDestroyed) return;
    return this.animationController?.revealByIndex(index, duration);
  }

  async hideByIndex(index: number, duration?: number): Promise<void> {
    if (this.isDestroyed) return;
    return this.animationController?.hideByIndex(index, duration);
  }

  async revealAll(duration?: number): Promise<void> {
    if (this.isDestroyed) return;
    return this.animationController?.revealAll(duration);
  }

  async hideAll(duration?: number): Promise<void> {
    if (this.isDestroyed) return;
    return this.animationController?.hideAll(duration);
  }

  async revealWave(direction?: 'left' | 'right' | 'center'): Promise<void> {
    if (this.isDestroyed) return;
    return this.animationController?.revealWave(direction);
  }

  async typeWriter(speed?: number): Promise<void> {
    if (this.isDestroyed) return;
    return this.animationController?.typeWriter(speed);
  }

  async glitchReveal(): Promise<void> {
    if (this.isDestroyed) return;
    return this.animationController?.glitchReveal();
  }

  // Utility methods
  isComplete(): boolean {
    return !this.isDestroyed && (this.animationController?.isComplete() || false);
  }

  getProgress(): number {
    return this.isDestroyed ? 0 : (this.animationController?.getProgress() || 0);
  }

  getSplitElements(): HTMLElement[] {
    return this.isDestroyed ? [] : (this.splitResult?.elements || []);
  }

  getElementCount(): number {
    return this.getSplitElements().length;
  }

  refresh(): void {
    if (this.isDestroyed) return;
    
    const progress = this.getProgress();
    this.cleanup();
    this.initialize();
    this.seek(progress);
  }

  private cleanup(): void {
    this.splitResult?.cleanup();
    this.animationController?.destroy();
    this.element.innerHTML = this.originalHTML;
    this.splitResult = null;
    this.animationController = null;
  }

  destroy(): void {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    this.mediaQuery.removeEventListener('change', this.handleReducedMotion);
    this.cleanup();
    TextProcessor.cleanup();
  }
}

// Factory functions
export function createTextReveal(
  selector: string | HTMLElement,
  config?: TextRevealConfig
): TextReveal {
  const element = typeof selector === 'string' 
    ? document.querySelector(selector) as HTMLElement
    : selector;
    
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }
  
  return new TextReveal(element, config);
}

export function createTextRevealBatch(
  selectors: (string | HTMLElement)[],
  config?: TextRevealConfig
): TextReveal[] {
  const results: TextReveal[] = [];
  const errors: string[] = [];
  
  selectors.forEach((selector, index) => {
    try {
      const reveal = createTextReveal(selector, {
        ...config,
        delay: (config?.delay || 0) + index * 0.1,
      });
      results.push(reveal);
    } catch (error) {
      errors.push(`Element ${index}: ${error}`);
    }
  });
  
  if (errors.length > 0 && results.length === 0) {
    throw new Error(`All TextReveal creations failed: ${errors.join(', ')}`);
  }
  
  return results;
}

// Comprehensive presets
export const TextRevealPresets = {
  fadeInUp: { type: 'words' as const, duration: 1, ease: 'power2.out' },
  typewriter: { type: 'chars' as const, duration: 0.1, ease: 'none' },
  wave: { type: 'chars' as const, duration: 1.5, ease: 'back.out(1.7)' },
  glitch: { type: 'chars' as const, duration: 0.1, ease: 'none' },
  lines: { type: 'lines' as const, duration: 1.2, ease: 'power3.out' },
  sentences: { type: 'sentences' as const, duration: 0.8, ease: 'power2.out' },
  instant: { type: 'words' as const, duration: 0.01, ease: 'none' },
} as const;