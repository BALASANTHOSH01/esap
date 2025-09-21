import { gsap } from 'gsap';

export class AnimationHelpers {
  // Easing utilities
  static readonly EASINGS = {
    // Power
    easeOut: 'power2.out',
    easeIn: 'power2.in',
    easeInOut: 'power2.inOut',
    
    // Bounce
    bounceOut: 'bounce.out',
    bounceIn: 'bounce.in',
    bounceInOut: 'bounce.inOut',
    
    // Elastic
    elasticOut: 'elastic.out(1, 0.3)',
    elasticIn: 'elastic.in(1, 0.3)',
    elasticInOut: 'elastic.inOut(1, 0.3)',
    
    // Back
    backOut: 'back.out(1.7)',
    backIn: 'back.in(1.7)',
    backInOut: 'back.inOut(1.7)',
    
    // Circ
    circOut: 'circ.out',
    circIn: 'circ.in',
    circInOut: 'circ.inOut',
    
    // Expo
    expoOut: 'expo.out',
    expoIn: 'expo.in',
    expoInOut: 'expo.inOut'
  };

  // Duration presets
  static readonly DURATIONS = {
    instant: 0.1,
    fast: 0.3,
    normal: 0.6,
    slow: 1.2,
    verySlow: 2.0
  };

  // Animation state management
  static getAnimationState(element: HTMLElement): any {
    return {
      x: gsap.getProperty(element, 'x'),
      y: gsap.getProperty(element, 'y'),
      rotation: gsap.getProperty(element, 'rotation'),
      scaleX: gsap.getProperty(element, 'scaleX'),
      scaleY: gsap.getProperty(element, 'scaleY'),
      opacity: gsap.getProperty(element, 'opacity')
    };
  }

  static saveState(element: HTMLElement, key: string): void {
    const state = this.getAnimationState(element);
    element.dataset[`esapState${key}`] = JSON.stringify(state);
  }

  static restoreState(element: HTMLElement, key: string): void {
    const stateData = element.dataset[`esapState${key}`];
    if (stateData) {
      const state = JSON.parse(stateData);
      gsap.set(element, state);
    }
  }

  // Performance utilities
  static debounce(func: Function, wait: number): Function {
    let timeout: ReturnType<typeof setTimeout>;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static throttle(func: Function, limit: number): Function {
    let inThrottle: boolean;
    return function executedFunction(this: any, ...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Element utilities
  static isInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  static getElementCenter(element: HTMLElement): { x: number; y: number } {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  static getDistanceBetweenElements(el1: HTMLElement, el2: HTMLElement): number {
    const center1 = this.getElementCenter(el1);
    const center2 = this.getElementCenter(el2);
    
    return Math.sqrt(
      Math.pow(center2.x - center1.x, 2) + 
      Math.pow(center2.y - center1.y, 2)
    );
  }

  // Responsive utilities
  static getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  static respectsReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  static getOptimalDuration(baseDuration: number): number {
    const deviceType = this.getDeviceType();
    const reducedMotion = this.respectsReducedMotion();
    
    if (reducedMotion) return 0.1;
    
    switch (deviceType) {
      case 'mobile':
        return baseDuration * 0.7; // Faster on mobile
      case 'tablet':
        return baseDuration * 0.85;
      default:
        return baseDuration;
    }
  }

  // Color utilities
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  static rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  static interpolateColor(color1: string, color2: string, factor: number): string {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);
    
    if (!c1 || !c2) return color1;
    
    const r = Math.round(c1.r + (c2.r - c1.r) * factor);
    const g = Math.round(c1.g + (c2.g - c1.g) * factor);
    const b = Math.round(c1.b + (c2.b - c1.b) * factor);
    
    return this.rgbToHex(r, g, b);
  }
}