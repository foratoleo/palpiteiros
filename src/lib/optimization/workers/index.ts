/**
 * Web Worker Data Processing Module
 *
 * Offload heavy computations to Web Workers for better performance.
 *
 * @module optimization/workers
 */

// Worker factory
export {
  createWorker,
  createWorkerPool,
  createWorkerFromFunction,
  WorkerWrapper,
  WorkerPool,
} from './worker-factory';
export type {
  WorkerMessage,
  WorkerResponse,
  WorkerOptions,
  WorkerPoolOptions,
} from './worker-factory';

// Data worker
export { DATA_WORKER_SCRIPT } from './data-worker';
export type {
  FilterOperation,
  SortOperation,
  AggregateOperation,
  MarketFilters,
  MarketSortBy,
  PaginationResult,
  DataWorkerMessageType,
  DataWorkerMessage,
  DataWorkerResponse,
} from './data-worker';

// React hooks
export {
  useWorker,
  useWorkerPool,
  useWorkerTask,
  useWorkerValue,
  useDataWorker,
  useWorkerFn,
} from './use-worker';
export type {
  UseWorkerOptions,
  UseWorkerPoolOptions,
  WorkerState,
  WorkerTaskResult,
} from './use-worker';
