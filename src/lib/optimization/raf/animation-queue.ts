/**
 * Animation Queue System
 *
 * A priority-based queue for managing and coordinating animations.
 * Ensures smooth performance by limiting concurrent animations and
 * prioritizing critical interactions.
 *
 * @module animation-queue
 */

import React from 'react';
import { getRafScheduler, RafPriority } from './raf-scheduler';

/**
 * Animation states
 */
export enum AnimationState {
  /** Animation is waiting to start */
  PENDING = 'pending',
  /** Animation is currently running */
  RUNNING = 'running',
  /** Animation is paused */
  PAUSED = 'paused',
  /** Animation completed successfully */
  COMPLETED = 'completed',
  /** Animation was cancelled */
  CANCELLED = 'cancelled',
  /** Animation encountered an error */
  ERROR = 'error',
}

/**
 * Animation priority levels
 */
export enum AnimationPriority {
  /** Critical - user interactions, gestures */
  CRITICAL = 0,
  /** High - page transitions, important animations */
  HIGH = 1,
  /** Normal - standard UI animations */
  NORMAL = 2,
  /** Low - background animations, decorative */
  LOW = 3,
  /** Idle - only run when nothing else is queued */
  IDLE = 4,
}

/**
 * Animation job interface
 */
export interface AnimationJob {
  /** Unique identifier */
  id: string;
  /** Animation function */
  animation: (signal: AnimationSignal) => Promise<void> | void;
  /** Priority level */
  priority: AnimationPriority;
  /** Current state */
  state: AnimationState;
  /** Time when animation was queued */
  queuedAt: number;
  /** Time when animation started */
  startedAt?: number;
  /** Time when animation ended */
  endedAt?: number;
  /** Animation duration estimate (ms) */
  duration?: number;
  /** Abort controller for cancellation */
  controller: AbortController;
  /** Maximum concurrent animations for this job */
  maxConcurrent?: number;
  /** Tag for grouping related animations */
  tag?: string;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Callback when animation errors */
  onError?: (error: Error) => void;
  /** Callback when animation is cancelled */
  onCancel?: () => void;
}

/**
 * Signal passed to animations for control
 */
export interface AnimationSignal {
  /** Read-only aborted state */
  readonly aborted: boolean;
  /** Promise that resolves when aborted */
  readonly onAbort: Promise<void>;
  /** Current progress (0-1) */
  progress: number;
}

/**
 * Queue statistics
 */
export interface QueueStats {
  /** Total jobs in queue */
  total: number;
  /** Jobs by state */
  byState: Record<AnimationState, number>;
  /** Jobs by priority */
  byPriority: Record<AnimationPriority, number>;
  /** Currently running jobs */
  running: number;
  /** Average wait time (ms) */
  avgWaitTime: number;
  /** Average execution time (ms) */
  avgExecutionTime: number;
  /** Total jobs completed */
  completed: number;
  /** Total jobs cancelled */
  cancelled: number;
}

/**
 * Queue configuration options
 */
export interface QueueOptions {
  /** Maximum concurrent animations (default: 4) */
  maxConcurrent?: number;
  /** Maximum queue size (default: 100) */
  maxQueueSize?: number;
  /** Enable debug logging */
  debug?: boolean;
  /** Timeout for animations (ms) */
  timeout?: number;
}

// ============================================================================
// Animation Queue Implementation
// ============================================================================

class AnimationQueueClass {
  private queue: Map<string, AnimationJob> = new Map();
  private running: Set<string> = new Set();
  private maxConcurrent: number;
  private maxQueueSize: number;
  private debug: boolean;
  private timeout: number;
  private jobCounter: number = 0;
  private processing: boolean = false;

  // Statistics
  private stats: QueueStats = {
    total: 0,
    byState: {
      pending: 0,
      running: 0,
      paused: 0,
      completed: 0,
      cancelled: 0,
      error: 0,
    },
    byPriority: {
      [AnimationPriority.CRITICAL]: 0,
      [AnimationPriority.HIGH]: 0,
      [AnimationPriority.NORMAL]: 0,
      [AnimationPriority.LOW]: 0,
      [AnimationPriority.IDLE]: 0,
    },
    running: 0,
    avgWaitTime: 0,
    avgExecutionTime: 0,
    completed: 0,
    cancelled: 0,
  };

  // Timing history for averages
  private waitTimes: number[] = [];
  private executionTimes: number[] = [];
  private readonly HISTORY_SIZE = 50;

  constructor(options: QueueOptions = {}) {
    this.maxConcurrent = options.maxConcurrent ?? 4;
    this.maxQueueSize = options.maxQueueSize ?? 100;
    this.debug = options.debug ?? false;
    this.timeout = options.timeout ?? 30000; // 30s default

    // Start processing loop
    this.startProcessing();
  }

  /**
   * Add an animation to the queue
   *
   * @param animation - Animation function
   * @param options - Queue options
   * @returns Job ID
   */
  add(
    animation: AnimationJob['animation'],
    options: {
      priority?: AnimationPriority;
      duration?: number;
      tag?: string;
      onComplete?: () => void;
      onError?: (error: Error) => void;
      onCancel?: () => void;
      id?: string;
    } = {}
  ): string {
    // Check queue size
    if (this.queue.size >= this.maxQueueSize) {
      throw new Error(`Animation queue is full (${this.maxQueueSize} max)`);
    }

    const {
      priority = AnimationPriority.NORMAL,
      duration,
      tag,
      onComplete,
      onError,
      onCancel,
      id,
    } = options;

    const jobId = id ?? `anim_${this.jobCounter++}`;

    const job: AnimationJob = {
      id: jobId,
      animation,
      priority,
      state: AnimationState.PENDING,
      queuedAt: performance.now(),
      duration,
      controller: new AbortController(),
      tag,
      onComplete,
      onError,
      onCancel,
    };

    this.queue.set(jobId, job);
    this.updateStats();

    if (this.debug) {
      console.log(`[AnimQueue] Added job: ${jobId} (priority: ${AnimationPriority[priority]}, tag: ${tag})`);
    }

    // Trigger processing
    this.process();

    return jobId;
  }

  /**
   * Add multiple animations as a batch
   *
   * @param animations - Array of animation configs
   * @returns Array of job IDs
   */
  addBatch(
    animations: Array<{
      animation: AnimationJob['animation'];
      priority?: AnimationPriority;
      duration?: number;
      tag?: string;
    }>
  ): string[] {
    const ids: string[] = [];

    for (const config of animations) {
      const id = this.add(config.animation, config);
      ids.push(id);
    }

    return ids;
  }

  /**
   * Cancel an animation
   */
  cancel(id: string): boolean {
    const job = this.queue.get(id);
    if (!job) return false;

    const wasRunning = job.state === AnimationState.RUNNING;

    job.controller.abort();
    job.state = AnimationState.CANCELLED;
    job.endedAt = performance.now();

    if (wasRunning) {
      this.running.delete(id);
    }

    job.onCancel?.();

    if (this.debug) {
      console.log(`[AnimQueue] Cancelled job: ${id}`);
    }

    this.updateStats();
    this.queue.delete(id);

    return true;
  }

  /**
   * Cancel all animations with a specific tag
   */
  cancelByTag(tag: string): number {
    let count = 0;

    for (const [id, job] of this.queue) {
      if (job.tag === tag) {
        this.cancel(id);
        count++;
      }
    }

    return count;
  }

  /**
   * Cancel all pending animations
   */
  cancelAll(): void {
    for (const id of this.queue.keys()) {
      this.cancel(id);
    }
  }

  /**
   * Pause an animation (sets state to paused)
   */
  pause(id: string): boolean {
    const job = this.queue.get(id);
    if (!job) return false;

    if (job.state === AnimationState.RUNNING) {
      job.state = AnimationState.PAUSED;
      job.controller.abort();
      this.running.delete(id);
      return true;
    }

    return false;
  }

  /**
   * Resume a paused animation
   */
  resume(id: string): boolean {
    const job = this.queue.get(id);
    if (!job || job.state !== AnimationState.PAUSED) return false;

    job.state = AnimationState.PENDING;
    job.controller = new AbortController();

    this.process();

    return true;
  }

  /**
   * Get job status
   */
  getStatus(id: string): AnimationJob | undefined {
    return this.queue.get(id);
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    return { ...this.stats };
  }

  /**
   * Check if queue is empty
   */
  get isEmpty(): boolean {
    return this.queue.size === 0;
  }

  /**
   * Get number of running jobs
   */
  get runningCount(): number {
    return this.running.size;
  }

  /**
   * Start the processing loop
   */
  private startProcessing(): void {
    if (this.processing) return;

    this.processing = true;
    const raf = getRafScheduler();

    const processLoop = () => {
      this.process();

      if (!this.isEmpty || this.running.size > 0) {
        raf.schedule(processLoop, RafPriority.HIGH);
      } else {
        this.processing = false;
      }
    };

    raf.schedule(processLoop, RafPriority.HIGH);
  }

  /**
   * Process the queue and start jobs
   */
  private process(): void {
    if (this.running.size >= this.maxConcurrent) {
      return; // At capacity
    }

    // Get pending jobs sorted by priority
    const pendingJobs = Array.from(this.queue.values())
      .filter(job => job.state === AnimationState.PENDING)
      .sort((a, b) => {
        // First by priority
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        // Then by queue time (FIFO within same priority)
        return a.queuedAt - b.queuedAt;
      });

    // Start jobs until capacity is reached
    const availableSlots = this.maxConcurrent - this.running.size;

    for (let i = 0; i < Math.min(availableSlots, pendingJobs.length); i++) {
      const job = pendingJobs[i];
      this.startJob(job);
    }
  }

  /**
   * Start an animation job
   */
  private startJob(job: AnimationJob): void {
    job.state = AnimationState.RUNNING;
    job.startedAt = performance.now();
    this.running.add(job.id);

    // Calculate wait time
    const waitTime = job.startedAt - job.queuedAt;
    this.waitTimes.push(waitTime);
    if (this.waitTimes.length > this.HISTORY_SIZE) {
      this.waitTimes.shift();
    }

    if (this.debug) {
      console.log(`[AnimQueue] Starting job: ${job.id} (waited: ${waitTime.toFixed(1)}ms)`);
    }

    // Create signal for the animation
    const signal: AnimationSignal = {
      get aborted(): boolean {
        return job.controller.signal.aborted;
      },
      get onAbort(): Promise<void> {
        return new Promise<void>(resolve => {
          if (job.controller.signal.aborted) {
            resolve();
            return;
          }
          const handler = (): void => {
            job.controller.signal.removeEventListener('abort', handler);
            resolve();
          };
          job.controller.signal.addEventListener('abort', handler);
        });
      },
      progress: 0,
    };

    // Run the animation
    Promise.resolve()
      .then(() => {
        // Set timeout
        const timeoutId = setTimeout(() => {
          if (!job.controller.signal.aborted) {
            job.controller.abort();
            this.handleError(job, new Error(`Animation timeout (${this.timeout}ms)`));
          }
        }, this.timeout);

        // Run animation
        return Promise.resolve(job.animation(signal))
          .finally(() => clearTimeout(timeoutId));
      })
      .then(() => {
        if (!job.controller.signal.aborted) {
          this.completeJob(job);
        }
      })
      .catch(error => {
        if (!job.controller.signal.aborted) {
          this.handleError(job, error);
        }
      })
      .finally(() => {
        this.running.delete(job.id);
        this.updateStats();
        this.process(); // Start next jobs
      });
  }

  /**
   * Mark a job as completed
   */
  private completeJob(job: AnimationJob): void {
    job.state = AnimationState.COMPLETED;
    job.endedAt = performance.now();

    const executionTime = job.endedAt - (job.startedAt ?? job.endedAt);
    this.executionTimes.push(executionTime);
    if (this.executionTimes.length > this.HISTORY_SIZE) {
      this.executionTimes.shift();
    }

    this.stats.completed++;
    job.onComplete?.();

    if (this.debug) {
      console.log(`[AnimQueue] Completed job: ${job.id} (${executionTime.toFixed(1)}ms)`);
    }

    this.queue.delete(job.id);
  }

  /**
   * Handle animation error
   */
  private handleError(job: AnimationJob, error: unknown): void {
    job.state = AnimationState.ERROR;
    job.endedAt = performance.now();

    const err = error instanceof Error ? error : new Error(String(error));
    job.onError?.(err);

    console.error(`[AnimQueue] Error in job ${job.id}:`, err);

    this.queue.delete(job.id);
  }

  /**
   * Update queue statistics
   */
  private updateStats(): void {
    this.stats.total = this.queue.size;
    this.stats.running = this.running.size;

    // Count by state
    for (const state of Object.values(AnimationState)) {
      this.stats.byState[state as AnimationState] = 0;
    }
    for (const job of this.queue.values()) {
      this.stats.byState[job.state]++;
    }

    // Count by priority
    for (const priority of Object.values(AnimationPriority)) {
      this.stats.byPriority[priority as AnimationPriority] = 0;
    }
    for (const job of this.queue.values()) {
      this.stats.byPriority[job.priority]++;
    }

    // Calculate averages
    if (this.waitTimes.length > 0) {
      this.stats.avgWaitTime =
        this.waitTimes.reduce((a, b) => a + b, 0) / this.waitTimes.length;
    }
    if (this.executionTimes.length > 0) {
      this.stats.avgExecutionTime =
        this.executionTimes.reduce((a, b) => a + b, 0) / this.executionTimes.length;
    }
  }

  /**
   * Cleanup and destroy the queue
   */
  destroy(): void {
    this.cancelAll();
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let globalQueue: AnimationQueueClass | null = null;

/**
 * Get the global animation queue
 */
export function getAnimationQueue(options?: QueueOptions): AnimationQueueClass {
  if (!globalQueue) {
    globalQueue = new AnimationQueueClass(options);
  }
  return globalQueue;
}

/**
 * Reset the global queue
 */
export function resetAnimationQueue(): void {
  if (globalQueue) {
    globalQueue.destroy();
    globalQueue = null;
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Add an animation to the queue
 */
export function queueAnimation(
  animation: AnimationJob['animation'],
  options: {
    priority?: AnimationPriority;
    duration?: number;
    tag?: string;
  } = {}
): string {
  return getAnimationQueue().add(animation, options);
}

/**
 * Cancel an animation by ID
 */
export function cancelAnimation(id: string): boolean {
  return getAnimationQueue().cancel(id);
}

/**
 * Cancel all animations with a tag
 */
export function cancelAnimationsByTag(tag: string): number {
  return getAnimationQueue().cancelByTag(tag);
}

/**
 * Get queue stats
 */
export function getQueueStats(): QueueStats {
  return getAnimationQueue().getStats();
}

// ============================================================================
// React Hooks
// ============================================================================

import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook for queueing animations
 *
 * @param animation - Animation function
 * @param options - Queue options and dependencies
 * @returns Control functions
 */
export interface UseQueueAnimationOptions {
  /** Animation priority */
  priority?: AnimationPriority;
  /** Estimated duration */
  duration?: number;
  /** Tag for grouping */
  tag?: string;
  /** Whether to auto-start */
  enabled?: boolean;
  /** Callback on complete */
  onComplete?: () => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Callback on cancel */
  onCancel?: () => void;
}

export interface QueueAnimationControl {
  /** Start the animation */
  start: () => void;
  /** Cancel the animation */
  cancel: () => void;
  /** Current job ID */
  jobId: string | null;
  /** Current job state */
  state: AnimationState | null;
}

export function useQueueAnimation(
  animation: (signal: AnimationSignal) => Promise<void> | void,
  options: UseQueueAnimationOptions = {}
): QueueAnimationControl {
  const {
    priority = AnimationPriority.NORMAL,
    duration,
    tag,
    enabled = true,
    onComplete,
    onError,
    onCancel,
  } = options;

  const animationRef = useRef(animation);
  const jobIdRef = useRef<string | null>(null);
  const stateRef = useRef<AnimationState | null>(null);

  // Keep animation ref updated
  useEffect(() => {
    animationRef.current = animation;
  }, [animation]);

  // Start animation when enabled
  useEffect(() => {
    if (!enabled) return;

    const queue = getAnimationQueue();
    const jobId = queue.add(
      (signal) => animationRef.current(signal),
      { priority, duration, tag, onComplete, onError, onCancel }
    );

    jobIdRef.current = jobId;
    stateRef.current = AnimationState.PENDING;

    // Monitor state changes
    const checkState = setInterval(() => {
      const job = queue.getStatus(jobId);
      if (job) {
        stateRef.current = job.state;
      }
    }, 100);

    return () => {
      clearInterval(checkState);
      queue.cancel(jobId);
      jobIdRef.current = null;
      stateRef.current = null;
    };
  }, [enabled, priority, duration, tag, onComplete, onError, onCancel]);

  const start = useCallback(() => {
    if (jobIdRef.current) {
      getAnimationQueue().resume(jobIdRef.current);
    }
  }, []);

  const cancel = useCallback(() => {
    if (jobIdRef.current) {
      getAnimationQueue().cancel(jobIdRef.current);
      jobIdRef.current = null;
      stateRef.current = null;
    }
  }, []);

  return {
    start,
    cancel,
    jobId: jobIdRef.current,
    state: stateRef.current,
  };
}

/**
 * Hook for getting queue stats
 */
export function useQueueStats(): QueueStats {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  const statsRef = useRef<QueueStats>(getQueueStats());

  useEffect(() => {
    const interval = setInterval(() => {
      statsRef.current = getQueueStats();
      forceUpdate();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return statsRef.current;
}

export { AnimationQueueClass as AnimationQueue };
export default getAnimationQueue;
