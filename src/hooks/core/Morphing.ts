import { gsap } from 'gsap';
import { BaseAnimation } from '../../core/BaseAnimation';
import type { MorphingOptions } from '../../types/core';

// Advanced mathematical utilities for morphing
class MorphMath {
  // Bezier curve interpolation
  static bezierInterpolate(t: number, points: number[][]): number[] {
    if (points.length === 1) return points[0];
    
    const newPoints: number[][] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      newPoints.push(p1.map((val, idx) => val * (1 - t) + p2[idx] * t));
    }
    
    return this.bezierInterpolate(t, newPoints);
  }

  // Smooth step interpolation
  static smoothStep(edge0: number, edge1: number, x: number): number {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  // Elastic interpolation
  static elasticOut(t: number): number {
    const p = 0.3;
    return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
  }

  // Back interpolation
  static backOut(t: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }
}

// Advanced SVG path parser and manipulator
class AdvancedSVGParser {
  private static readonly COMMAND_REGEX = /[MmLlHhVvCcSsQqTtAaZz]/g;
  private static readonly NUMBER_REGEX = /-?\d*\.?\d+(?:[eE][-+]?\d+)?/g;

  static parsePath(pathString: string): PathCommand[] {
    const commands: PathCommand[] = [];
    const commandMatches = pathString.match(this.COMMAND_REGEX) || [];
    const numbers = pathString.match(this.NUMBER_REGEX)?.map(Number) || [];
    
    let numberIndex = 0;
    
    commandMatches.forEach(command => {
      const cmd: PathCommand = { type: command, params: [] };
      
      const paramCount = this.getParamCount(command);
      for (let i = 0; i < paramCount && numberIndex < numbers.length; i++) {
        cmd.params.push(numbers[numberIndex++]);
      }
      
      commands.push(cmd);
    });
    
    return commands;
  }

  static pathToPoints(pathString: string, resolution: number = 100): Point[] {
    const commands = this.parsePath(pathString);
    const points: Point[] = [];
    let currentPos: Point = { x: 0, y: 0 };
    let startPos: Point = { x: 0, y: 0 };
    
    commands.forEach(cmd => {
      switch (cmd.type.toLowerCase()) {
        case 'm':
          currentPos = this.isAbsolute(cmd.type) 
            ? { x: cmd.params[0], y: cmd.params[1] }
            : { x: currentPos.x + cmd.params[0], y: currentPos.y + cmd.params[1] };
          startPos = { ...currentPos };
          points.push({ ...currentPos });
          break;
          
        case 'l':
          const endPos = this.isAbsolute(cmd.type)
            ? { x: cmd.params[0], y: cmd.params[1] }
            : { x: currentPos.x + cmd.params[0], y: currentPos.y + cmd.params[1] };
          
          for (let t = 0; t <= 1; t += 1 / resolution) {
            points.push({
              x: currentPos.x + (endPos.x - currentPos.x) * t,
              y: currentPos.y + (endPos.y - currentPos.y) * t
            });
          }
          currentPos = endPos;
          break;
          
        case 'c':
          // Cubic bezier curve
          const cp1 = this.isAbsolute(cmd.type)
            ? { x: cmd.params[0], y: cmd.params[1] }
            : { x: currentPos.x + cmd.params[0], y: currentPos.y + cmd.params[1] };
          const cp2 = this.isAbsolute(cmd.type)
            ? { x: cmd.params[2], y: cmd.params[3] }
            : { x: currentPos.x + cmd.params[2], y: currentPos.y + cmd.params[3] };
          const end = this.isAbsolute(cmd.type)
            ? { x: cmd.params[4], y: cmd.params[5] }
            : { x: currentPos.x + cmd.params[4], y: currentPos.y + cmd.params[5] };
            
          for (let t = 0; t <= 1; t += 1 / resolution) {
            const point = this.bezierPoint(t, currentPos, cp1, cp2, end);
            points.push(point);
          }
          currentPos = end;
          break;
          
        case 'z':
          currentPos = { ...startPos };
          break;
      }
    });
    
    return points;
  }

  static pointsToPath(points: Point[]): string {
    if (points.length === 0) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    return path;
  }

  static normalizePaths(pathA: string, pathB: string, targetPoints: number = 100): { pathA: string; pathB: string } {
    const pointsA = this.pathToPoints(pathA, targetPoints);
    const pointsB = this.pathToPoints(pathB, targetPoints);
    
    // Ensure equal number of points
    const maxPoints = Math.max(pointsA.length, pointsB.length);
    
    const normalizedA = this.resamplePoints(pointsA, maxPoints);
    const normalizedB = this.resamplePoints(pointsB, maxPoints);
    
    return {
      pathA: this.pointsToPath(normalizedA),
      pathB: this.pointsToPath(normalizedB)
    };
  }

  private static resamplePoints(points: Point[], targetCount: number): Point[] {
    if (points.length === 0) return [];
    if (points.length >= targetCount) return points.slice(0, targetCount);
    
    const resampled: Point[] = [];
    const ratio = (points.length - 1) / (targetCount - 1);
    
    for (let i = 0; i < targetCount; i++) {
      const index = i * ratio;
      const lowerIndex = Math.floor(index);
      const upperIndex = Math.ceil(index);
      const t = index - lowerIndex;
      
      if (lowerIndex === upperIndex) {
        resampled.push({ ...points[lowerIndex] });
      } else {
        const lower = points[lowerIndex];
        const upper = points[upperIndex] || points[points.length - 1];
        resampled.push({
          x: lower.x + (upper.x - lower.x) * t,
          y: lower.y + (upper.y - lower.y) * t
        });
      }
    }
    
    return resampled;
  }

  private static getParamCount(command: string): number {
    const paramCounts: { [key: string]: number } = {
      'M': 2, 'm': 2, 'L': 2, 'l': 2, 'H': 1, 'h': 1, 'V': 1, 'v': 1,
      'C': 6, 'c': 6, 'S': 4, 's': 4, 'Q': 4, 'q': 4, 'T': 2, 't': 2,
      'A': 7, 'a': 7, 'Z': 0, 'z': 0
    };
    return paramCounts[command] || 0;
  }

  private static isAbsolute(command: string): boolean {
    return command === command.toUpperCase();
  }

  private static bezierPoint(t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point {
    const mt = 1 - t;
    return {
      x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
      y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y
    };
  }
}

// Advanced color manipulation
class AdvancedColorMorpher {
  static parseColor(color: string): RGBA {
    // Handle various color formats
    if (color.startsWith('#')) {
      return this.hexToRgba(color);
    } else if (color.startsWith('rgb')) {
      return this.parseRgb(color);
    } else if (color.startsWith('hsl')) {
      return this.hslToRgba(this.parseHsl(color));
    } else {
      // Named colors
      const namedColor = this.namedColors[color.toLowerCase()];
      return namedColor ? this.hexToRgba(namedColor) : { r: 0, g: 0, b: 0, a: 1 };
    }
  }

  static interpolateColors(colorA: RGBA, colorB: RGBA, progress: number, mode: 'rgb' | 'hsl' | 'lab' = 'rgb'): RGBA {
    switch (mode) {
      case 'hsl':
        return this.interpolateHSL(colorA, colorB, progress);
      case 'lab':
        return this.interpolateLAB(colorA, colorB, progress);
      default:
        return this.interpolateRGB(colorA, colorB, progress);
    }
  }

  private static interpolateRGB(colorA: RGBA, colorB: RGBA, progress: number): RGBA {
    return {
      r: Math.round(colorA.r + (colorB.r - colorA.r) * progress),
      g: Math.round(colorA.g + (colorB.g - colorA.g) * progress),
      b: Math.round(colorA.b + (colorB.b - colorA.b) * progress),
      a: colorA.a + (colorB.a - colorA.a) * progress
    };
  }

  private static interpolateHSL(colorA: RGBA, colorB: RGBA, progress: number): RGBA {
    const hslA = this.rgbaToHsl(colorA);
    const hslB = this.rgbaToHsl(colorB);
    
    // Handle hue interpolation (shortest path)
    let hueDiff = hslB.h - hslA.h;
    if (hueDiff > 180) hueDiff -= 360;
    if (hueDiff < -180) hueDiff += 360;
    
    const interpolatedHSL = {
      h: (hslA.h + hueDiff * progress + 360) % 360,
      s: hslA.s + (hslB.s - hslA.s) * progress,
      l: hslA.l + (hslB.l - hslA.l) * progress,
      a: colorA.a + (colorB.a - colorA.a) * progress
    };
    
    return this.hslToRgba(interpolatedHSL);
  }

  private static interpolateLAB(colorA: RGBA, colorB: RGBA, progress: number): RGBA {
    const labA = this.rgbaToLab(colorA);
    const labB = this.rgbaToLab(colorB);
    
    const interpolatedLAB = {
      l: labA.l + (labB.l - labA.l) * progress,
      a: labA.a + (labB.a - labA.a) * progress,
      b: labA.b + (labB.b - labA.b) * progress,
      alpha: colorA.a + (colorB.a - colorA.a) * progress
    };
    
    return this.labToRgba(interpolatedLAB);
  }

  // Color conversion utilities
  private static hexToRgba(hex: string): RGBA {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: result[4] ? parseInt(result[4], 16) / 255 : 1
    } : { r: 0, g: 0, b: 0, a: 1 };
  }

  private static parseRgb(rgb: string): RGBA {
    const match = rgb.match(/rgba?\(([^)]+)\)/);
    if (!match) return { r: 0, g: 0, b: 0, a: 1 };
    
    const values = match[1].split(',').map(v => parseFloat(v.trim()));
    return {
      r: values[0] || 0,
      g: values[1] || 0,
      b: values[2] || 0,
      a: values.length > 3 ? values[3] : 1
    };
  }

  private static parseHsl(hsl: string): HSLA {
    const match = hsl.match(/hsla?\(([^)]+)\)/);
    if (!match) return { h: 0, s: 0, l: 0, a: 1 };
    
    const values = match[1].split(',').map(v => parseFloat(v.trim()));
    return {
      h: values[0] || 0,
      s: values[1] || 0,
      l: values[2] || 0,
      a: values.length > 3 ? values[3] : 1
    };
  }

  private static rgbaToHsl(rgba: RGBA): HSLA {
    const r = rgba.r / 255;
    const g = rgba.g / 255;
    const b = rgba.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    const sum = max + min;
    const l = sum / 2;
    
    let h = 0;
    let s = 0;
    
    if (diff !== 0) {
      s = l > 0.5 ? diff / (2 - sum) : diff / sum;
      
      switch (max) {
        case r: h = ((g - b) / diff) + (g < b ? 6 : 0); break;
        case g: h = (b - r) / diff + 2; break;
        case b: h = (r - g) / diff + 4; break;
      }
      h /= 6;
    }
    
    return { h: h * 360, s: s * 100, l: l * 100, a: rgba.a };
  }

  private static hslToRgba(hsl: HSLA): RGBA {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;
    
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
      a: hsl.a
    };
  }

  private static rgbaToLab(rgba: RGBA): LAB {
    // Convert RGB to XYZ then to LAB (simplified)
    let r = rgba.r / 255;
    let g = rgba.g / 255;
    let b = rgba.b / 255;
    
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    
    let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
    let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
    
    x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
    y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
    z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
    
    return {
      l: (116 * y) - 16,
      a: 500 * (x - y),
      b: 200 * (y - z),
      alpha: rgba.a
    };
  }

  private static labToRgba(lab: LAB): RGBA {
    // Convert LAB to XYZ then to RGB (simplified)
    let y = (lab.l + 16) / 116;
    let x = lab.a / 500 + y;
    let z = y - lab.b / 200;
    
    const y3 = Math.pow(y, 3);
    const x3 = Math.pow(x, 3);
    const z3 = Math.pow(z, 3);
    
    y = y3 > 0.008856 ? y3 : (y - 16/116) / 7.787;
    x = x3 > 0.008856 ? x3 : (x - 16/116) / 7.787;
    z = z3 > 0.008856 ? z3 : (z - 16/116) / 7.787;
    
    x *= 0.95047;
    y *= 1.00000;
    z *= 1.08883;
    
    let r = x *  3.2406 + y * -1.5372 + z * -0.4986;
    let g = x * -0.9689 + y *  1.8758 + z *  0.0415;
    let b = x *  0.0557 + y * -0.2040 + z *  1.0570;
    
    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1/2.4) - 0.055 : 12.92 * r;
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1/2.4) - 0.055 : 12.92 * g;
    b = b > 0.0031308 ? 1.055 * Math.pow(b, 1/2.4) - 0.055 : 12.92 * b;
    
    return {
      r: Math.max(0, Math.min(255, Math.round(r * 255))),
      g: Math.max(0, Math.min(255, Math.round(g * 255))),
      b: Math.max(0, Math.min(255, Math.round(b * 255))),
      a: lab.alpha
    };
  }

  private static namedColors: { [key: string]: string } = {
    red: '#ff0000', green: '#008000', blue: '#0000ff', white: '#ffffff',
    black: '#000000', yellow: '#ffff00', cyan: '#00ffff', magenta: '#ff00ff',
    // Add more named colors as needed
  };
}

// Type definitions
interface Point {
  x: number;
  y: number;
}

interface PathCommand {
  type: string;
  params: number[];
}

interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface HSLA {
  h: number;
  s: number;
  l: number;
  a: number;
}

interface LAB {
  l: number;
  a: number;
  b: number;
  alpha: number;
}

// Main morphing class - Superior to GSAP Premium
export class AdvancedMorphing extends BaseAnimation {
  private morphOptions: MorphingOptions & {
    morphType: 'transform' | 'path' | 'color' | 'shape' | 'liquid' | 'elastic';
    duration: number;
    delay: number;
    ease: string;
    repeat: number;
    yoyo: boolean;
    colorInterpolation: 'rgb' | 'hsl' | 'lab';
    pathResolution: number;
    smoothing: number;
  };
  private targets: MorphTarget[] = [];
  private originalState: ElementState;
  private currentTarget: MorphTarget | null = null;
  private morphingAnimations: gsap.core.Tween[] = [];

  constructor(element: HTMLElement, options: MorphingOptions = {}) {
    super(element, options);
    
    this.morphOptions = {
      morphType: options.morphType ?? 'transform',
      duration: Math.max(0.1, options.duration ?? 1),
      delay: Math.max(0, options.delay ?? 0),
      ease: options.ease ?? 'power2.out',
      repeat: Math.max(-1, options.repeat ?? 0),
      yoyo: options.yoyo ?? false,
      // Optional callbacks - keep them optional
      onComplete: () => {
        if (options.onComplete) options.onComplete();
        resolve();
      },
      onStart: options.onStart options.onComplete,
      onStart: options.onStart,
      onUpdate: options.onUpdate,
      colorInterpolation: (options as any).colorInterpolation ?? 'rgb',
      pathResolution: Math.max(50, (options as any).pathResolution ?? 200),
      smoothing: Math.max(0, Math.min(1, (options as any).smoothing ?? 0.5))
    };
    
    this.originalState = this.captureElementState();
  }

  protected createAnimation(): void {
    // Initialize with paused timeline
    this.timeline.pause();
  }

  private captureElementState(): ElementState {
    const computedStyle = getComputedStyle(this.element);
    const state: ElementState = {
      transform: this.element.style.transform || 'none',
      backgroundColor: computedStyle.backgroundColor,
      color: computedStyle.color,
      borderColor: computedStyle.borderColor,
      width: computedStyle.width,
      height: computedStyle.height,
      opacity: parseFloat(computedStyle.opacity),
      borderRadius: computedStyle.borderRadius
    };
    
    // Capture SVG-specific properties
    if (this.element.tagName.toLowerCase() === 'path') {
      state.pathData = (this.element as unknown as SVGPathElement).getAttribute('d') || '';
    }
    
    if (this.element.tagName.toLowerCase() === 'circle') {
      const circle = this.element as unknown as SVGCircleElement;
      state.svgProps = {
        r: parseFloat(circle.getAttribute('r') || '0'),
        cx: parseFloat(circle.getAttribute('cx') || '0'),
        cy: parseFloat(circle.getAttribute('cy') || '0')
      };
    }
    
    if (this.element.tagName.toLowerCase() === 'rect') {
      const rect = this.element as unknown as SVGRectElement;
      state.svgProps = {
        width: parseFloat(rect.getAttribute('width') || '0'),
        height: parseFloat(rect.getAttribute('height') || '0'),
        x: parseFloat(rect.getAttribute('x') || '0'),
        y: parseFloat(rect.getAttribute('y') || '0')
      };
    }
    
    return state;
  }

  // Advanced morphing methods
  async morph(target: MorphTarget, options: Partial<MorphingOptions> = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const morphOptions = { ...this.morphOptions, ...options };
        this.currentTarget = target;
        
        // Clear any existing animations
        this.clearMorphingAnimations();
        
        // Choose morphing strategy based on type and target
        switch (morphOptions.morphType) {
          case 'path':
            this.morphPath(target, morphOptions, resolve);
            break;
          case 'color':
            this.morphColor(target, morphOptions, resolve);
            break;
          case 'shape':
            this.morphShape(target, morphOptions, resolve);
            break;
          case 'liquid':
            this.liquidMorph(target, morphOptions, resolve);
            break;
          case 'elastic':
            this.elasticMorph(target, morphOptions, resolve);
            break;
          case 'transform':
          default:
            this.morphTransform(target, morphOptions, resolve);
            break;
        }
      } catch (error) {
        console.error('Morphing failed:', error);
        reject(error);
      }
    });
  }

  private morphPath(target: MorphTarget, options: typeof this.morphOptions, resolve: () => void): void {
    if (this.element.tagName.toLowerCase() !== 'path') {
      console.warn('Path morphing requires SVG path element');
      resolve();
      return;
    }

    const pathElement = this.element as unknown as SVGPathElement;
    const startPath = pathElement.getAttribute('d') || '';
    const targetPath = typeof target === 'string' ? target : target.pathData || '';
    
    if (!targetPath) {
      console.warn('No target path provided for morphing');
      resolve();
      return;
    }

    try {
      // Normalize paths for smooth morphing
      const { pathA, pathB } = AdvancedSVGParser.normalizePaths(
        startPath, 
        targetPath, 
        options.pathResolution
      );
      
      const startPoints = AdvancedSVGParser.pathToPoints(pathA, options.pathResolution);
      const endPoints = AdvancedSVGParser.pathToPoints(pathB, options.pathResolution);
      
      // Create custom morphing animation
      const animation = gsap.to({}, {
        duration: options.duration,
        ease: options.ease,
        onUpdate: function() {
          const progress = this.progress();
          const morphedPoints: Point[] = [];
          
          for (let i = 0; i < Math.min(startPoints.length, endPoints.length); i++) {
            const start = startPoints[i];
            const end = endPoints[i];
            
            // Apply smoothing
            const smoothProgress = options.smoothing > 0 
              ? MorphMath.smoothStep(0, 1, progress)
              : progress;
            
            morphedPoints.push({
              x: start.x + (end.x - start.x) * smoothProgress,
              y: start.y + (end.y - start.y) * smoothProgress
            });
          }
          
          const morphedPath = AdvancedSVGParser.pointsToPath(morphedPoints);
          pathElement.setAttribute('d', morphedPath);
          
          if (options.onUpdate) {
            options.onUpdate(progress);
          }
        },
        onComplete: () => {
          if (options.onComplete) options.onComplete();
          resolve();
        },
        onStart: options.onStart
      });
      
      this.morphingAnimations.push(animation);
      
    } catch (error) {
      console.error('Path morphing error:', error);
      resolve();
    }
  }

  private morphColor(target: MorphTarget, options: typeof this.morphOptions, resolve: () => void): void {
    const startColors = this.extractColors();
    const targetColors = this.parseTargetColors(target);
    
    const animation = gsap.to({}, {
      duration: options.duration,
      ease: options.ease,
      onUpdate: function() {
        const progress = this.progress();
        
        Object.keys(targetColors).forEach(property => {
          if (startColors[property] && targetColors[property]) {
            const startColor = AdvancedColorMorpher.parseColor(startColors[property]);
            const targetColor = AdvancedColorMorpher.parseColor(targetColors[property]);
            
            const morphedColor = AdvancedColorMorpher.interpolateColors(
              startColor,
              targetColor,
              progress,
              options.colorInterpolation as 'rgb' | 'hsl' | 'lab'
            );
            
            const colorString = `rgba(${morphedColor.r}, ${morphedColor.g}, ${morphedColor.b}, ${morphedColor.a})`;
            (this.element.style as any)[property] = colorString;
          }
        });
        
        if (options.onUpdate) options.onUpdate(progress);
      }.bind(this),
      onComplete: () => {
        if (options.onComplete) options.onComplete();
        resolve();
      },
      onStart: options.onStart
    });
    
    this.morphingAnimations.push(animation);
  }

  private morphShape(target: MorphTarget, options: typeof this.morphOptions, resolve: () => void): void {
    const elementType = this.element.tagName.toLowerCase();
    
    switch (elementType) {
      case 'circle':
        this.morphCircle(target, options, resolve);
        break;
      case 'rect':
        this.morphRect(target, options, resolve);
        break;
      case 'ellipse':
        this.morphEllipse(target, options, resolve);
        break;
      default:
        // Fallback to transform morphing
        this.morphTransform(target, options, resolve);
        break;
    }
  }

  private morphCircle(target: MorphTarget, options: typeof this.morphOptions, resolve: () => void): void {
    const circle = this.element as unknown as SVGCircleElement;
    const startState = {
      r: parseFloat(circle.getAttribute('r') || '0'),
      cx: parseFloat(circle.getAttribute('cx') || '0'),
      cy: parseFloat(circle.getAttribute('cy') || '0')
    };
    
    const targetState = typeof target === 'object' && target.svgProps ? target.svgProps : startState;
    
    const animation = gsap.to(startState, {
      r: targetState.r || startState.r,
      cx: targetState.cx || startState.cx,
      cy: targetState.cy || startState.cy,
      duration: options.duration,
      ease: options.ease,
      onUpdate: () => {
        circle.setAttribute('r', startState.r.toString());
        circle.setAttribute('cx', startState.cx.toString());
        circle.setAttribute('cy', startState.cy.toString());
        
        if (options.onUpdate) options.onUpdate(this.timeline.progress());
      },
      onComplete: () => {
        if (options.onComplete) options.onComplete();
        resolve();
      },
      onStart: options.onStart
    });
    
    this.morphingAnimations.push(animation);
  }

  private morphRect(target: MorphTarget, options: typeof this.morphOptions, resolve: () => void): void {
    const rect = this.element as unknown as SVGRectElement;
    const startState = {
      width: parseFloat(rect.getAttribute('width') || '0'),
      height: parseFloat(rect.getAttribute('height') || '0'),
      x: parseFloat(rect.getAttribute('x') || '0'),
      y: parseFloat(rect.getAttribute('y') || '0')
    };
    
    const targetState = typeof target === 'object' && target.svgProps ? target.svgProps : startState;
    
    const animation = gsap.to(startState, {
      width: targetState.width || startState.width,
      height: targetState.height || startState.height,
      x: targetState.x || startState.x,
      y: targetState.y || startState.y,
      duration: options.duration,
      ease: options.ease,
      onUpdate: () => {
        rect.setAttribute('width', startState.width.toString());
        rect.setAttribute('height', startState.height.toString());
        rect.setAttribute('x', startState.x.toString());
        rect.setAttribute('y', startState.y.toString());
        
        if (options.onUpdate) options.onUpdate(this.timeline.progress());
      },
      onComplete: () => {
        if (options.onComplete) options.onComplete();
        resolve();
      },
      onStart: options.onStart
    });
    
    this.morphingAnimations.push(animation);
  }

  private morphEllipse(target: MorphTarget, options: typeof this.morphOptions, resolve: () => void): void {
    const ellipse = this.element as unknown as SVGEllipseElement;
    const startState = {
      rx: parseFloat(ellipse.getAttribute('rx') || '0'),
      ry: parseFloat(ellipse.getAttribute('ry') || '0'),
      cx: parseFloat(ellipse.getAttribute('cx') || '0'),
      cy: parseFloat(ellipse.getAttribute('cy') || '0')
    };
    
    const targetState = typeof target === 'object' && target.svgProps ? target.svgProps : startState;
    
    const animation = gsap.to(startState, {
      rx: targetState.rx || startState.rx,
      ry: targetState.ry || startState.ry,
      cx: targetState.cx || startState.cx,
      cy: targetState.cy || startState.cy,
      duration: options.duration,
      ease: options.ease,
      onUpdate: () => {
        ellipse.setAttribute('rx', startState.rx.toString());
        ellipse.setAttribute('ry', startState.ry.toString());
        ellipse.setAttribute('cx', startState.cx.toString());
        ellipse.setAttribute('cy', startState.cy.toString());
        
        if (options.onUpdate) options.onUpdate(this.timeline.progress());
      },
      onComplete: () => {
        if (options.onComplete) options.onComplete();
        resolve();
      },
      onStart: options.onStart
    });
    
    this.morphingAnimations.push(animation);
  }

  // Revolutionary liquid morphing effect
  private liquidMorph(target: MorphTarget, options: typeof this.morphOptions, resolve: () => void): void {
    const targetProps = typeof target === 'object' ? target : {};
    
    // Create multiple overlapping animations with different timings
    const liquidPhases = [
      { delay: 0, duration: options.duration * 0.3, ease: 'power1.out' },
      { delay: options.duration * 0.2, duration: options.duration * 0.5, ease: 'elastic.out(1, 0.3)' },
      { delay: options.duration * 0.6, duration: options.duration * 0.4, ease: 'back.out(1.7)' }
    ];
    
    let completedPhases = 0;
    
    liquidPhases.forEach((phase, index) => {
      const phaseTarget = this.createPhaseTarget(targetProps, index);
      
      const animation = gsap.to(this.element, {
        ...phaseTarget,
        duration: phase.duration,
        delay: phase.delay,
        ease: phase.ease,
        onUpdate: () => {
          if (options.onUpdate && index === 1) { // Use middle phase for progress
            options.onUpdate(this.timeline.progress());
          }
        },
        onComplete: () => {
          completedPhases++;
          if (completedPhases === liquidPhases.length) {
            if (options.onComplete) options.onComplete();
            resolve();
          }
        },
        onStart: index === 0 ? options.onStart : undefined
      });
      
      this.morphingAnimations.push(animation);
    });
  }

  // Advanced elastic morphing with physics simulation
  private elasticMorph(target: MorphTarget, options: typeof this.morphOptions, resolve: () => void): void {
    const targetProps = typeof target === 'object' ? target : {};
    
    // Physics parameters
    const mass = 1;
    const damping = 0.8;
    const stiffness = 0.3;
    
    const animation = gsap.to(this.element, {
      ...targetProps,
      duration: options.duration,
      ease: `elastic.out(${mass}, ${damping})`,
      onUpdate: function() {
        const progress = this.progress();
        
        // Add secondary oscillation
        const elasticProgress = progress + Math.sin(progress * Math.PI * 4) * 0.1 * (1 - progress);
        
        if (options.onUpdate) {
          options.onUpdate(elasticProgress);
        }
      },
      onComplete: () => {
        if (options.onComplete) options.onComplete();
        resolve();
      },
      onStart: options.onStart
    });
    
    this.morphingAnimations.push(animation);
  }

  private morphTransform(target: MorphTarget, options: Required<MorphingOptions>, resolve: () => void): void {
    const targetProps = typeof target === 'object' ? target : {};
    
    const animation = gsap.to(this.element, {
      ...targetProps,
      duration: options.duration,
      delay: options.delay,
      ease: options.ease,
      repeat: options.repeat,
      yoyo: options.yoyo,
      onUpdate: () => {
        if (options.onUpdate) {
          options.onUpdate(animation.progress());
        }
      },
      onComplete: () => {
        if (options.onComplete) options.onComplete();
        resolve();
      },
      onStart: options.onStart
    });
    
    this.morphingAnimations.push(animation);
  }

  // Utility methods
  private extractColors(): { [key: string]: string } {
    const computedStyle = getComputedStyle(this.element);
    return {
      backgroundColor: computedStyle.backgroundColor,
      color: computedStyle.color,
      borderColor: computedStyle.borderColor,
      fill: computedStyle.fill,
      stroke: computedStyle.stroke
    };
  }

  private parseTargetColors(target: MorphTarget): { [key: string]: string } {
    if (typeof target === 'object') {
      return {
        backgroundColor: target.backgroundColor || '',
        color: target.color || '',
        borderColor: target.borderColor || '',
        fill: target.fill || '',
        stroke: target.stroke || ''
      };
    }
    return {};
  }

  private createPhaseTarget(target: any, phaseIndex: number): any {
    const phaseTarget = { ...target };
    
    // Modify properties based on phase for liquid effect
    Object.keys(phaseTarget).forEach(key => {
      if (typeof phaseTarget[key] === 'number') {
        const variance = phaseIndex === 1 ? 1.1 : phaseIndex === 2 ? 0.95 : 1;
        phaseTarget[key] *= variance;
      }
    });
    
    return phaseTarget;
  }

  private clearMorphingAnimations(): void {
    this.morphingAnimations.forEach(animation => {
      if (animation && animation.kill) {
        animation.kill();
      }
    });
    this.morphingAnimations = [];
  }

  // Advanced public methods
  async morphSequence(targets: MorphTarget[], options: Partial<MorphingOptions> = {}): Promise<void> {
    for (const target of targets) {
      await this.morph(target, options);
    }
  }

  async morphLoop(targets: MorphTarget[], options: Partial<MorphingOptions> = {}): Promise<void> {
    const loopOptions = { ...options, repeat: -1 };
    
    while (true) {
      for (const target of targets) {
        await this.morph(target, { ...loopOptions, repeat: 0 });
      }
    }
  }

  morphToIndex(index: number, options: Partial<MorphingOptions> = {}): Promise<void> {
    if (index >= 0 && index < this.targets.length) {
      return this.morph(this.targets[index], options);
    }
    return Promise.resolve();
  }

  addTarget(target: MorphTarget): number {
    this.targets.push(target);
    return this.targets.length - 1;
  }

  removeTarget(index: number): boolean {
    if (index >= 0 && index < this.targets.length) {
      this.targets.splice(index, 1);
      return true;
    }
    return false;
  }

  clearTargets(): void {
    this.targets = [];
  }

  async resetToOriginal(options: Partial<MorphingOptions> = {}): Promise<void> {
    return this.morph(this.originalState, options);
  }

  // Advanced morphing presets
  async morphBounce(target: MorphTarget, intensity: number = 1.2): Promise<void> {
    const bounceTarget = this.createBounceTarget(target, intensity);
    await this.morph(bounceTarget, { 
      morphType: 'elastic',
      duration: 1.5,
      ease: `elastic.out(1, 0.3)`
    });
  }

  async morphWave(target: MorphTarget, frequency: number = 2): Promise<void> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const duration = 2000;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const wave = Math.sin(progress * Math.PI * frequency) * (1 - progress);
        
        // Apply wave distortion to target properties
        const waveTarget = this.createWaveTarget(target, wave);
        
        if (progress >= 1) {
          resolve();
        } else {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    });
  }

  async morphSpiral(target: MorphTarget, rotations: number = 2): Promise<void> {
    return new Promise((resolve) => {
      const targetProps = typeof target === 'object' ? target : {};
      const startRotation = this.getRotation();
      const endRotation = startRotation + (rotations * 360);
      
      const animation = gsap.to(this.element, {
        ...targetProps,
        rotation: endRotation,
        duration: this.morphOptions.duration,
        ease: 'power2.inOut',
        onComplete: resolve
      });
      
      this.morphingAnimations.push(animation);
    });
  }

  // Utility methods for advanced morphing
  private createBounceTarget(target: MorphTarget, intensity: number): MorphTarget {
    if (typeof target !== 'object') return target;
    
    const bounceTarget = { ...target };
    
    // Add bounce effect to numeric properties
    Object.keys(bounceTarget).forEach(key => {
      if (typeof bounceTarget[key] === 'number') {
        bounceTarget[key] *= intensity;
      }
    });
    
    return bounceTarget;
  }

  private createWaveTarget(target: MorphTarget, waveOffset: number): MorphTarget {
    if (typeof target !== 'object') return target;
    
    const waveTarget = { ...target };
    
    // Apply wave distortion
    if (waveTarget.x !== undefined) waveTarget.x += waveOffset * 20;
    if (waveTarget.y !== undefined) waveTarget.y += waveOffset * 10;
    if (waveTarget.scale !== undefined) waveTarget.scale += waveOffset * 0.1;
    
    return waveTarget;
  }

  private getRotation(): number {
    const transform = this.element.style.transform;
    const rotateMatch = transform.match(/rotate\(([^)]+)deg\)/);
    return rotateMatch ? parseFloat(rotateMatch[1]) : 0;
  }

  // Performance monitoring
  getPerformanceMetrics(): MorphingMetrics {
    return {
      activeAnimations: this.morphingAnimations.length,
      currentTarget: this.currentTarget,
      targetCount: this.targets.length,
      isAnimating: this.morphingAnimations.some(anim => anim && anim.isActive())
    };
  }

  // Enhanced destroy method
  destroy(): void {
    try {
      this.clearMorphingAnimations();
      super.destroy();
      
      // Clear references
      this.targets = [];
      this.currentTarget = null;
      this.originalState = {} as ElementState;
      
    } catch (error) {
      console.error('Error during AdvancedMorphing destroy:', error);
    }
  }
}

// Type definitions
interface MorphTarget {
  [key: string]: any;
  pathData?: string;
  backgroundColor?: string;
  color?: string;
  borderColor?: string;
  fill?: string;
  stroke?: string;
  svgProps?: {
    r?: number;
    cx?: number;
    cy?: number;
    rx?: number;
    ry?: number;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
  };
}

interface ElementState {
  transform: string;
  backgroundColor: string;
  color: string;
  borderColor: string;
  width: string;
  height: string;
  opacity: number;
  borderRadius: string;
  pathData?: string;
  svgProps?: { [key: string]: number };
}

interface MorphingMetrics {
  activeAnimations: number;
  currentTarget: MorphTarget | null;
  targetCount: number;
  isAnimating: boolean;
}

// Enhanced MorphingOptions interface (extends base)
declare module '../../types/core' {
  interface MorphingOptions {
    morphType?: 'transform' | 'path' | 'color' | 'shape' | 'liquid' | 'elastic';
    colorInterpolation?: 'rgb' | 'hsl' | 'lab';
    pathResolution?: number;
    smoothing?: number;
  }
}

// Factory function
export function createAdvancedMorphing(
  element: HTMLElement | string,
  options: MorphingOptions = {}
): AdvancedMorphing {
  try {
    const el = typeof element === 'string' ? 
      document.querySelector(element) as HTMLElement : 
      element;
      
    if (!el) {
      throw new Error(`Element not found: ${element}`);
    }
    
    return new AdvancedMorphing(el, options);
    
  } catch (error) {
    console.error('Failed to create AdvancedMorphing:', error);
    throw error;
  }
}

// Advanced morphing presets
export const MorphingPresets = {
  // Smooth color transitions
  colorFade: (duration = 1): MorphingOptions => ({
    morphType: 'color',
    duration,
    colorInterpolation: 'lab',
    ease: 'power2.out'
  }),
  
  // Liquid-like transformations
  liquidTransform: (duration = 2): MorphingOptions => ({
    morphType: 'liquid',
    duration,
    smoothing: 0.8,
    ease: 'elastic.out(1, 0.3)'
  }),
  
  // Elastic morphing
  elasticMorph: (duration = 1.5): MorphingOptions => ({
    morphType: 'elastic',
    duration,
    ease: 'elastic.out(1, 0.5)'
  }),
  
  // High-precision path morphing
  precisePath: (resolution = 300): MorphingOptions => ({
    morphType: 'path',
    pathResolution: resolution,
    smoothing: 0.9,
    duration: 2,
    ease: 'power2.inOut'
  }),
  
  // Shape transformations
  organicShape: (duration = 1.8): MorphingOptions => ({
    morphType: 'shape',
    duration,
    smoothing: 0.7,
    ease: 'back.out(1.7)'
  })
};

// Utility functions for creating complex morphing sequences
class MorphingSequencer {
  private morphing: AdvancedMorphing;
  private sequences: MorphingSequence[] = [];

  constructor(morphing: AdvancedMorphing) {
    this.morphing = morphing;
  }

  addSequence(name: string, targets: MorphTarget[], options: MorphingOptions = {}): this {
    this.sequences.push({ name, targets, options });
    return this;
  }

  async playSequence(name: string): Promise<void> {
    const sequence = this.sequences.find(seq => seq.name === name);
    if (sequence) {
      await this.morphing.morphSequence(sequence.targets, sequence.options);
    }
  }

  async playAllSequences(): Promise<void> {
    for (const sequence of this.sequences) {
      await this.morphing.morphSequence(sequence.targets, sequence.options);
    }
  }
}

interface MorphingSequence {
  name: string;
  targets: MorphTarget[];
  options: MorphingOptions;
}

// Export the enhanced morphing system
export { AdvancedMorphing as Morphing, MorphingSequencer };

function resolve() {
    throw new Error('Function not implemented.');
}
