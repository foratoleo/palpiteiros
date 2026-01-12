/**
 * UI Types
 *
 * Type definitions for UI components, state management, themes,
 * notifications, animations, and responsive design utilities.
 */

// ============================================================================
// THEME TYPES
// ============================================================================

/**
 * Theme
 *
 * Available application themes
 */
export type Theme = 'light' | 'dark' | 'system'

/**
 * Theme Configuration
 *
 * User theme preferences and accessibility settings
 */
export interface ThemeConfig {
  /** Selected theme */
  theme: Theme
  /** Enable particle effects (can be performance-intensive) */
  particleEffects: boolean
  /** Reduce motion for accessibility */
  reducedMotion: boolean
  /** Compact mode for smaller screens */
  compactMode?: boolean
  /** High contrast mode for accessibility */
  highContrast?: boolean
}

/**
 * Color Scheme
 *
 * Named color schemes for the application
 */
export enum ColorScheme {
  /** Default blue scheme */
  BLUE = 'blue',
  /** Green color scheme */
  GREEN = 'green',
  /** Purple color scheme */
  PURPLE = 'purple',
  /** Orange color scheme */
  ORANGE = 'orange',
  /** Red color scheme */
  RED = 'red'
}

// ============================================================================
// TOAST NOTIFICATION TYPES
// ============================================================================

/**
 * Toast Variant
 *
 * Visual style of toast notification
 */
export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info'

/**
 * Toast Position
 *
 * Screen position for toast notifications
 */
export enum ToastPosition {
  /** Top center of screen */
  TOP_CENTER = 'top-center',
  /** Top right of screen */
  TOP_RIGHT = 'top-right',
  /** Top left of screen */
  TOP_LEFT = 'top-left',
  /** Bottom center of screen */
  BOTTOM_CENTER = 'bottom-center',
  /** Bottom right of screen */
  BOTTOM_RIGHT = 'bottom-right',
  /** Bottom left of screen */
  BOTTOM_LEFT = 'bottom-left'
}

/**
 * Toast
 *
 * Toast notification data
 */
export interface Toast {
  /** Unique toast identifier */
  id: string
  /** Optional title */
  title?: string
  /** Toast message content */
  message: string
  /** Visual variant */
  variant: ToastVariant
  /** Display duration in milliseconds (0 = indefinite) */
  duration?: number
  /** Optional action button */
  action?: ToastAction
  /** Whether toast can be dismissed by user */
  dismissible?: boolean
  /** Custom icon */
  icon?: string
}

/**
 * Toast Action
 *
 * Action button on toast notification
 */
export interface ToastAction {
  /** Button label */
  label: string
  /** Click handler */
  onClick: () => void
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost'
}

/**
 * Toast Options
 *
 * Options for creating new toasts
 */
export interface ToastOptions {
  /** Toast position */
  position?: ToastPosition
  /** Maximum number of toasts to show */
  maxToasts?: number
  /** Default duration for toasts */
  defaultDuration?: number
  /** Enable sound */
  sound?: boolean
}

// ============================================================================
// LOADING STATE TYPES
// ============================================================================

/**
 * Loading State
 *
 * Generic loading state with data and error handling
 */
export interface LoadingState<T = unknown> {
  /** Whether currently loading */
  loading: boolean
  /** Error message if operation failed */
  error?: string | null
  /** Loaded data if successful */
  data?: T | null
}

/**
 * Loading Status
 *
 * Status of an async operation
 */
export type LoadingStatus = 'idle' | 'loading' | 'success' | 'error'

/**
 * Async State
 *
 * Combined status and data for async operations
 */
export interface AsyncState<T = unknown> {
  /** Current status */
  status: LoadingStatus
  /** Result data */
  data?: T
  /** Error information */
  error?: Error | string
  /** Timestamp of last update */
  timestamp?: number
}

/**
 * Skeleton Props
 *
 * Props for skeleton loading components
 */
export interface SkeletonProps {
  /** Whether skeleton is animating */
  animate?: boolean
  /** Number of skeleton items */
  count?: number
  /** Custom width */
  width?: string | number
  /** Custom height */
  height?: string | number
  /** Border radius */
  borderRadius?: string | number
}

// ============================================================================
// MODAL TYPES
// ============================================================================

/**
 * Modal State
 *
 * Current modal state in the modal stack
 */
export interface ModalState {
  /** Whether any modal is open */
  open: boolean
  /** Type identifier for the active modal */
  type: string | null
  /** Data passed to the modal */
  data?: unknown
  /** Modal configuration options */
  config?: Record<string, unknown>
}

/**
 * Modal Size
 *
 * Available modal sizes
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

/**
 * Modal Config
 *
 * Configuration for modal behavior
 */
export interface ModalConfig {
  /** Modal title */
  title?: string
  /** Modal description */
  description?: string
  /** Modal size */
  size?: ModalSize
  /** Close when clicking overlay */
  closeOnOverlayClick?: boolean
  /** Close when pressing Escape */
  closeOnEscape?: boolean
  /** Show close button */
  showCloseButton?: boolean
  /** Prevent body scroll when open */
  trapFocus?: boolean
  /** Custom content class */
  contentClass?: string
}

/**
 * Modal Props
 *
 * Props for modal component
 */
export interface ModalProps extends ModalConfig {
  /** Whether modal is open */
  open: boolean
  /** Called when modal closes */
  onClose: () => void
  /** Modal content */
  children: React.ReactNode
}

// ============================================================================
// PAGINATION TYPES
// ============================================================================

/**
 * Pagination State
 *
 * Current pagination state
 */
export interface PaginationState {
  /** Current page number (1-indexed) */
  page: number
  /** Items per page */
  pageSize: number
  /** Total number of items */
  total: number
}

/**
 * Pagination Props
 *
 * Props for pagination component
 */
export interface PaginationProps {
  /** Current page */
  currentPage: number
  /** Total number of pages */
  totalPages: number
  /** Page change callback */
  onPageChange: (page: number) => void
  /** Show page size selector */
  showSizeChanger?: boolean
  /** Available page size options */
  pageSizeOptions?: number[]
  /** Current page size */
  pageSize?: number
  /** Page size change callback */
  onPageSizeChange?: (size: number) => void
  /** Show total items */
  showTotal?: boolean
  /** Total items count */
  total?: number
}

/**
 * PaginationMeta
 *
 * Metadata for paginated responses
 */
export interface PaginationMeta {
  /** Current page */
  page: number
  /** Items per page */
  pageSize: number
  /** Total items */
  total: number
  /** Total pages */
  totalPages: number
  /** Whether there's a next page */
  hasNext: boolean
  /** Whether there's a previous page */
  hasPrev: boolean
}

// ============================================================================
// ANIMATION TYPES (Framer Motion)
// ============================================================================

/**
 * Transition Type
 *
 * Type of animation transition
 */
export type TransitionType = 'spring' | 'tween' | 'keyframes' | 'just'

/**
 * Transition Config
 *
 * Animation transition configuration
 */
export interface TransitionConfig {
  /** Transition type */
  type?: TransitionType
  /** Animation duration in seconds */
  duration?: number
  /** Easing function */
  ease?: string | number[]
  /** Bounce for spring animations */
  bounce?: number
  /** Stiffness for spring animations */
  stiffness?: number
  /** Damping for spring animations */
  damping?: number
  /** Delay before animation starts */
  delay?: number
}

/**
 * Variant Props
 *
 * Animation variants for Framer Motion
 */
export interface VariantProps {
  /** Initial state */
  initial?: string | object
  /** Animate to state */
  animate?: string | object
  /** Exit state */
  exit?: string | object
  /** Transition configuration */
  transition?: TransitionConfig
}

/**
 * Animation Variants
 *
 * Common animation variant presets
 */
export interface AnimationVariants {
  /** Fade in/out animation */
  fade: VariantProps
  /** Slide in from direction */
  slide: {
    up: VariantProps
    down: VariantProps
    left: VariantProps
    right: VariantProps
  }
  /** Scale animation */
  scale: VariantProps
  /** Rotate animation */
  rotate: VariantProps
}

/**
 * Presence Props
 *
 * Props for AnimatePresence component
 */
export interface PresenceProps {
  /** Children to animate */
  children: React.ReactNode
  /** Whether exit animations should wait for enter */
  wait?: boolean
  /** Custom exit before enter logic */
  exitBeforeEnter?: boolean
}

// ============================================================================
// VIEWPORT / RESPONSIVE TYPES
// ============================================================================

/**
 * Breakpoint
 *
 * Tailwind-style breakpoints
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

/**
 * Breakpoint Values
 *
 * Pixel values for breakpoints
 */
export interface BreakpointValues {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
}

/**
 * Viewport State
 *
 * Current viewport information
 */
export interface ViewportState {
  /** Viewport width in pixels */
  width: number
  /** Viewport height in pixels */
  height: number
  /** Current breakpoint */
  breakpoint: Breakpoint
  /** Whether viewport is mobile size */
  isMobile: boolean
  /** Whether viewport is tablet size */
  isTablet: boolean
  /** Whether viewport is desktop size */
  isDesktop: boolean
  /** Device pixel ratio */
  dpr: number
  /** Whether device is touch-enabled */
  isTouch: boolean
}

/**
 * Responsive Value
 *
 * Value that changes based on breakpoint
 */
export interface ResponsiveValue<T> {
  base: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
  '2xl'?: T
}

/**
 * Media Query Match
 *
 * Media query match results
 */
export interface MediaQueryMatches {
  /** '(min-width: 640px)' */
  sm: boolean
  /** '(min-width: 768px)' */
  md: boolean
  /** '(min-width: 1024px)' */
  lg: boolean
  /** '(min-width: 1280px)' */
  xl: boolean
  /** '(min-width: 1536px)' */
  '2xl': boolean
  /** '(prefers-reduced-motion: reduce)' */
  reducedMotion: boolean
  /** '(prefers-color-scheme: dark)' */
  darkMode: boolean
}

// ============================================================================
// FORM TYPES
// ============================================================================

/**
 * Form Field State
 *
 * State for a single form field
 */
export interface FormFieldState<T = unknown> {
  /** Field value */
  value: T
  /** Whether field has been touched */
  touched: boolean
  /** Field error message */
  error?: string
}

/**
 * Form State
 *
 * Complete form state with validation
 */
export interface FormState<T extends Record<string, unknown>> {
  /** All field values */
  values: T
  /** Field validation errors */
  errors: Partial<Record<keyof T, string>>
  /** Which fields have been touched */
  touched: Partial<Record<keyof T, boolean>>
  /** Whether form is submitting */
  submitting: boolean
  /** Whether form is valid */
  isValid: boolean
  /** Whether form has been modified */
  isDirty: boolean
}

/**
 * Form Field Props
 *
 * Props for form field components
 */
export interface FormFieldProps {
  /** Field name */
  name: string
  /** Field label */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Required field indicator */
  required?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Readonly state */
  readonly?: boolean
  /** Helper text */
  helperText?: string
  /** Error message */
  error?: string
}

// ============================================================================
// DROPDOWN / SELECT TYPES
// ============================================================================

/**
 * Select Option
 *
 * Option for select/dropdown components
 */
export interface SelectOption {
  /** Option value */
  value: string
  /** Display label */
  label: string
  /** Optional icon */
  icon?: string
  /** Disabled state */
  disabled?: boolean
  /** Nested options */
  options?: SelectOption[]
}

/**
 * Select Props
 *
 * Props for select component
 */
export interface SelectProps {
  /** Current value */
  value?: string | string[]
  /** Options to display */
  options: SelectOption[]
  /** Placeholder text */
  placeholder?: string
  /** Multiple selection */
  multiple?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Change handler */
  onChange: (value: string | string[]) => void
  /** Search placeholder */
  searchPlaceholder?: string
  /** Enable search filtering */
  searchable?: boolean
}

// ============================================================================
// TABLE TYPES
// ============================================================================

/**
 * Column Definition
 *
 * Table column configuration
 */
export interface ColumnDef<T = unknown> {
  /** Column identifier */
  id: string
  /** Column header */
  header: string
  /** Accessor function for cell value */
  accessor?: (row: T) => unknown
  /** Custom cell renderer */
  cell?: (row: T) => React.ReactNode
  /** Sortable column */
  sortable?: boolean
  /** Column width */
  width?: number | string
  /** Text alignment */
  align?: 'left' | 'center' | 'right'
}

/**
 * Table Sort State
 *
 * Current table sort state
 */
export interface TableSortState {
  /** Column being sorted */
  column: string | null
  /** Sort direction */
  direction: 'asc' | 'desc' | null
}

/**
 * Table Props
 *
 * Props for table component
 */
export interface TableProps<T = unknown> {
  /** Data rows */
  data: T[]
  /** Column definitions */
  columns: ColumnDef<T>[]
  /** Loading state */
  loading?: boolean
  /** Sort state */
  sort?: TableSortState
  /** Sort change handler */
  onSortChange?: (sort: TableSortState) => void
  /** Row key extractor */
  rowKey?: (row: T) => string
  /** Empty state message */
  emptyMessage?: string
  /** Clickable rows */
  clickable?: boolean
  /** Row click handler */
  onRowClick?: (row: T) => void
}
