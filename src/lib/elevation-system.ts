/**
 * Elevation System - Apple + Material Design Shadows
 *
 * Provides TypeScript exports of elevation shadows for programmatic use.
 * Elevations create depth hierarchy and guide user attention.
 *
 * @example
 * ```tsx
 * import { elevation } from '@/lib/elevation-system';
 *
 * // Use in inline styles
 * <div style={{ boxShadow: elevation[2] }} />
 *
 * // Use with className
 * <div className="shadow-[var(--elevation-2)]" />
 * ```
 */

/**
 * Elevation shadow definitions
 * Matches Apple's subtle shadows with Material's depth system
 */
export const elevation = {
  /**
   * No shadow (flat surface)
   * Use for: Base elements, background content
   */
  0: "none" as const,

  /**
   * Subtle shadow (slight elevation)
   * Use for: Cards, list items, raised buttons
   */
  1: "0 1px 2px 0 rgb(0 0 0 / 0.05)" as const,

  /**
   * Light shadow (low elevation)
   * Use for: Hovered cards, dropdown menus, popovers
   */
  2: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)" as const,

  /**
   * Medium shadow (moderate elevation)
   * Use for: Modals, raised cards, navigation bars
   */
  3: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" as const,

  /**
   * High shadow (significant elevation)
   * Use for: Active modals, focused panels, important cards
   */
  4: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" as const,

  /**
   * Very high shadow (maximum elevation)
   * Use for: Critical overlays, emphasized content, top-level modals
   */
  5: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" as const,

  /**
   * Extreme shadow (special elevation)
   * Use for: Hero elements, dramatic emphasis
   */
  6: "0 25px 50px -12px rgb(0 0 0 / 0.25)" as const,
} as const;

/**
 * Elevation level type
 */
export type ElevationLevel = keyof typeof elevation;

/**
 * Recommended elevation levels for common UI elements
 */
export const componentElevation = {
  /** Cards (default state) */
  card: elevation[1],

  /** Cards (hover state) */
  cardHover: elevation[2],

  /** Buttons (raised) */
  button: elevation[1],

  /** Buttons (hover) */
  buttonHover: elevation[2],

  /** Dropdown menus */
  dropdown: elevation[2],

  /** Popovers */
  popover: elevation[2],

  /** Modal backdrop */
  modalBackdrop: elevation[0],

  /** Modal content */
  modal: elevation[4],

  /** Navigation bar */
  navbar: elevation[2],

  /** Sidebar */
  sidebar: elevation[3],

  /** Tooltip */
  tooltip: elevation[3],

  /** Sticky header */
  stickyHeader: elevation[2],

  /** Table rows */
  tableRow: elevation[0],

  /** Table rows (hover) */
  tableRowHover: elevation[1],
} as const;

/**
 * Dynamic elevation class generator
 * Returns CSS class string for given elevation level
 *
 * @example
 * ```tsx
 * getElevationClass(2) // Returns "shadow-[0_1px_3px_0_rgb(0_0_0_/_0.1),_0_1px_2px_-1px_rgb(0_0_0_/_0.1)]"
 * ```
 */
export function getElevationClass(level: ElevationLevel): string {
  const shadow = elevation[level];
  // Convert CSS shadow to Tailwind arbitrary value format
  const formattedShadow = shadow
    .replace(/\s+/g, "_")
    .replace(/\//g, "_")
    .replace(/,/g, ",_")
    .replace(/rgb/g, "rgb");
  return `shadow-[${formattedShadow}]`;
}

/**
 * Interactive elevation hook (for React components)
 * Returns elevation classes for default and hover states
 *
 * @example
 * ```tsx
 * function Card() {
 *   const { base, hover } = useInteractiveElevation(1, 2);
 *   return <div className={base} onMouseEnter={() => setHover(hover)} />;
 * }
 * ```
 */
export function useInteractiveElevation(
  defaultLevel: ElevationLevel,
  hoverLevel: ElevationLevel
): { base: string; hover: string } {
  return {
    base: getElevationClass(defaultLevel),
    hover: getElevationClass(hoverLevel),
  };
}

/**
 * Z-index scale for layering
 * Pairs with elevation to establish complete depth hierarchy
 */
export const zIndex = {
  /** Base layer */
  base: 0,

  /** Sticky content */
  sticky: 10,

  /** Fixed navigation */
  fixed: 20,

  /** Dropdown menus */
  dropdown: 1000,

  /** Sticky header */
  stickyHeader: 1020,

  /** Fixed content */
  fixedContent: 1030,

  /** Modal backdrop */
  modalBackdrop: 1040,

  /** Modal content */
  modal: 1050,

  /** Popovers */
  popover: 1060,

  /** Tooltips */
  tooltip: 1070,

  /** Top layer */
  top: 9999,
} as const;

/**
 * Type definition for z-index
 */
export type ZIndexLevel = keyof typeof zIndex;

/**
 * Layering presets combining elevation and z-index
 */
export const layer = {
  /** Base content layer */
  base: {
    elevation: elevation[0],
    zIndex: zIndex.base,
  },

  /** Sticky navigation layer */
  sticky: {
    elevation: elevation[2],
    zIndex: zIndex.sticky,
  },

  /** Dropdown layer */
  dropdown: {
    elevation: elevation[2],
    zIndex: zIndex.dropdown,
  },

  /** Modal layer */
  modal: {
    elevation: elevation[4],
    zIndex: zIndex.modal,
  },

  /** Tooltip layer */
  tooltip: {
    elevation: elevation[3],
    zIndex: zIndex.tooltip,
  },
} as const;
