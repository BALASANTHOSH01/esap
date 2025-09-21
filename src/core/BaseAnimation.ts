import { gsap } from "gsap";
import * as THREE from "three";
import {
  AdvancedAnimationEngine,
  type PerformanceMetrics,
} from "./AnimationEngine";
import type {
  AnimationInstance,
  PhysicsOptions,
  ThreeDOptions,
  ExtendedAnimationOptions,
  Vector3,
  GestureOptions,
  MotionPathOptions,
  LightOptions,
  ParticleSystemOptions,
  EventHandler,
} from "../types/core";

// Physics simulation engine
class PhysicsEngine {
  private bodies: Map<string, PhysicsBody> = new Map();
  private running = false;
  private lastTime = 0;
  private animationId?: number;

  addBody(id: string, element: HTMLElement, options: PhysicsOptions): void {
    this.bodies.set(id, new PhysicsBody(element, options));
  }

  removeBody(id: string): void {
    this.bodies.delete(id);
  }

  getBody(id: string): PhysicsBody | undefined {
    return this.bodies.get(id);
  }

  update(deltaTime: number): void {
    this.bodies.forEach((body) => body.update(deltaTime));
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.animate();
  }

  stop(): void {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
    }
  }

  private animate = (): void => {
    if (!this.running) return;

    const now = performance.now();
    const delta = (now - this.lastTime) / 1000;
    this.lastTime = now;

    this.update(delta);
    this.animationId = requestAnimationFrame(this.animate);
  };

  clear(): void {
    this.stop();
    this.bodies.clear();
  }
}

class PhysicsBody {
  private velocity: Vector3 = { x: 0, y: 0, z: 0 };
  private acceleration: Vector3 = { x: 0, y: 0, z: 0 };
  private mass: number;
  private damping: number;
  private element: HTMLElement;
  private options: PhysicsOptions;
  private position: Vector3;

  constructor(element: HTMLElement, options: PhysicsOptions) {
    this.element = element;
    this.options = options;
    this.mass = options.mass || 1;
    this.damping = options.damping || 0.95;

    const rect = element.getBoundingClientRect();
    this.position = { x: rect.left, y: rect.top, z: 0 };
  }

  applyForce(force: Vector3): void {
    this.acceleration.x += force.x / this.mass;
    this.acceleration.y += force.y / this.mass;
    this.acceleration.z += force.z / this.mass;
  }

  setPosition(position: Partial<Vector3>): void {
    if (position.x !== undefined) this.position.x = position.x;
    if (position.y !== undefined) this.position.y = position.y;
    if (position.z !== undefined) this.position.z = position.z;
  }

  getPosition(): Vector3 {
    return { ...this.position };
  }

  setVelocity(velocity: Partial<Vector3>): void {
    if (velocity.x !== undefined) this.velocity.x = velocity.x;
    if (velocity.y !== undefined) this.velocity.y = velocity.y;
    if (velocity.z !== undefined) this.velocity.z = velocity.z;
  }

  getVelocity(): Vector3 {
    return { ...this.velocity };
  }

  update(deltaTime: number): void {
    // Spring physics
    if (this.options.spring) {
      const spring = this.options.spring;
      const dx = spring.target.x - this.position.x;
      const dy = spring.target.y - this.position.y;
      const dz = spring.target.z - this.position.z;

      this.applyForce({
        x: dx * spring.stiffness,
        y: dy * spring.stiffness,
        z: dz * spring.stiffness,
      });
    }

    // Apply gravity if enabled
    if (this.options.gravity) {
      this.applyForce({ x: 0, y: this.options.gravity * this.mass, z: 0 });
    }

    // Update velocity
    this.velocity.x += this.acceleration.x * deltaTime;
    this.velocity.y += this.acceleration.y * deltaTime;
    this.velocity.z += this.acceleration.z * deltaTime;

    // Apply damping
    this.velocity.x *= this.damping;
    this.velocity.y *= this.damping;
    this.velocity.z *= this.damping;

    // Update position
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.position.z += this.velocity.z * deltaTime;

    // Apply constraints
    if (this.options.constraints) {
      this.applyConstraints();
    }

    // Update element transform
    this.updateElement();

    // Reset acceleration
    this.acceleration = { x: 0, y: 0, z: 0 };
  }

  private applyConstraints(): void {
    const constraints = this.options.constraints!;

    if (constraints.minX !== undefined && this.position.x < constraints.minX) {
      this.position.x = constraints.minX;
      this.velocity.x *= -(constraints.bounce || 0);
    }
    if (constraints.maxX !== undefined && this.position.x > constraints.maxX) {
      this.position.x = constraints.maxX;
      this.velocity.x *= -(constraints.bounce || 0);
    }
    if (constraints.minY !== undefined && this.position.y < constraints.minY) {
      this.position.y = constraints.minY;
      this.velocity.y *= -(constraints.bounce || 0);
    }
    if (constraints.maxY !== undefined && this.position.y > constraints.maxY) {
      this.position.y = constraints.maxY;
      this.velocity.y *= -(constraints.bounce || 0);
    }
    if (constraints.minZ !== undefined && this.position.z < constraints.minZ) {
      this.position.z = constraints.minZ;
      this.velocity.z *= -(constraints.bounce || 0);
    }
    if (constraints.maxZ !== undefined && this.position.z > constraints.maxZ) {
      this.position.z = constraints.maxZ;
      this.velocity.z *= -(constraints.bounce || 0);
    }
  }

  private updateElement(): void {
    this.element.style.transform = `translate3d(${this.position.x}px, ${this.position.y}px, ${this.position.z}px)`;
  }
}

// Three.js integration for 3D animations
class ThreeJSIntegration {
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private renderer?: THREE.WebGLRenderer;
  private objects: Map<string, THREE.Object3D> = new Map();
  private animationMixers: Map<string, THREE.AnimationMixer> = new Map();
  private clock: THREE.Clock = new THREE.Clock();
  private animationId?: number;
  private isRunning = false;

  initialize(container: HTMLElement, options: ThreeDOptions): boolean {
    try {
      // Create scene
      this.scene = new THREE.Scene();

      // Setup camera
      this.camera = new THREE.PerspectiveCamera(
        options.fov || 75,
        container.clientWidth / container.clientHeight,
        options.near || 0.1,
        options.far || 1000
      );
      this.camera.position.z = options.cameraZ || 5;

      // Setup renderer
      this.renderer = new THREE.WebGLRenderer({
        antialias: options.antialias !== false,
        alpha: true,
      });
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      container.appendChild(this.renderer.domElement);

      // Add lights if specified
      if (options.lights) {
        this.setupLights(options.lights);
      }

      // Start render loop
      this.start();

      return true;
    } catch (error) {
      console.error("Failed to initialize Three.js:", error);
      return false;
    }
  }

  private setupLights(lights: LightOptions[]): void {
    lights.forEach((light) => {
      let lightObj: THREE.Light;

      switch (light.type) {
        case "ambient":
          lightObj = new THREE.AmbientLight(
            light.color || 0xffffff,
            light.intensity || 1
          );
          break;
        case "directional":
          lightObj = new THREE.DirectionalLight(
            light.color || 0xffffff,
            light.intensity || 1
          );
          lightObj.position.set(light.x || 0, light.y || 1, light.z || 0);
          break;
        case "point":
          lightObj = new THREE.PointLight(
            light.color || 0xffffff,
            light.intensity || 1
          );
          lightObj.position.set(light.x || 0, light.y || 0, light.z || 0);
          break;
        default:
          return;
      }

      this.scene!.add(lightObj);
    });
  }

  addObject(
    id: string,
    geometry: THREE.BufferGeometry,
    material: THREE.Material
  ): THREE.Mesh | null {
    try {
      const mesh = new THREE.Mesh(geometry, material);
      this.objects.set(id, mesh);
      this.scene!.add(mesh);
      return mesh;
    } catch (error) {
      console.error("Failed to add object:", error);
      return null;
    }
  }

  getObject(id: string): THREE.Object3D | undefined {
    return this.objects.get(id);
  }

  removeObject(id: string): boolean {
    const object = this.objects.get(id);
    if (object) {
      this.scene!.remove(object);
      this.objects.delete(id);

      // Clean up geometry and material
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (object.material instanceof THREE.Material) {
          object.material.dispose();
        }
      }
      return true;
    }
    return false;
  }

  animateObject(
    id: string,
    properties: any,
    duration: number
  ): gsap.core.Timeline | null {
    const object = this.objects.get(id);
    if (!object) return null;

    const timeline = gsap.timeline();

    // Position animation
    if (properties.position) {
      timeline.to(
        object.position,
        {
          x: properties.position.x ?? object.position.x,
          y: properties.position.y ?? object.position.y,
          z: properties.position.z ?? object.position.z,
          duration,
          ease: properties.ease || "power2.out",
        },
        0
      );
    }

    // Rotation animation
    if (properties.rotation) {
      timeline.to(
        object.rotation,
        {
          x: properties.rotation.x ?? object.rotation.x,
          y: properties.rotation.y ?? object.rotation.y,
          z: properties.rotation.z ?? object.rotation.z,
          duration,
          ease: properties.ease || "power2.out",
        },
        0
      );
    }

    // Scale animation
    if (properties.scale) {
      timeline.to(
        object.scale,
        {
          x: properties.scale.x ?? object.scale.x,
          y: properties.scale.y ?? object.scale.y,
          z: properties.scale.z ?? object.scale.z,
          duration,
          ease: properties.ease || "power2.out",
        },
        0
      );
    }

    return timeline;
  }

  createParticleSystem(options: ParticleSystemOptions): THREE.Points | null {
    try {
      const geometry = new THREE.BufferGeometry();
      const particles = options.count || 1000;
      const positions = new Float32Array(particles * 3);
      const colors = new Float32Array(particles * 3);

      for (let i = 0; i < particles * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * (options.spread || 10);
        positions[i + 1] = (Math.random() - 0.5) * (options.spread || 10);
        positions[i + 2] = (Math.random() - 0.5) * (options.spread || 10);

        colors[i] = Math.random();
        colors[i + 1] = Math.random();
        colors[i + 2] = Math.random();
      }

      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: options.size || 0.1,
        vertexColors: true,
        transparent: true,
        opacity: options.opacity || 1,
      });

      const points = new THREE.Points(geometry, material);
      this.scene!.add(points);

      // Animate particles
      gsap.to(points.rotation, {
        y: Math.PI * 2,
        duration: options.duration || 10,
        repeat: -1,
        ease: "none",
      });

      return points;
    } catch (error) {
      console.error("Failed to create particle system:", error);
      return null;
    }
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
    }
  }

  private animate = (): void => {
    if (!this.isRunning) return;

    const delta = this.clock.getDelta();

    // Update animation mixers
    this.animationMixers.forEach((mixer) => {
      mixer.update(delta);
    });

    // Render scene
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }

    this.animationId = requestAnimationFrame(this.animate);
  };

  resize(width: number, height: number): void {
    if (this.camera && this.renderer) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }

  dispose(): void {
    this.stop();

    // Dispose objects
    this.objects.forEach((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (obj.material instanceof THREE.Material) {
          obj.material.dispose();
        }
      }
    });

    // Dispose renderer
    this.renderer?.dispose();

    // Clear maps
    this.objects.clear();
    this.animationMixers.clear();
  }
}

// Gesture handler class
class GestureHandler {
  private element: HTMLElement;
  private options: GestureOptions;
  private eventListeners: Map<string, EventHandler[]> = new Map();
  private isDestroyed = false;
  private boundEventListeners: Map<string, EventListener> = new Map();

  // Track active timers for cleanup
  private activeTimers: Set<number> = new Set();

  constructor(element: HTMLElement, options: GestureOptions) {
    this.element = element;
    this.options = options;
    this.init();
  }

  private init(): void {
    if (this.options.swipe) {
      this.setupSwipeDetection();
    }
    if (this.options.pinch) {
      this.setupPinchDetection();
    }
    if (this.options.tap) {
      this.setupTapDetection();
    }
    if (this.options.longPress) {
      this.setupLongPressDetection();
    }
  }

  private setupSwipeDetection(): void {
    let startX = 0,
      startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;

      const deltaX = endX - startX;
      const deltaY = endY - startY;

      const sensitivity = this.options.sensitivity || 50;

      if (Math.abs(deltaX) > sensitivity || Math.abs(deltaY) > sensitivity) {
        let direction: string;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          direction = deltaX > 0 ? "right" : "left";
        } else {
          direction = deltaY > 0 ? "down" : "up";
        }

        this.emit("swipe", direction);
        this.options.onSwipe?.(direction);
      }
    };

    this.element.addEventListener("touchstart", handleTouchStart);
    this.element.addEventListener("touchend", handleTouchEnd);
  }

  private setupPinchDetection(): void {
    let initialDistance = 0;

    const getDistance = (touches: TouchList): number => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialDistance = getDistance(e.touches);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const currentDistance = getDistance(e.touches);
        const scale = currentDistance / initialDistance;

        this.emit("pinch", scale);
        this.options.onPinch?.(scale);
      }
    };

    this.element.addEventListener("touchstart", handleTouchStart);
    this.element.addEventListener("touchmove", handleTouchMove);
  }

  private setupTapDetection(): void {
    const handleClick = () => {
      this.emit("tap");
      this.options.onTap?.();
    };

    this.element.addEventListener("click", handleClick);
  }

  private setupLongPressDetection(): void {
    const handleMouseDown = () => {
      if (this.isDestroyed) return;

      const pressTimer = window.setTimeout(() => {
        if (!this.isDestroyed) {
          this.emit("longPress");
          this.options.onLongPress?.();
        }
        this.activeTimers.delete(pressTimer);
      }, 500);

      // Track the timer for cleanup
      this.activeTimers.add(pressTimer);
    };

    const handleMouseUp = () => {
      // Clear all active timers when mouse is released
      this.activeTimers.forEach((timer) => clearTimeout(timer));
      this.activeTimers.clear();
    };

    this.boundEventListeners.set("mousedown", handleMouseDown);
    this.boundEventListeners.set("mouseup", handleMouseUp);
    this.boundEventListeners.set("mouseleave", handleMouseUp);

    this.element.addEventListener("mousedown", handleMouseDown);
    this.element.addEventListener("mouseup", handleMouseUp);
    this.element.addEventListener("mouseleave", handleMouseUp);
  }

  on(event: string, handler: EventHandler): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(handler);
  }

  off(event: string, handler: EventHandler): void {
    const handlers = this.eventListeners.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(event: string, ...args: any[]): void {
    const handlers = this.eventListeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(...args));
    }
  }

  destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    // Clear all active timers
    this.activeTimers.forEach((timer) => clearTimeout(timer));
    this.activeTimers.clear();

    // Clear custom event listeners
    this.eventListeners.clear();

    // Remove DOM event listeners
    this.boundEventListeners.forEach((listener, eventType) => {
      try {
        const actualEventType = eventType.includes("-")
          ? eventType.split("-")[1]
          : eventType;

        this.element.removeEventListener(actualEventType, listener);
      } catch (error) {
        console.error(`Failed to remove event listener ${eventType}:`, error);
      }
    });

    this.boundEventListeners.clear();
  }
}

// Motion path class
class MotionPath {
  private element: HTMLElement;
  private options: MotionPathOptions;
  private timeline: gsap.core.Timeline;

  constructor(element: HTMLElement, options: MotionPathOptions) {
    this.element = element;
    this.options = options;
    this.timeline = gsap.timeline();
    this.createAnimation();
  }

  private createAnimation(): void {
    const pathElement =
      typeof this.options.path === "string"
        ? (document.querySelector(this.options.path) as SVGPathElement)
        : this.options.path;

    if (!pathElement) {
      console.warn("Motion path element not found");
      return;
    }

    // Create motion path configuration that matches GSAP's expected structure
    const motionPathConfig: any = {
      path: pathElement,
      autoRotate: this.options.autoRotate || false,
    };

    // Only add alignOrigin if it's provided and is an array
    if (this.options.alignOrigin) {
      if (Array.isArray(this.options.alignOrigin)) {
        motionPathConfig.alignOrigin = this.options.alignOrigin;
      } else if (typeof this.options.alignOrigin === "string") {
        // Convert string format like "0.5 0.5" to array [0.5, 0.5]
        const parts = this.options.alignOrigin.split(" ").map(Number);
        if (parts.length === 2 && !parts.some(isNaN)) {
          motionPathConfig.alignOrigin = parts;
        }
      }
    } else {
      motionPathConfig.alignOrigin = [0.5, 0.5];
    }

    this.timeline.to(this.element, {
      duration: this.options.duration || 2,
      ease: this.options.ease || "none",
      motionPath: motionPathConfig,
    });
  }

  getAnimation(): gsap.core.Timeline {
    return this.timeline;
  }

  destroy(): void {
    this.timeline.kill();
  }
}

export interface IAnimationEngine {
  getPerformanceMetrics(): PerformanceMetrics;
  start(): void;
  dispose(): void;
  // Add other methods that BaseAnimation actually uses
  addAnimation?(id: string, element: HTMLElement, properties: any): void;
  removeAnimation?(id: string): void;
}

// Base Animation Class
export abstract class BaseAnimation {
  protected engine: IAnimationEngine; // Use interface instead of concrete class
  protected element: HTMLElement;
  protected timeline: gsap.core.Timeline;
  protected options: ExtendedAnimationOptions;
  protected observer?: IntersectionObserver;
  protected isDestroyed = false;
  protected id: string;

  // Enhanced features with proper typing
  protected physicsEngine?: PhysicsEngine;
  protected threeJS?: ThreeJSIntegration;
  protected gestureHandler?: GestureHandler;
  protected motionPath?: MotionPath;

  // FIX 2: Track event handlers for proper cleanup
  private documentEventHandlers = new Map<string, () => void>();
  private elementEventHandlers = new Map<string, EventListener>();

  constructor(element: HTMLElement, options: ExtendedAnimationOptions = {}) {
    // Cast to interface to avoid circular dependency while maintaining compatibility
    this.engine =
      AdvancedAnimationEngine.getInstance() as unknown as IAnimationEngine;
    this.element = element;
    this.options = this.mergeDefaultOptions(options);

    this.timeline = gsap.timeline({
      duration: this.options.duration,
      delay: this.options.delay,
      ease: this.options.ease,
      onStart: this.options.onStart,
      onUpdate: () => this.options.onUpdate?.(this.timeline.progress()),
      onComplete: this.options.onComplete,
    });

    this.id = this.generateId();

    this.initializeFeatures();
    this.initialize();
  }

  protected mergeDefaultOptions(
    options: ExtendedAnimationOptions
  ): ExtendedAnimationOptions {
    return {
      duration: 1,
      delay: 0,
      ease: "power2.out",
      trigger: "immediate",
      threshold: 0.1,
      once: true,
      gpu: true, // Enable GPU acceleration by default
      willChange: true, // Optimize for animations
      ...options,
    };
  }

  protected initialize(): void {
    this.optimizeElement();
    this.setupTrigger();
    this.createAnimation();
  }

  protected optimizeElement(): void {
    if (this.options.gpu) {
      this.element.style.transform = "translateZ(0)";
      this.element.style.backfaceVisibility = "hidden";
      this.element.style.perspective = "1000px";
    }

    if (this.options.willChange) {
      this.element.style.willChange = "transform, opacity";
    }
  }

  protected initializeFeatures(): void {
    if (this.options.physics) {
      this.initializePhysics(this.options.physics);
    }

    if (this.options.threeDimensional) {
      this.initialize3D(this.options.threeDimensional);
    }

    if (this.options.gestures) {
      this.initializeGestures(this.options.gestures);
    }

    if (this.options.motionPath) {
      this.initializeMotionPath(this.options.motionPath);
    }
  }

  protected initializePhysics(options: PhysicsOptions): void {
    this.physicsEngine = new PhysicsEngine();
    this.physicsEngine.addBody(this.id, this.element, options);
    this.physicsEngine.start();
  }

  protected initialize3D(options: ThreeDOptions): void {
    this.threeJS = new ThreeJSIntegration();
    const container = options.container || this.element;
    this.threeJS.initialize(container as HTMLElement, options);
  }

  protected initializeGestures(options: GestureOptions): void {
    this.gestureHandler = new GestureHandler(this.element, options);
    this.gestureHandler.on("swipe", (direction: string) => {
      this.handleGesture("swipe", direction);
    });
    this.gestureHandler.on("pinch", (scale: number) => {
      this.handleGesture("pinch", scale);
    });
    this.gestureHandler.on("tap", () => {
      this.handleGesture("tap");
    });
    this.gestureHandler.on("longPress", () => {
      this.handleGesture("longPress");
    });
  }

  protected initializeMotionPath(options: MotionPathOptions): void {
    this.motionPath = new MotionPath(this.element, options);
    this.timeline.add(this.motionPath.getAnimation());
  }

  private handlePinchGesture(scale: number): void {
    // Scale the element based on pinch gesture
    gsap.to(this.element, {
      scale: scale,
      duration: 0.1,
      ease: "none",
    });
  }

  private handleTapGesture(): void {
    // Toggle animation on tap
    if (this.timeline.isActive()) {
      this.pause();
    } else {
      this.play();
    }
  }

  private handleLongPressGesture(): void {
    // Reset animation on long press
    this.restart();
  }

  private handleSwipeGesture(direction: string): void {
    // Example: trigger different animations based on swipe direction
    switch (direction) {
      case "left":
        this.timeline.play();
        break;
      case "right":
        this.timeline.reverse();
        break;
      case "up":
        this.timeline.timeScale(2);
        break;
      case "down":
        this.timeline.timeScale(0.5);
        break;
    }
  }

  // Complete gesture handling
  protected handleGesture(type: string, data?: any): void {
    switch (type) {
      case "swipe":
        this.handleSwipeGesture(data);
        break;
      case "pinch":
        this.handlePinchGesture(data);
        break;
      case "tap":
        this.handleTapGesture();
        break;
      case "longPress":
        this.handleLongPressGesture();
        break;
    }
  }

  protected setupTrigger(): void {
    switch (this.options.trigger) {
      case "scroll":
        this.setupScrollTrigger();
        break;
      case "click":
        this.addElementEventListener("click", this.handleTrigger.bind(this));
        break;
      case "hover":
        this.addElementEventListener(
          "mouseenter",
          this.handleTrigger.bind(this)
        );
        break;
      case "proximity":
        this.setupProximityTrigger();
        break;
      case "deviceOrientation":
        this.setupOrientationTrigger();
        break;
      case "immediate":
      default:
        this.play();
        break;
    }
  }

  // Helper method to track element event listeners
  private addElementEventListener(event: string, handler: EventListener): void {
    this.element.addEventListener(event, handler);
    this.elementEventHandlers.set(event, handler);
  }

  protected setupScrollTrigger(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            entry.intersectionRatio >= (this.options.threshold || 0.1)
          ) {
            this.play();
            if (this.options.once) {
              this.observer?.disconnect();
            }
          }
        });
      },
      {
        threshold: this.options.threshold || 0.1,
        rootMargin: this.options.rootMargin || "0px",
      }
    );
    this.observer.observe(this.element);
  }

  protected setupProximityTrigger(): void {
    const handleMouseMove = (e: MouseEvent) => {
      if (this.isDestroyed) return;

      const rect = this.element.getBoundingClientRect();
      const elementCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      const distance = Math.hypot(
        e.clientX - elementCenter.x,
        e.clientY - elementCenter.y
      );

      const threshold = this.options.proximityThreshold || 100;
      if (distance < threshold) {
        const progress = 1 - distance / threshold;
        this.timeline.progress(progress);
      }
    };

    // Track the event handler for proper cleanup
    document.addEventListener("mousemove", handleMouseMove);
    this.documentEventHandlers.set("proximity", () => {
      document.removeEventListener("mousemove", handleMouseMove);
    });
  }

  protected setupOrientationTrigger(): void {
    if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
      const handleOrientation = (e: DeviceOrientationEvent) => {
        if (this.isDestroyed) return;

        const tilt = e.beta || 0;
        const rotation = e.gamma || 0;

        const normalizedTilt = (tilt + 180) / 360;
        const normalizedRotation = (rotation + 90) / 180;

        this.timeline.progress((normalizedTilt + normalizedRotation) / 2);
      };

      window.addEventListener("deviceorientation", handleOrientation);
      this.documentEventHandlers.set("orientation", () => {
        window.removeEventListener("deviceorientation", handleOrientation);
      });
    }
  }

  protected handleTrigger(): void {
    this.play();
  }

  // Abstract method to be implemented by subclasses
  protected abstract createAnimation(): void;

  // Physics helper methods
  protected applyPhysicsForce(force: Vector3): void {
    if (this.physicsEngine) {
      const body = this.physicsEngine.getBody(this.id);
      body?.applyForce(force);
    }
  }

  protected setPhysicsPosition(position: Partial<Vector3>): void {
    if (this.physicsEngine) {
      const body = this.physicsEngine.getBody(this.id);
      body?.setPosition(position);
    }
  }

  protected getPhysicsPosition(): Vector3 | null {
    if (this.physicsEngine) {
      const body = this.physicsEngine.getBody(this.id);
      return body?.getPosition() || null;
    }
    return null;
  }

  protected setPhysicsVelocity(velocity: Partial<Vector3>): void {
    if (this.physicsEngine) {
      const body = this.physicsEngine.getBody(this.id);
      body?.setVelocity(velocity);
    }
  }

  protected getPhysicsVelocity(): Vector3 | null {
    if (this.physicsEngine) {
      const body = this.physicsEngine.getBody(this.id);
      return body?.getVelocity() || null;
    }
    return null;
  }

  // 3D helper methods
  protected add3DObject(
    id: string,
    geometry: THREE.BufferGeometry,
    material: THREE.Material
  ): THREE.Mesh | null {
    try {
      return this.threeJS?.addObject(id, geometry, material) || null;
    } catch (error) {
      console.error("Failed to add 3D object:", error);
      return null;
    }
  }

  protected animate3DObject(
    id: string,
    properties: Record<string, any>,
    duration: number
  ): gsap.core.Timeline | null {
    try {
      return this.threeJS?.animateObject(id, properties, duration) || null;
    } catch (error) {
      console.error("Failed to animate 3D object:", error);
      return null;
    }
  }

  protected get3DObject(id: string): THREE.Object3D | null {
    try {
      return this.threeJS?.getObject(id) || null;
    } catch (error) {
      console.error("Failed to get 3D object:", error);
      return null;
    }
  }

  protected remove3DObject(id: string): boolean {
    return this.threeJS?.removeObject(id) || false;
  }

  protected createParticleSystem(
    options: ParticleSystemOptions
  ): THREE.Points | null {
    try {
      return this.threeJS?.createParticleSystem(options) || null;
    } catch (error) {
      console.error("Failed to create particle system:", error);
      return null;
    }
  }

  // Animation control methods
  play(): void {
    if (!this.isDestroyed) {
      this.timeline.play();
      this.options.onStart?.();
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

  progress(value?: number): number {
    if (this.isDestroyed) return 0;

    if (typeof value === "number" && value >= 0 && value <= 1) {
      this.timeline.progress(value);
      this.options.onUpdate?.(value);
      return value;
    } else if (value === undefined) {
      return this.timeline.progress();
    } else {
      console.warn("Progress value must be between 0 and 1");
      return this.timeline.progress();
    }
  }

  // Advanced animation control methods
  setTimeScale(scale: number): void {
    if (!this.isDestroyed) {
      this.timeline.timeScale(scale);
    }
  }

  seek(time: number): void {
    if (!this.isDestroyed) {
      this.timeline.seek(time);
    }
  }

  addLabel(label: string, position?: number | string): void {
    if (!this.isDestroyed) {
      this.timeline.addLabel(label, position);
    }
  }

  gotoAndPlay(position: number | string): void {
    if (!this.isDestroyed) {
      this.timeline.play(position);
    }
  }

  gotoAndStop(position: number | string): void {
    if (!this.isDestroyed) {
      this.timeline.pause(position);
    }
  }

  // Event handling
  onComplete(callback: () => void): void {
    this.timeline.eventCallback("onComplete", () => {
      callback();
      this.options.onComplete?.();
    });
  }

  onStart(callback: () => void): void {
    this.timeline.eventCallback("onStart", () => {
      callback();
      this.options.onStart?.();
    });
  }

  onUpdate(callback: (progress: number) => void): void {
    this.timeline.eventCallback("onUpdate", () => {
      const progress = this.timeline.progress();
      callback(progress);
      this.options.onUpdate?.(progress);
    });
  }

  // Utility methods
  getDuration(): number {
    return this.timeline.duration();
  }

  getTotalDuration(): number {
    return this.timeline.totalDuration();
  }

  isActive(): boolean {
    return this.timeline.isActive();
  }

  isPaused(): boolean {
    return this.timeline.paused();
  }

  // Cleanup and destruction
  destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    try {
      // Kill timeline first
      if (this.timeline) {
        this.timeline.kill();
      }

      // Disconnect observer
      if (this.observer) {
        this.observer.disconnect();
        this.observer = undefined;
      }

      // Clean up all document event listeners
      this.documentEventHandlers.forEach((cleanup) => {
        try {
          cleanup();
        } catch (error) {
          console.error("Error cleaning up document event listener:", error);
        }
      });
      this.documentEventHandlers.clear();

      // Clean up element event listeners
      this.elementEventHandlers.forEach((handler, event) => {
        try {
          this.element.removeEventListener(event, handler);
        } catch (error) {
          console.error("Error cleaning up element event listener:", error);
        }
      });
      this.elementEventHandlers.clear();

      // Clean up enhanced features with proper error handling
      if (this.physicsEngine) {
        try {
          this.physicsEngine.removeBody(this.id);
          this.physicsEngine.clear();
          this.physicsEngine = undefined;
        } catch (error) {
          console.error("Error cleaning up physics engine:", error);
        }
      }

      if (this.threeJS) {
        try {
          this.threeJS.dispose();
          this.threeJS = undefined;
        } catch (error) {
          console.error("Error disposing Three.js:", error);
        }
      }

      if (this.gestureHandler) {
        try {
          this.gestureHandler.destroy();
          this.gestureHandler = undefined;
        } catch (error) {
          console.error("Error destroying gesture handler:", error);
        }
      }

      if (this.motionPath) {
        try {
          this.motionPath.destroy();
          this.motionPath = undefined;
        } catch (error) {
          console.error("Error destroying motion path:", error);
        }
      }

      // Reset element optimizations
      if (this.options.willChange && this.element.style) {
        this.element.style.willChange = "auto";
      }
    } catch (error) {
      console.error("Error during animation destruction:", error);
    }
  }

  // Get animation instance
  getInstance(): AnimationInstance {
    return {
      element: this.element,
      timeline: this.timeline,
      options: this.options,
      id: this.id,
      isDestroyed: this.isDestroyed,
      destroy: this.destroy.bind(this),
      play: this.play.bind(this),
      pause: this.pause.bind(this),
      restart: this.restart.bind(this),
      reverse: this.reverse.bind(this),
      progress: this.progress.bind(this),
      setTimeScale: this.setTimeScale.bind(this),
      seek: this.seek.bind(this),
      addLabel: this.addLabel.bind(this),
      gotoAndPlay: this.gotoAndPlay.bind(this),
      gotoAndStop: this.gotoAndStop.bind(this),
    } as AnimationInstance;
  }

  // Utility method to generate unique IDs
  private generateId(): string {
    try {
      return `animation_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
    } catch (error) {
      // Fallback in case of any random generation issues
      return `animation_${Date.now()}_fallback`;
    }
  }

  // Static method to create multiple animations
  static createMultiple<T extends BaseAnimation>(
    this: new (element: HTMLElement, options?: ExtendedAnimationOptions) => T,
    elements: HTMLElement[] | NodeList,
    options: ExtendedAnimationOptions = {}
  ): T[] {
    const elementsArray = Array.from(elements);
    return elementsArray
      .filter(
        (element): element is HTMLElement => element instanceof HTMLElement
      )
      .map((element) => new this(element, options));
  }

  // Static method to destroy multiple animations
  static destroyMultiple(animations: BaseAnimation[]): void {
    animations.forEach((animation) => animation.destroy());
  }
}
