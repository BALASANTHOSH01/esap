import { gsap } from "gsap";
import { BaseAnimation } from "../../core/BaseAnimation";
import type { TextRevealOptions } from "../../types/core";

// Advanced text splitting with better handling
class AdvancedTextSplitter {
  private static readonly SPACE_CHAR = "\u00A0"; // Non-breaking space
  private static readonly LINE_HEIGHT_MULTIPLIER = 1.2;

  static splitByChars(text: string, preserveSpaces: boolean = true): string[] {
    return text.split("").map((char) => {
      if (char === " ") {
        return preserveSpaces ? this.SPACE_CHAR : char;
      }
      return char === "\n" ? "<br>" : char;
    });
  }

  static splitByWords(text: string): string[] {
    return text
      .split(/(\s+)/)
      .filter((word) => word.length > 0)
      .map((word) => word.trim() || " ");
  }

  static splitByLines(element: HTMLElement): string[] {
    // More accurate line splitting based on actual rendered lines
    const text = element.textContent || "";
    const words = text.split(/\s+/).filter((word) => word.length > 0);

    // Create temporary spans to measure line breaks
    const tempContainer = document.createElement("div");
    tempContainer.style.cssText = `
      position: absolute;
      visibility: hidden;
      white-space: nowrap;
      font-family: ${getComputedStyle(element).fontFamily};
      font-size: ${getComputedStyle(element).fontSize};
      line-height: ${getComputedStyle(element).lineHeight};
    `;
    document.body.appendChild(tempContainer);

    const lines: string[] = [];
    let currentLine = "";
    const maxWidth = element.offsetWidth;

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      tempContainer.textContent = testLine;

      if (tempContainer.offsetWidth > maxWidth && currentLine) {
        lines.push(currentLine.trim());
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine.trim());
    }

    document.body.removeChild(tempContainer);
    return lines.filter((line) => line.length > 0);
  }

  static splitBySentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 0);
  }
}

export class TextReveal extends BaseAnimation {
  private textOptions: TextRevealOptions & {
    type: "chars" | "words" | "lines" | "sentences";
    preserveSpaces: boolean;
    duration: number;
    delay: number;
    ease: string;
    trigger:
      | "immediate"
      | "scroll"
      | "click"
      | "hover"
      | "proximity"
      | "deviceOrientation";
    threshold: number;
    once: boolean;
    repeat: number;
    yoyo: boolean;
  };
  private originalText: string;
  private originalHTML: string;
  private splitElements: HTMLElement[] = [];
  private containerElement: HTMLElement | null = null;
  private isRevealed = false;

  constructor(element: HTMLElement, options: TextRevealOptions = {}) {
    super(element, options);

    this.textOptions = {
      type: options.type ?? "chars",
      preserveSpaces: options.preserveSpaces ?? true,
      duration: Math.max(0.1, options.duration ?? 1),
      delay: Math.max(0, options.delay ?? 0),
      ease: this.validateEase(options.ease) ?? "power2.out",
      trigger: options.trigger ?? "immediate",
      threshold: Math.max(0, Math.min(1, options.threshold ?? 0.1)),
      once: options.once ?? true,
      repeat: Math.max(-1, options.repeat ?? 0),
      yoyo: options.yoyo ?? false,
      // Optional callbacks - keep them optional
      onComplete: options.onComplete,
      onStart: options.onStart,
      onUpdate: options.onUpdate,
      rootMargin: options.rootMargin,
    };

    this.originalText = this.element.textContent || "";
    this.originalHTML = this.element.innerHTML;

    if (!this.originalText.trim()) {
      console.warn("TextReveal: Element has no text content");
      return;
    }
  }

  private validateEase(ease?: string): string | undefined {
    if (!ease) return undefined;

    const validEases = [
      "none",
      "power1",
      "power2",
      "power3",
      "power4",
      "back",
      "elastic",
      "bounce",
      "circ",
      "expo",
      "sine",
    ];

    const easeTypes = [".in", ".out", ".inOut"];
    const isValidEase = validEases.some(
      (validEase) =>
        ease.startsWith(validEase) ||
        easeTypes.some((type) => ease === validEase + type)
    );

    return isValidEase ? ease : undefined;
  }

  protected createAnimation(): void {
    if (!this.originalText.trim()) return;

    try {
      this.splitText();
      this.animateSplitText();
    } catch (error) {
      console.error("Failed to create text reveal animation:", error);
      this.restoreOriginalText();
    }
  }

  private splitText(): void {
    const { type, preserveSpaces } = this.textOptions;

    // Create container to maintain layout
    this.containerElement = document.createElement("div");
    this.containerElement.style.cssText = "display: inline;";

    this.element.innerHTML = "";
    this.element.appendChild(this.containerElement);
    this.splitElements = [];

    try {
      switch (type) {
        case "chars":
          this.createCharElements(
            AdvancedTextSplitter.splitByChars(this.originalText, preserveSpaces)
          );
          break;
        case "words":
          this.createWordElements(
            AdvancedTextSplitter.splitByWords(this.originalText)
          );
          break;
        case "lines":
          this.createLineElements(
            AdvancedTextSplitter.splitByLines(this.element)
          );
          break;
        case "sentences":
          this.createSentenceElements(
            AdvancedTextSplitter.splitBySentences(this.originalText)
          );
          break;
        default:
          throw new Error(`Invalid type: ${type}`);
      }
    } catch (error) {
      console.error("Text splitting failed:", error);
      throw error;
    }
  }

  private createCharElements(chars: string[]): void {
    chars.forEach((char, index) => {
      const span = document.createElement("span");
      span.innerHTML = char === "<br>" ? "<br>" : char;
      span.style.cssText = `
        display: inline-block;
        opacity: 0;
        transform: translateY(20px);
        transition-property: opacity, transform;
      `;

      // Handle special characters
      if (char === "<br>") {
        span.style.display = "block";
        span.style.width = "100%";
        span.style.height = "0";
      }

      this.containerElement!.appendChild(span);
      this.splitElements.push(span);
    });
  }

  private createWordElements(words: string[]): void {
    words.forEach((word, index) => {
      if (word.trim()) {
        const span = document.createElement("span");
        span.textContent = word.trim();
        span.style.cssText = `
          display: inline-block;
          opacity: 0;
          transform: translateY(20px);
          margin-right: 0.25em;
          transition-property: opacity, transform;
        `;
        this.containerElement!.appendChild(span);
        this.splitElements.push(span);
      } else {
        // Handle spaces
        this.containerElement!.appendChild(document.createTextNode(" "));
      }
    });
  }

  private createLineElements(lines: string[]): void {
    lines.forEach((line) => {
      const div = document.createElement("div");
      div.textContent = line;
      div.style.cssText = `
        opacity: 0;
        transform: translateY(20px);
        transition-property: opacity, transform;
      `;
      this.containerElement!.appendChild(div);
      this.splitElements.push(div);
    });
  }

  private createSentenceElements(sentences: string[]): void {
    sentences.forEach((sentence, index) => {
      const span = document.createElement("span");
      span.textContent = sentence;
      span.style.cssText = `
        display: inline;
        opacity: 0;
        transform: translateY(20px);
        transition-property: opacity, transform;
      `;
      this.containerElement!.appendChild(span);
      this.splitElements.push(span);

      // Add punctuation and spacing
      if (index < sentences.length - 1) {
        this.containerElement!.appendChild(document.createTextNode(". "));
      }
    });
  }

  private animateSplitText(): void {
    if (this.splitElements.length === 0) return;

    const stagger = Math.min(
      0.1,
      this.textOptions.duration / this.splitElements.length
    );

    this.timeline.to(this.splitElements, {
      opacity: 1,
      y: 0,
      duration: this.textOptions.duration,
      ease: this.textOptions.ease,
      stagger: {
        amount: stagger * this.splitElements.length,
        from: "start",
      },
      onStart: () => {
        this.isRevealed = false;
        this.textOptions.onStart?.();
      },
      onComplete: () => {
        this.isRevealed = true;
        this.textOptions.onComplete?.();
      },
      onUpdate: () => {
        const progress = this.timeline.progress();
        this.textOptions.onUpdate?.(progress);
      },
    });
  }

  // Enhanced control methods
  revealByIndex(index: number, duration: number = 0.3): Promise<void> {
    return new Promise((resolve) => {
      if (index >= 0 && index < this.splitElements.length) {
        gsap.to(this.splitElements[index], {
          opacity: 1,
          y: 0,
          duration,
          ease: "power2.out",
          onComplete: resolve,
        });
      } else {
        resolve();
      }
    });
  }

  hideByIndex(index: number, duration: number = 0.3): Promise<void> {
    return new Promise((resolve) => {
      if (index >= 0 && index < this.splitElements.length) {
        gsap.to(this.splitElements[index], {
          opacity: 0,
          y: 20,
          duration,
          ease: "power2.out",
          onComplete: resolve,
        });
      } else {
        resolve();
      }
    });
  }

  revealAll(duration?: number): Promise<void> {
    return new Promise((resolve) => {
      const animDuration = duration || this.textOptions.duration;
      gsap.to(this.splitElements, {
        opacity: 1,
        y: 0,
        duration: animDuration,
        stagger: 0.03,
        ease: this.textOptions.ease,
        onComplete: () => {
          this.isRevealed = true;
          resolve();
        },
      });
    });
  }

  hideAll(duration: number = 0.5): Promise<void> {
    return new Promise((resolve) => {
      gsap.to(this.splitElements, {
        opacity: 0,
        y: 20,
        duration,
        stagger: 0.02,
        ease: "power2.out",
        onComplete: () => {
          this.isRevealed = false;
          resolve();
        },
      });
    });
  }

  // Wave reveal effect
  revealWave(direction: "left" | "right" | "center" = "left"): Promise<void> {
    return new Promise((resolve) => {
      const stagger = {
        amount: this.textOptions.duration,
        from: direction as any,
        ease: "power2.out",
      };

      gsap.to(this.splitElements, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: this.textOptions.duration,
        stagger,
        ease: this.textOptions.ease,
        onComplete: () => {
          this.isRevealed = true;
          resolve();
        },
      });
    });
  }

  // Type writer effect
  typeWriter(speed: number = 50): Promise<void> {
    return new Promise((resolve) => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < this.splitElements.length) {
          gsap.to(this.splitElements[index], {
            opacity: 1,
            y: 0,
            duration: 0.1,
            ease: "none",
          });
          index++;
        } else {
          clearInterval(interval);
          this.isRevealed = true;
          resolve();
        }
      }, speed);
    });
  }

  // Glitch reveal effect
  glitchReveal(): Promise<void> {
    return new Promise((resolve) => {
      this.splitElements.forEach((element, index) => {
        gsap.to(element, {
          opacity: 1,
          y: 0,
          duration: 0.1,
          delay: index * 0.02,
          ease: "none",
          repeat: 2,
          yoyo: true,
          onComplete:
            index === this.splitElements.length - 1
              ? () => {
                  this.isRevealed = true;
                  resolve();
                }
              : undefined,
        });
      });
    });
  }

  // Utility methods
  isFullyRevealed(): boolean {
    return this.isRevealed;
  }

  getRevealProgress(): number {
    if (!this.timeline) return 0;
    return this.timeline.progress();
  }

  getSplitElements(): HTMLElement[] {
    return [...this.splitElements];
  }

  getElementCount(): number {
    return this.splitElements.length;
  }

  private restoreOriginalText(): void {
    this.element.innerHTML = this.originalHTML;
  }

  // Enhanced destroy method
  destroy(): void {
    try {
      super.destroy();
      this.restoreOriginalText();
      this.splitElements = [];
      this.containerElement = null;
      this.isRevealed = false;
    } catch (error) {
      console.error("Error during TextReveal destroy:", error);
    }
  }
}

// Enhanced factory function
export function createTextReveal(
  element: HTMLElement | string,
  options: TextRevealOptions = {}
): TextReveal {
  try {
    const el =
      typeof element === "string"
        ? (document.querySelector(element) as HTMLElement)
        : element;

    if (!el) {
      throw new Error(`Element not found: ${element}`);
    }

    const textContent = el.textContent || "";
    if (!textContent.trim()) {
      console.warn("TextReveal: Element has no text content");
    }

    return new TextReveal(el, options);
  } catch (error) {
    console.error("Failed to create TextReveal:", error);
    throw error;
  }
}

// Batch creation utility
export function createTextRevealBatch(
  elements: (HTMLElement | string)[],
  options: TextRevealOptions = {}
): TextReveal[] {
  const reveals: TextReveal[] = [];

  elements.forEach((element, index) => {
    try {
      const reveal = createTextReveal(element, {
        ...options,
        delay: (options.delay || 0) + index * 0.1,
      });
      reveals.push(reveal);
    } catch (error) {
      console.warn(
        `Failed to create TextReveal for element at index ${index}:`,
        error
      );
    }
  });

  return reveals;
}

// Presets for common text reveal patterns
export const TextRevealPresets = {
  fadeInUp: (duration = 1): TextRevealOptions => ({
    type: "words",
    duration,
    ease: "power2.out",
    trigger: "scroll",
  }),

  typewriter: (speed = 50): TextRevealOptions => ({
    type: "chars",
    duration: 0.1,
    ease: "none",
  }),

  wave: (duration = 1.5): TextRevealOptions => ({
    type: "chars",
    duration,
    ease: "back.out(1.7)",
  }),

  glitch: (): TextRevealOptions => ({
    type: "chars",
    duration: 0.1,
    ease: "none",
  }),
};
