/**
 * React Hook for Web Workers
 *
 * React hooks for using Web Workers with type safety
 * and automatic cleanup.
 *
 * @module optimization/workers/use-worker
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { createWorker, createWorkerPool, WorkerWrapper, WorkerPool } from './worker-factory';
import type { WorkerMessage, WorkerResponse } from './worker-factory';

// ============================================================================
// Types
// ============================================================================

export interface UseWorkerOptions {
  /** Worker name for debugging */
  name?: string;
  /** Auto-restart on error */
  autoRestart?: boolean;
  /** Enable debug logging */
  debug?: boolean;
  /** Timeout for responses (ms) */
  timeout?: number;
}

export interface UseWorkerPoolOptions {
  /** Number of workers in the pool */
  size: number;
  /** Maximum tasks per worker before restart */
  maxTasksPerWorker?: number;
  /** Idle timeout (ms) */
  idleTimeout?: number;
}

export interface WorkerState<T = unknown> {
  /** Current data being processed */
  data: T | null;
  /** Whether worker is busy */
  busy: boolean;
  /** Last error from worker */
  error: Error | null;
  /** Number of tasks completed */
  completed: number;
}

export interface WorkerTaskResult<T = unknown> {
  /** Result data */
  data: T | null;
  /** Whether task is in progress */
  loading: boolean;
  /** Error if task failed */
  error: Error | null;
  /** Execute the task */
  execute: (...args: unknown[]) => Promise<T>;
  /** Cancel current task */
  cancel: () => void;
}

// ============================================================================
// useWorker Hook
// ============================================================================

/**
 * React hook for using a Web Worker
 *
 * @param workerScript - Worker script as string, Blob, or URL
 * @param options - Worker options
 * @returns Worker control object
 */
export function useWorker<TMessage = unknown, TResponse = unknown>(
  workerScript: string | Blob | URL,
  options: UseWorkerOptions = {}
) {
  const workerRef = useRef<WorkerWrapper<TMessage, TResponse> | null>(null);
  const [state, setState] = useState<WorkerState<TResponse>>({
    data: null,
    busy: false,
    error: null,
    completed: 0,
  });

  // Initialize worker
  useEffect(() => {
    workerRef.current = createWorker<TMessage, TResponse>(workerScript, {
      ...options,
      name: options.name ?? 'useWorker',
    });

    return () => {
      workerRef.current?.terminate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Post a message to the worker
   */
  const postMessage = useCallback(
    (type: string, data: TMessage, transferables?: Transferable[]): Promise<TResponse> => {
      if (!workerRef.current) {
        return Promise.reject(new Error('Worker not initialized'));
      }

      setState(prev => ({ ...prev, busy: true, error: null }));

      return workerRef.current
        .postMessage(type, data, transferables)
        .then(result => {
          setState(prev => ({
            ...prev,
            data: result,
            busy: false,
            completed: prev.completed + 1,
          }));
          return result;
        })
        .catch(error => {
          setState(prev => ({
            ...prev,
            busy: false,
            error: error as Error,
          }));
          throw error;
        });
    },
    []
  );

  /**
   * Terminate the worker
   */
  const terminate = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  /**
   * Restart the worker
   */
  const restart = useCallback(() => {
    workerRef.current?.restart();
  }, []);

  return {
    /** Current worker state */
    state,
    /** Post a message to the worker */
    postMessage,
    /** Terminate the worker */
    terminate,
    /** Restart the worker */
    restart,
    /** Check if worker is busy */
    isBusy: state.busy,
    /** Get completed task count */
    completed: state.completed,
  };
}

// ============================================================================
// useWorkerPool Hook
// ============================================================================

/**
 * React hook for using a pool of Web Workers
 *
 * @param workerScript - Worker script as string, Blob, or URL
 * @param poolOptions - Pool configuration options
 * @param workerOptions - Individual worker options
 * @returns Pool control object
 */
export function useWorkerPool<TMessage = unknown, TResponse = unknown>(
  workerScript: string | Blob | URL,
  poolOptions: UseWorkerPoolOptions,
  workerOptions?: Omit<UseWorkerOptions, 'name'>
) {
  const poolRef = useRef<WorkerPool<TMessage, TResponse> | null>(null);
  const [stats, setStats] = useState(() => poolRef.current?.getStats() ?? null);

  // Initialize pool
  useEffect(() => {
    poolRef.current = createWorkerPool<TMessage, TResponse>(
      workerScript,
      poolOptions,
      {
        ...workerOptions,
        name: 'useWorkerPool',
      }
    );

    // Update stats periodically
    const interval = setInterval(() => {
      if (poolRef.current) {
        setStats(poolRef.current.getStats());
      }
    }, 500);

    return () => {
      clearInterval(interval);
      poolRef.current?.terminate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolOptions.size]);

  /**
   * Execute a task using the pool
   */
  const execute = useCallback(
    (type: string, data: TMessage, transferables?: Transferable[]): Promise<TResponse> => {
      if (!poolRef.current) {
        return Promise.reject(new Error('Worker pool not initialized'));
      }

      return poolRef.current.execute(type, data, transferables);
    },
    []
  );

  /**
   * Terminate all workers
   */
  const terminate = useCallback(() => {
    poolRef.current?.terminate();
    poolRef.current = null;
  }, []);

  return {
    /** Pool statistics */
    stats: stats ?? { totalWorkers: 0, availableWorkers: 0, queuedTasks: 0, totalTasksProcessed: 0 },
    /** Execute a task */
    execute,
    /** Terminate the pool */
    terminate,
  };
}

// ============================================================================
// useWorkerTask Hook
// ============================================================================

/**
 * React hook for executing a single task in a worker
 *
 * @param workerScript - Worker script as string, Blob, or URL
 * @param messageType - Message type to send
 * @returns Task execution control
 */
export function useWorkerTask<TMessage = unknown, TResponse = unknown>(
  workerScript: string | Blob | URL,
  messageType: string,
  options: UseWorkerOptions = {}
): WorkerTaskResult<TResponse> {
  const { postMessage, state } = useWorker<TMessage, TResponse>(workerScript, options);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    (taskData: TMessage): Promise<TResponse> => {
      // Cancel previous task
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      return postMessage(messageType, taskData)
        .then(result => {
          setData(result);
          setLoading(false);
          return result;
        })
        .catch(err => {
          const errorObj = err instanceof Error ? err : new Error(String(err));
          setError(errorObj);
          setLoading(false);
          throw errorObj;
        });
    },
    [messageType, postMessage]
  );

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute: ((...args: unknown[]) => execute(args[0] as TMessage)) as (...args: unknown[]) => Promise<TResponse>,
    cancel,
  };
}

// ============================================================================
// useWorkerValue Hook
// ============================================================================

/**
 * React hook for maintaining a value computed by a worker
 *
 * Similar to useMemo but computation happens in a worker.
 *
 * @param workerScript - Worker script
 * @param messageType - Message type
 * @param inputData - Input data to process
 * @param options - Worker options
 * @returns Computed value and loading state
 */
export function useWorkerValue<TMessage = unknown, TResponse = unknown>(
  workerScript: string | Blob | URL,
  messageType: string,
  inputData: TMessage | null,
  options: UseWorkerOptions = {}
): { value: TResponse | null; loading: boolean; error: Error | null } {
  const { postMessage, state } = useWorker<TMessage, TResponse>(workerScript, options);
  const [value, setValue] = useState<TResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (inputData === null) return;

    setLoading(true);
    setError(null);

    postMessage(messageType, inputData)
      .then(result => {
        setValue(result);
        setLoading(false);
      })
      .catch(err => {
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      });
  }, [inputData, messageType, postMessage]);

  return { value, loading, error };
}

// ============================================================================
// useDataWorker Hook (Specialized for Data Processing)
// ============================================================================

import { DATA_WORKER_SCRIPT } from './data-worker';
import type {
  DataWorkerMessage,
  DataWorkerResponse,
  FilterOperation,
  SortOperation,
  AggregateOperation,
  MarketFilters,
  MarketSortBy,
  PaginationResult,
} from './data-worker';

/**
 * React hook for the data processing worker
 *
 * Provides convenient methods for common data operations.
 */
export function useDataWorker(options: UseWorkerOptions = {}) {
  const { postMessage, state, ...rest } = useWorker<unknown, unknown>(
    new Blob([DATA_WORKER_SCRIPT], { type: 'application/javascript' }),
    { ...options, name: 'DataWorker' }
  );

  /**
   * Filter an array of items
   */
  const filter = useCallback(
    <T = unknown>(items: T[], operation: FilterOperation): Promise<T[]> => {
      return postMessage('filter', { items, ...operation }) as Promise<T[]>;
    },
    [postMessage]
  );

  /**
   * Sort an array of items
   */
  const sort = useCallback(
    <T = unknown>(items: T[], sortBy: string, order: 'asc' | 'desc' = 'desc'): Promise<T[]> => {
      return postMessage('sort', { items, sortBy, order }) as Promise<T[]>;
    },
    [postMessage]
  );

  /**
   * Aggregate data
   */
  const aggregate = useCallback(
    <T = unknown>(items: T[], operations: AggregateOperation[]): Promise<Record<string, unknown>> => {
      return postMessage('aggregate', { items, operations }) as Promise<Record<string, unknown>>;
    },
    [postMessage]
  );

  /**
   * Group data by a field
   */
  const group = useCallback(
    <T = unknown>(
      items: T[],
      groupBy: string,
      aggregateOps?: AggregateOperation[]
    ): Promise<unknown[]> => {
      return postMessage('group', { items, groupBy, aggregate: aggregateOps }) as Promise<unknown[]>;
    },
    [postMessage]
  );

  /**
   * Search items
   */
  const search = useCallback(
    <T = unknown>(
      items: T[],
      query: string,
      searchFields?: string[],
      fuzzy?: boolean
    ): Promise<T[]> => {
      return postMessage('search', { items, query, fields: searchFields, fuzzy }) as Promise<T[]>;
    },
    [postMessage]
  );

  /**
   * Paginate items
   */
  const paginate = useCallback(
    <T = unknown>(
      items: T[],
      page: number,
      pageSize: number
    ): Promise<PaginationResult<T>> => {
      return postMessage('paginate', { items, page, pageSize }) as Promise<PaginationResult<T>>;
    },
    [postMessage]
  );

  /**
   * Filter markets
   */
  const filterMarkets = useCallback(
    <T = unknown>(markets: T[], filters: MarketFilters): Promise<T[]> => {
      return postMessage('marketFilter', { markets, filters }) as Promise<T[]>;
    },
    [postMessage]
  );

  /**
   * Sort markets
   */
  const sortMarkets = useCallback(
    <T = unknown>(
      markets: T[],
      sortBy: MarketSortBy,
      order: 'asc' | 'desc' = 'desc'
    ): Promise<T[]> => {
      return postMessage('marketSort', { markets, sortBy, order }) as Promise<T[]>;
    },
    [postMessage]
  );

  /**
   * Aggregate markets
   */
  const aggregateMarkets = useCallback(
    <T = unknown>(markets: T[], groupBy?: string): Promise<unknown[]> => {
      return postMessage('marketAggregate', { markets, groupBy }) as Promise<unknown[]>;
    },
    [postMessage]
  );

  return {
    ...rest,
    state,
    filter,
    sort,
    aggregate,
    group,
    search,
    paginate,
    filterMarkets,
    sortMarkets,
    aggregateMarkets,
  };
}

// ============================================================================
// useWorkerFn Hook
// ============================================================================

/**
 * Execute a function in a Web Worker
 *
 * The function is serialized and run in a worker context.
 *
 * @param fn - Function to execute in worker
 * @param options - Worker options
 * @returns Function that runs the computation in a worker
 */
export function useWorkerFn<TArgs extends unknown[] = unknown[], TResult = unknown>(
  fn: (...args: TArgs) => TResult,
  options: UseWorkerOptions = {}
): {
  /** Execute the function in a worker */
  execute: (...args: TArgs) => Promise<TResult>;
  /** Current execution state */
  state: WorkerState<TResult>;
} {
  const workerRef = useRef<WorkerWrapper | null>(null);

  useEffect(() => {
    // Create worker from function
    const fnString = fn.toString();
    const script = `
      self.onmessage = function(e) {
        const { id, args } = e.data;
        try {
          const fn = ${fnString};
          const result = fn(...args);

          // Handle promises
          if (result && typeof result.then === 'function') {
            result
              .then(value => self.postMessage({ id, result: value }))
              .catch(error => self.postMessage({ id, error: error.message }));
          } else {
            self.postMessage({ id, result });
          }
        } catch (error) {
          self.postMessage({ id, error: error.message });
        }
      };
    `;

    workerRef.current = createWorker(
      new Blob([script], { type: 'application/javascript' }),
      { ...options, name: 'useWorkerFn' }
    );

    return () => {
      workerRef.current?.terminate();
    };
    // Only create on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [state, setState] = useState<WorkerState<TResult>>({
    data: null,
    busy: false,
    error: null,
    completed: 0,
  });

  const execute = useCallback(
    (...args: TArgs): Promise<TResult> => {
      if (!workerRef.current) {
        return Promise.reject(new Error('Worker not initialized'));
      }

      setState(prev => ({ ...prev, busy: true, error: null }));

      return new Promise<TResult>((resolve, reject) => {
        const id = Math.random().toString(36).substr(2, 9);

        const timeout = setTimeout(() => {
          reject(new Error('Worker timeout'));
          setState(prev => ({ ...prev, busy: false, error: new Error('Worker timeout') }));
        }, options.timeout ?? 30000);

        const handleMessage = (e: MessageEvent) => {
          if (e.data.id === id) {
            clearTimeout(timeout);
            workerRef.current?.worker?.removeEventListener('message', handleMessage);

            if (e.data.error) {
              const error = new Error(e.data.error);
              setState(prev => ({ ...prev, busy: false, error }));
              reject(error);
            } else {
              setState(prev => ({
                ...prev,
                data: e.data.result,
                busy: false,
                completed: prev.completed + 1,
              }));
              resolve(e.data.result);
            }
          }
        };

        workerRef.current?.worker?.addEventListener('message', handleMessage);
        workerRef.current?.worker?.postMessage({ id, args });
      });
    },
    [options.timeout]
  );

  return { execute, state };
}

export {
  createWorker,
  createWorkerPool,
};

export type {
  WorkerMessage,
  WorkerResponse,
};

export default useWorker;
