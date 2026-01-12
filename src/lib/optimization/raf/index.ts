/**
 * RequestAnimationFrame Optimization Module
 *
 * Performance utilities using requestAnimationFrame for smooth 60fps animations.
 *
 * @module optimization/raf
 */

// Scheduler
export {
  getRafScheduler,
  resetRafScheduler,
  raf,
  rafLoop,
  rafDelay,
  getRafMetrics,
  useRaf,
  useRafOnce,
  RafScheduler,
  RafPriority,
} from './raf-scheduler';
export type { SchedulerOptions, UseRafOptions, UseRafOnceOptions, SchedulerMetrics } from './raf-scheduler';

// Throttle
export {
  rafThrottle,
  rafThrottleInterval,
  rafThrottleScroll,
  rafThrottleResize,
  rafThrottleMouse,
  useRafThrottle,
  useScrollThrottle,
  useResizeThrottle,
  useThrottledEventListener,
  rafDebounce,
} from './raf-throttle';
export type {
  ThrottleOptions,
  ThrottledFunction,
  ThrottledEventListenerOptions,
  DebounceOptions,
  DebouncedFunction,
} from './raf-throttle';

// Animation Queue
export {
  getAnimationQueue,
  resetAnimationQueue,
  queueAnimation,
  cancelAnimation,
  cancelAnimationsByTag,
  getQueueStats,
  useQueueAnimation,
  useQueueStats,
  AnimationQueue,
  AnimationState,
  AnimationPriority,
} from './animation-queue';
export type {
  AnimationJob,
  AnimationSignal,
  QueueStats,
  QueueOptions,
  UseQueueAnimationOptions,
  QueueAnimationControl,
} from './animation-queue';
