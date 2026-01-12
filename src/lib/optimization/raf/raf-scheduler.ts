/**
 * RequestAnimationFrame Scheduler
 *
 * A high-performance scheduler for animations using requestAnimationFrame.
 * Ensures 60fps smooth animations by batching callbacks and managing timing.
 *
 * @module raf-scheduler
 */

/**
 * Priority levels for scheduled callbacks
 */
export enum RafPriority {
  /** Highest priority - UI updates, critical interactions */
  CRITICAL = 0,
  /** High priority - scroll handlers, input feedback */
  HIGH = 1,
  /** Normal priority - general animations */
  NORMAL = 2,
  /** Low priority - background animations, non-essential updates */
  LOW = 3,
}

/**
 * Scheduled callback with metadata
 */
interface ScheduledCallback {
  /** Callback function to execute */
  callback: () => void;
  /** Priority level for ordering */
  priority: RafPriority;
  /** Unique identifier for the callback */
  id: string;
  /** Whether this is a one-time callback */
  once: boolean;
  /** Timestamp when callback was scheduled */
  scheduledAt: number;
  /** Optional delay before execution */
  delay?: number;
  /** Target execution timestamp */
  executeAt?: number;
}

/**
 * Performance metrics for the scheduler
 */
export interface SchedulerMetrics {
  /** Total frames executed */
  framesExecuted: number;
  /** Total callbacks executed */
  callbacksExecuted: number;
  /** Average frame time in ms */
  avgFrameTime: number;
  /** Current FPS */
  currentFps: number;
  /** Dropped frames count */
  droppedFrames: number;
  /** Last frame timestamp */
  lastFrameTime: number;
}

/**
 * Scheduler configuration options
 */
export interface SchedulerOptions {
  /** Enable debug logging */
  debug?: boolean;
  /** Target FPS (default: 60) */
  targetFps?: number;
  /** Maximum callbacks per frame to prevent blocking */
  maxCallbacksPerFrame?: number;
  /** Enable performance metrics */
  enableMetrics?: boolean;
}

// ============================================================================
// Scheduler Implementation
// ============================================================================

class RafSchedulerClass {
  private callbacks: Map<string, ScheduledCallback> = new Map();
  private rafId: number | null = null;
  private isRunning: boolean = false;
  private pendingExecution: Set<string> = new Set();
  private frameStartTime: number = 0;
  private callbackCounter: number = 0;
  private lastFrameTimestamp: number = 0;
  private fpsFrameCount: number = 0;
  private fpsUpdateTime: number = 0;

  // Metrics
  private metrics: SchedulerMetrics = {
    framesExecuted: 0,
    callbacksExecuted: 0,
    avgFrameTime: 0,
    currentFps: 60,
    droppedFrames: 0,
    lastFrameTime: 0,
  };

  // Configuration
  private config: Required<SchedulerOptions>;

  // FPS calculation
  private frameTimes: number[] = [];
  private readonly FRAME_TIME_BUFFER_SIZE = 60;

  constructor(options: SchedulerOptions = {}) {
    this.config = {
      debug: options.debug ?? false,
      targetFps: options.targetFps ?? 60,
      maxCallbacksPerFrame: options.maxCallbacksPerFrame ?? 100,
      enableMetrics: options.enableMetrics ?? false,
    };

    // Bind methods
    this.tick = this.tick.bind(this);
  }

  /**
   * Schedule a callback to be executed on the next animation frame
   *
   * @param callback - Function to execute
   * @param priority - Priority level (default: NORMAL)
   * @param id - Optional custom ID (auto-generated if not provided)
   * @returns ID for canceling the callback
   */
  schedule(
    callback: () => void,
    priority: RafPriority = RafPriority.NORMAL,
    id?: string
  ): string {
    const callbackId = id ?? `raf_${this.callbackCounter++}`;

    this.callbacks.set(callbackId, {
      callback,
      priority,
      id: callbackId,
      once: true,
      scheduledAt: performance.now(),
    });

    this.start();

    if (this.config.debug) {
      console.log(`[RAF] Scheduled callback: ${callbackId} (priority: ${RafPriority[priority]})`);
    }

    return callbackId;
  }

  /**
   * Schedule a recurring callback
   *
   * @param callback - Function to execute each frame
   * @param priority - Priority level
   * @param id - Optional custom ID
   * @returns ID for canceling the callback
   */
  schedulePersistent(
    callback: () => void,
    priority: RafPriority = RafPriority.NORMAL,
    id?: string
  ): string {
    const callbackId = id ?? `raf_persistent_${this.callbackCounter++}`;

    this.callbacks.set(callbackId, {
      callback,
      priority,
      id: callbackId,
      once: false,
      scheduledAt: performance.now(),
    });

    this.start();

    if (this.config.debug) {
      console.log(`[RAF] Scheduled persistent callback: ${callbackId}`);
    }

    return callbackId;
  }

  /**
   * Schedule a delayed callback
   *
   * @param callback - Function to execute
   * @param delay - Delay in milliseconds
   * @param priority - Priority level
   * @param id - Optional custom ID
   * @returns ID for canceling the callback
   */
  scheduleDelayed(
    callback: () => void,
    delay: number,
    priority: RafPriority = RafPriority.NORMAL,
    id?: string
  ): string {
    const callbackId = id ?? `raf_delayed_${this.callbackCounter++}`;
    const executeAt = performance.now() + delay;

    this.callbacks.set(callbackId, {
      callback,
      priority,
      id: callbackId,
      once: true,
      scheduledAt: performance.now(),
      delay,
      executeAt,
    });

    this.start();

    if (this.config.debug) {
      console.log(`[RAF] Scheduled delayed callback: ${callbackId} (${delay}ms)`);
    }

    return callbackId;
  }

  /**
   * Cancel a scheduled callback
   *
   * @param id - ID of the callback to cancel
   * @returns true if callback was found and removed
   */
  cancel(id: string): boolean {
    const existed = this.callbacks.delete(id);

    if (this.config.debug && existed) {
      console.log(`[RAF] Cancelled callback: ${id}`);
    }

    // Stop if no more callbacks
    if (this.callbacks.size === 0) {
      this.stop();
    }

    return existed;
  }

  /**
   * Cancel all callbacks
   */
  cancelAll(): void {
    this.callbacks.clear();
    this.stop();

    if (this.config.debug) {
      console.log('[RAF] Cancelled all callbacks');
    }
  }

  /**
   * Cancel all callbacks with a specific priority
   */
  cancelByPriority(priority: RafPriority): number {
    let count = 0;

    for (const [id, callback] of this.callbacks) {
      if (callback.priority === priority) {
        this.callbacks.delete(id);
        count++;
      }
    }

    if (this.callbacks.size === 0) {
      this.stop();
    }

    return count;
  }

  /**
   * Check if a callback is scheduled
   */
  has(id: string): boolean {
    return this.callbacks.has(id);
  }

  /**
   * Get the number of scheduled callbacks
   */
  get size(): number {
    return this.callbacks.size;
  }

  /**
   * Check if the scheduler is running
   */
  get running(): boolean {
    return this.isRunning;
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): Readonly<SchedulerMetrics> {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      framesExecuted: 0,
      callbacksExecuted: 0,
      avgFrameTime: 0,
      currentFps: 60,
      droppedFrames: 0,
      lastFrameTime: 0,
    };
    this.frameTimes = [];
    this.fpsFrameCount = 0;
    this.fpsUpdateTime = 0;
  }

  /**
   * Start the scheduler loop
   */
  private start(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastFrameTimestamp = performance.now();
      this.rafId = requestAnimationFrame(this.tick);
    }
  }

  /**
   * Stop the scheduler loop
   */
  private stop(): void {
    if (this.isRunning) {
      this.isRunning = false;
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    }
  }

  /**
   * Main tick function called each frame
   */
  private tick(timestamp: number): void {
    this.frameStartTime = timestamp;

    // Calculate frame time for FPS
    const deltaTime = timestamp - this.lastFrameTimestamp;
    this.lastFrameTimestamp = timestamp;

    // Update FPS calculation
    this.fpsFrameCount++;
    if (timestamp - this.fpsUpdateTime >= 1000) {
      this.metrics.currentFps = Math.round((this.fpsFrameCount * 1000) / (timestamp - this.fpsUpdateTime));
      this.fpsFrameCount = 0;
      this.fpsUpdateTime = timestamp;
    }

    // Store frame time for averaging
    if (this.config.enableMetrics) {
      this.frameTimes.push(deltaTime);
      if (this.frameTimes.length > this.FRAME_TIME_BUFFER_SIZE) {
        this.frameTimes.shift();
      }
      this.metrics.avgFrameTime =
        this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    }

    // Check for dropped frames (target is 16.67ms for 60fps)
    if (deltaTime > (1000 / this.config.targetFps) * 1.5) {
      this.metrics.droppedFrames++;
    }

    // Get callbacks to execute this frame
    const toExecute = this.getCallbacksToExecute(timestamp);

    // Execute callbacks (limited to prevent blocking)
    let executed = 0;
    for (const callback of toExecute) {
      if (executed >= this.config.maxCallbacksPerFrame) {
        break;
      }

      try {
        callback.callback();
        executed++;
      } catch (error) {
        console.error(`[RAF] Error in callback ${callback.id}:`, error);

        // Remove failed callback
        this.callbacks.delete(callback.id);
      }

      // Remove one-time callbacks
      if (callback.once) {
        this.callbacks.delete(callback.id);
      }

      if (this.config.enableMetrics) {
        this.metrics.callbacksExecuted++;
      }
    }

    if (this.config.enableMetrics) {
      this.metrics.framesExecuted++;
    }
    this.metrics.lastFrameTime = timestamp;

    // Continue loop if there are callbacks remaining
    if (this.callbacks.size > 0) {
      this.rafId = requestAnimationFrame(this.tick);
    } else {
      this.isRunning = false;
    }
  }

  /**
   * Get callbacks that should be executed this frame
   */
  private getCallbacksToExecute(timestamp: number): ScheduledCallback[] {
    const now = timestamp;

    // Filter callbacks that are ready to execute
    const readyCallbacks: ScheduledCallback[] = [];

    for (const callback of this.callbacks.values()) {
      // Check delay
      if (callback.executeAt !== undefined && now < callback.executeAt) {
        continue;
      }

      readyCallbacks.push(callback);
    }

    // Sort by priority
    readyCallbacks.sort((a, b) => a.priority - b.priority);

    return readyCallbacks;
  }

  /**
   * Cleanup and destroy the scheduler
   */
  destroy(): void {
    this.cancelAll();
    this.resetMetrics();
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let globalScheduler: RafSchedulerClass | null = null;

/**
 * Get the global RAF scheduler instance
 */
export function getRafScheduler(options?: SchedulerOptions): RafSchedulerClass {
  if (!globalScheduler) {
    globalScheduler = new RafSchedulerClass(options);
  }
  return globalScheduler;
}

/**
 * Reset the global scheduler instance
 */
export function resetRafScheduler(): void {
  if (globalScheduler) {
    globalScheduler.destroy();
    globalScheduler = null;
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Schedule a callback for the next frame
 */
export function raf(
  callback: () => void,
  priority: RafPriority = RafPriority.NORMAL
): () => void {
  const scheduler = getRafScheduler();
  const id = scheduler.schedule(callback, priority);
  return () => scheduler.cancel(id);
}

/**
 * Schedule a persistent frame callback
 */
export function rafLoop(
  callback: () => void,
  priority: RafPriority = RafPriority.NORMAL
): () => void {
  const scheduler = getRafScheduler();
  const id = scheduler.schedulePersistent(callback, priority);
  return () => scheduler.cancel(id);
}

/**
 * Schedule a delayed callback using RAF
 */
export function rafDelay(
  callback: () => void,
  delay: number,
  priority: RafPriority = RafPriority.NORMAL
): () => void {
  const scheduler = getRafScheduler();
  const id = scheduler.scheduleDelayed(callback, delay, priority);
  return () => scheduler.cancel(id);
}

/**
 * Get current scheduler metrics
 */
export function getRafMetrics(): Readonly<SchedulerMetrics> {
  return getRafScheduler().getMetrics();
}

// ============================================================================
// React Hook
// ============================================================================

import { useEffect, useRef, useCallback } from 'react';

/**
 * React hook for using the RAF scheduler
 *
 * @param callback - Function to call each frame
 * @param options - Options including priority and dependencies
 * @returns Function to cancel the callback
 */
export interface UseRafOptions {
  /** Priority level */
  priority?: RafPriority;
  /** Whether to run the callback (default: true) */
  enabled?: boolean;
  /** Delay before starting (ms) */
  startDelay?: number;
}

export function useRaf(
  callback: () => void,
  options: UseRafOptions = {}
): () => void {
  const { priority = RafPriority.NORMAL, enabled = true, startDelay = 0 } = options;

  const callbackRef = useRef(callback);
  const cancelRef = useRef<(() => void) | null>(null);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Setup RAF callback
  useEffect(() => {
    if (!enabled) return;

    const scheduler = getRafScheduler();

    const startRaf = () => {
      const id = scheduler.schedulePersistent(
        () => callbackRef.current(),
        priority,
        `useRaf_${Math.random().toString(36).substr(2, 9)}`
      );
      cancelRef.current = () => scheduler.cancel(id);
    };

    if (startDelay > 0) {
      const timeout = setTimeout(startRaf, startDelay);
      return () => {
        clearTimeout(timeout);
        cancelRef.current?.();
      };
    }

    startRaf();

    return () => {
      cancelRef.current?.();
    };
  }, [enabled, priority, startDelay]);

  // Return cancel function
  return useCallback(() => {
    cancelRef.current?.();
  }, []);
}

/**
 * React hook for a single RAF execution
 *
 * @param callback - Function to call once
 * @param options - Options including priority and delay
 */
export interface UseRafOnceOptions {
  /** Priority level */
  priority?: RafPriority;
  /** Delay before execution (ms) */
  delay?: number;
  /** Dependencies that trigger re-execution */
  deps?: unknown[];
}

export function useRafOnce(
  callback: () => void,
  options: UseRafOnceOptions = {}
): void {
  const { priority = RafPriority.NORMAL, delay = 0, deps = [] } = options;

  useEffect(() => {
    const scheduler = getRafScheduler();

    if (delay > 0) {
      scheduler.scheduleDelayed(callback, delay, priority);
    } else {
      scheduler.schedule(callback, priority);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priority, delay, ...deps]);
}

export { RafSchedulerClass as RafScheduler };
export default getRafScheduler;
