/**
 * Web Worker Factory
 *
 * Factory for creating and managing Web Workers with type safety
 * and automatic cleanup.
 *
 * @module optimization/workers/worker-factory
 */

/**
 * Worker message types
 */
export type WorkerMessage<T = unknown> = {
  id: string;
  type: string;
  data: T;
  timestamp?: number;
};

/**
 * Worker response
 */
export type WorkerResponse<T = unknown> = {
  id: string;
  type: string;
  data?: T;
  error?: Error;
  timestamp: number;
};

/**
 * Worker options
 */
export interface WorkerOptions {
  /** Worker name for debugging */
  name?: string;
  /** Number of retries on failure */
  retries?: number;
  /** Timeout for worker responses (ms) */
  timeout?: number;
  /** Auto-restart on error */
  autoRestart?: boolean;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Worker pool configuration
 */
export interface WorkerPoolOptions {
  /** Number of workers to create */
  size: number;
  /** Maximum tasks per worker before restart */
  maxTasksPerWorker?: number;
  /** Idle timeout before terminating worker (ms) */
  idleTimeout?: number;
}

// ============================================================================
// Worker Wrapper
// ============================================================================

/**
 * Wrapper for a Web Worker with enhanced features
 */
export class WorkerWrapper<TMessage = unknown, TResponse = unknown> {
  public worker: Worker | null = null;
  private pendingRequests = new Map<string, {
    resolve: (value: TResponse) => void;
    reject: (error: Error) => void;
    timeout: ReturnType<typeof setTimeout>;
  }>();
  private messageId = 0;
  private options: Required<WorkerOptions>;
  private taskCount = 0;
  private lastActivity = Date.now();
  private terminated = false;

  constructor(
    private workerScript: string | Blob | URL,
    options: WorkerOptions = {}
  ) {
    this.options = {
      name: options.name ?? `Worker_${Math.random().toString(36).substr(2, 9)}`,
      retries: options.retries ?? 3,
      timeout: options.timeout ?? 30000,
      autoRestart: options.autoRestart ?? true,
      debug: options.debug ?? false,
    };

    this.init();
  }

  private init(): void {
    try {
      if (this.workerScript instanceof URL) {
        this.worker = new Worker(this.workerScript, { name: this.options.name });
      } else {
        const blob = this.workerScript instanceof Blob
          ? this.workerScript
          : new Blob([this.workerScript], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        this.worker = new Worker(url, { name: this.options.name });
      }

      this.worker.onmessage = this.handleMessage.bind(this);
      this.worker.onerror = this.handleError.bind(this);

      if (this.options.debug) {
        console.log(`[WorkerFactory] ${this.options.name} initialized`);
      }
    } catch (error) {
      console.error(`[WorkerFactory] Failed to initialize ${this.options.name}:`, error);
      throw error;
    }
  }

  private handleMessage(event: MessageEvent): void {
    this.lastActivity = Date.now();

    const response = event.data as WorkerResponse<TResponse>;

    if (this.options.debug) {
      console.log(`[WorkerFactory] ${this.options.name} received:`, response);
    }

    const pending = this.pendingRequests.get(response.id);
    if (!pending) return;

    clearTimeout(pending.timeout);
    this.pendingRequests.delete(response.id);

    if (response.error) {
      pending.reject(response.error);
    } else {
      pending.resolve(response.data as TResponse);
    }
  }

  private handleError(event: ErrorEvent): void {
    console.error(`[WorkerFactory] ${this.options.name} error:`, event.message, event);

    if (this.options.autoRestart && !this.terminated) {
      this.restart();
    }
  }

  /**
   * Send a message to the worker
   */
  postMessage(
    type: string,
    data: unknown,
    transferables?: Transferable[]
  ): Promise<TResponse> {
    if (this.terminated) {
      return Promise.reject(new Error('Worker has been terminated'));
    }

    return new Promise((resolve, reject) => {
      const id = `${this.options.name}_${this.messageId++}`;

      const message: WorkerMessage = {
        id,
        type,
        data,
        timestamp: Date.now(),
      };

      if (this.options.debug) {
        console.log(`[WorkerFactory] ${this.options.name} sending:`, message);
      }

      // Set timeout
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Worker timeout after ${this.options.timeout}ms`));
      }, this.options.timeout);

      this.pendingRequests.set(id, { resolve, reject, timeout });

      try {
        this.worker?.postMessage(message, transferables ?? []);
        this.taskCount++;
      } catch (error) {
        clearTimeout(timeout);
        this.pendingRequests.delete(id);
        reject(error);
      }
    });
  }

  /**
   * Check if worker is idle
   */
  isIdle(threshold: number = 30000): boolean {
    return Date.now() - this.lastActivity > threshold;
  }

  /**
   * Get task count
   */
  getTaskCount(): number {
    return this.taskCount;
  }

  /**
   * Restart the worker
   */
  restart(): void {
    if (this.options.debug) {
      console.log(`[WorkerFactory] Restarting ${this.options.name}`);
    }

    this.terminate();
    this.terminated = false;
    this.taskCount = 0;
    this.init();
  }

  /**
   * Terminate the worker
   */
  terminate(): void {
    this.terminated = true;

    // Reject all pending requests
    for (const [id, pending] of this.pendingRequests) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Worker terminated'));
    }
    this.pendingRequests.clear();

    // Terminate worker
    this.worker?.terminate();
    this.worker = null;

    if (this.options.debug) {
      console.log(`[WorkerFactory] ${this.options.name} terminated`);
    }
  }

  /**
   * Check if worker is terminated
   */
  isTerminated(): boolean {
    return this.terminated;
  }
}

// ============================================================================
// Worker Pool
// ============================================================================

/**
 * Pool of workers for parallel processing
 */
export class WorkerPool<TMessage = unknown, TResponse = unknown> {
  private workers: WorkerWrapper<TMessage, TResponse>[] = [];
  private availableWorkers: WorkerWrapper<TMessage, TResponse>[] = [];
  private maxTasksPerWorker: number;
  private idleTimeout: number;
  private taskQueue: Array<{
    task: { type: string; data: unknown; transferables?: Transferable[] };
    resolve: (value: TResponse) => void;
    reject: (error: Error) => void;
  }> = [];
  private processing = false;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    workerScript: string | Blob | URL,
    poolOptions: WorkerPoolOptions,
    workerOptions: WorkerOptions = {}
  ) {
    this.maxTasksPerWorker = poolOptions.maxTasksPerWorker ?? 100;
    this.idleTimeout = poolOptions.idleTimeout ?? 60000;

    // Create workers
    for (let i = 0; i < poolOptions.size; i++) {
      const worker: WorkerWrapper<TMessage, TResponse> = new WorkerWrapper(workerScript, {
        ...workerOptions,
        name: `${workerOptions.name ?? 'Worker'}_${i}`,
      });
      this.workers.push(worker);
      this.availableWorkers.push(worker);
    }

    // Start processing
    this.startProcessing();
  }

  /**
   * Execute a task using an available worker
   */
  async execute(
    type: string,
    data: unknown,
    transferables?: Transferable[]
  ): Promise<TResponse> {
    return new Promise((resolve, reject) => {
      this.taskQueue.push({ task: { type, data, transferables }, resolve, reject });
      this.processQueue();
    });
  }

  /**
   * Process the task queue
   */
  private processQueue(): void {
    if (this.processing || this.taskQueue.length === 0) return;

    this.processing = true;

    while (this.taskQueue.length > 0 && this.availableWorkers.length > 0) {
      const { task, resolve, reject } = this.taskQueue.shift()!;
      const worker = this.availableWorkers.shift()!;

      worker
        .postMessage(task.type, task.data, task.transferables)
        .then(resolve)
        .catch(reject)
        .finally(() => {
          // Check if worker should be restarted
          if (worker.getTaskCount() >= this.maxTasksPerWorker) {
            worker.restart();
          }

          // Return worker to pool
          this.availableWorkers.push(worker);
          this.processQueue();
        });
    }

    this.processing = false;

    // Set idle timer if no tasks
    if (this.taskQueue.length === 0) {
      this.setIdleTimer();
    }
  }

  /**
   * Start background processing
   */
  private startProcessing(): void {
    setInterval(() => {
      this.processQueue();

      // Check for idle workers
      for (const worker of this.workers) {
        if (worker.isIdle(this.idleTimeout) && this.taskQueue.length === 0) {
          worker.terminate();
        }
      }
    }, 1000);
  }

  /**
   * Set idle timer for pool cleanup
   */
  private setIdleTimer(): void {
    if (this.idleTimer !== null) {
      clearTimeout(this.idleTimer);
    }

    this.idleTimer = setTimeout(() => {
      if (this.taskQueue.length === 0) {
        // Could terminate idle workers here
      }
    }, this.idleTimeout);
  }

  /**
   * Terminate all workers
   */
  terminate(): void {
    for (const worker of this.workers) {
      worker.terminate();
    }
    this.workers = [];
    this.availableWorkers = [];
    this.taskQueue = [];

    if (this.idleTimer !== null) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      totalWorkers: this.workers.length,
      availableWorkers: this.availableWorkers.length,
      queuedTasks: this.taskQueue.length,
      totalTasksProcessed: this.workers.reduce((sum, w) => sum + w.getTaskCount(), 0),
    };
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a single worker
 */
export function createWorker<TMessage = unknown, TResponse = unknown>(
  workerScript: string | Blob | URL,
  options?: WorkerOptions
): WorkerWrapper<TMessage, TResponse> {
  return new WorkerWrapper(workerScript, options);
}

/**
 * Create a pool of workers
 */
export function createWorkerPool<TMessage = unknown, TResponse = unknown>(
  workerScript: string | Blob | URL,
  poolSize: number | WorkerPoolOptions,
  workerOptions?: WorkerOptions
): WorkerPool<TMessage, TResponse> {
  const poolOptions = typeof poolSize === 'number'
    ? { size: poolSize }
    : poolSize;

  return new WorkerPool(workerScript, poolOptions, workerOptions);
}

/**
 * Create a worker from a function
 *
 * Converts a function to a worker script string.
 */
export function createWorkerFromFunction(
  fn: (...args: unknown[]) => unknown,
  options?: WorkerOptions
): WorkerWrapper {
  const fnString = fn.toString();

  const script = `
    self.onmessage = function(e) {
      const { id, type, data } = e.data;

      try {
        const fn = ${fnString};
        const result = fn(data);

        // Handle promises
        if (result && typeof result.then === 'function') {
          result
            .then(value => {
              self.postMessage({ id, type, data: value, timestamp: Date.now() });
            })
            .catch(error => {
              self.postMessage({ id, type, error, timestamp: Date.now() });
            });
        } else {
          self.postMessage({ id, type, data: result, timestamp: Date.now() });
        }
      } catch (error) {
        self.postMessage({ id, type, error: error.message, timestamp: Date.now() });
      }
    };
  `;

  return createWorker(script, options);
}

export default createWorker;
