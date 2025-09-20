import { AnimationEngine, type AnimationRegistryEntry } from "../core/AnimationEngine";
import type { AnimationOptions } from "../types/core";

// Utility functions for common operations
export const AnimationUtils = {
  // Create optimized timeline for mobile devices
  createMobileOptimizedTimeline: (options: AnimationOptions = {}) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    return AnimationEngine.createTimeline({
      ...options,
      duration: isMobile ? (options.duration || 1) * 0.7 : options.duration,
      ease: isMobile ? 'power2.out' : options.ease
    });
  },

  // Batch kill animations by selector
  killBySelector: (selector: string) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      const animations = AnimationEngine.getAnimationsByElement(element as HTMLElement);
      animations.forEach(animation => {
        AnimationEngine.unregisterAnimation(animation.id);
      });
    });
  },

  // Get animation count by type
  getCountByType: (type: AnimationRegistryEntry['type']) => {
    return AnimationEngine.getAnimationsByType(type).length;
  },

  // Check if element has active animations
  hasActiveAnimations: (element: HTMLElement) => {
    const animations = AnimationEngine.getAnimationsByElement(element);
    return animations.some(anim => {
      try {
        return anim.instance.timeline ? anim.instance.timeline.isActive() : false;
      } catch {
        return false;
      }
    });
  }
};