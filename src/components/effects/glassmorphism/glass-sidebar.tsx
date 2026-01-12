/**
 * Glass Sidebar Component
 *
 * Sidebar navigation with glassmorphism effect.
 * Fixed or collapsible sidebar with premium glass look.
 *
 * Features:
 * - Glass effect with blur
 * - Fixed positioning with backdrop
 * - Collapsible variant
 * - Responsive behavior
 * - Active state indicators
 * - Dark mode support
 *
 * @example
 * ```tsx
 * import { GlassSidebar, GlassSidebarItem } from './glass-sidebar'
 *
 * <GlassSidebar>
 *   <GlassSidebarItem href="/" active>Home</GlassSidebarItem>
 *   <GlassSidebarItem href="/markets">Markets</GlassSidebarItem>
 * </GlassSidebar>
 * ```
 */

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { applyGlassPreset, type GlassPreset } from "./glass-presets"
import { focusStyles } from "../micro-interactions/focus-states"

// ============================================================================
// TYPES
// ============================================================================

export interface GlassSidebarProps {
  /**
   * Sidebar children (typically GlassSidebarItem components)
   */
  children: React.ReactNode

  /**
   * Glass effect variant
   * @default "medium"
   */
  variant?: GlassPreset

  /**
   * Sidebar position
   * @default "left"
   */
  position?: "left" | "right"

  /**
   * Sidebar width
   * @default "md"
   */
  width?: "sm" | "md" | "lg" | "xl"

  /**
   * Enable collapsible behavior
   * @default false
   */
  collapsible?: boolean

  /**
   * Controlled collapsed state
   */
  collapsed?: boolean

  /**
   * Callback when collapsed state changes
   */
  onCollapsedChange?: (collapsed: boolean) => void

  /**
   * Show header section
   */
  header?: React.ReactNode

  /**
   * Show footer section
   */
  footer?: React.ReactNode

  /**
   * Additional classes
   */
  className?: string
}

export interface GlassSidebarItemProps {
  /**
   * Item label
   */
  children: React.ReactNode

  /**
   * Navigation href
   */
  href?: string

  /**
   * Icon element
   */
  icon?: React.ReactNode

  /**
   * Active state
   */
  active?: boolean

  /**
   * Disabled state
   */
  disabled?: boolean

  /**
   * Click handler
   */
  onClick?: () => void

  /**
   * Additional classes
   */
  className?: string

  /**
   * Show badge
   */
  badge?: string | number
}

export interface GlassSidebarSectionProps {
  /**
   * Section title
   */
  title?: string

  /**
   * Section children
   */
  children: React.ReactNode

  /**
   * Additional classes
   */
  className?: string
}

// ============================================================================
// WIDTH MAPPING
// ============================================================================

const widthClasses: Record<string, string> = {
  sm: "w-16",
  md: "w-64",
  lg: "w-80",
  xl: "w-96",
}

const collapsedWidthClasses: Record<string, string> = {
  sm: "w-16",
  md: "w-16",
  lg: "w-16",
  xl: "w-16",
}

// ============================================================================
// SIDEBAR ITEM COMPONENT
// ============================================================================

export const GlassSidebarItem: React.FC<GlassSidebarItemProps> = ({
  children,
  href,
  icon,
  active = false,
  disabled = false,
  onClick,
  className,
  badge,
}) => {
  const pathname = usePathname()
  const isActive = active || (href && pathname === href)

  const baseClasses = [
    "flex items-center gap-3",
    "px-4 py-3",
    "rounded-lg",
    "transition-all",
    "duration-200",
    "relative",
    "group",
  ]

  const stateClasses = disabled
    ? ["opacity-50", "pointer-events-none"]
    : isActive
    ? [
        "bg-white/20 dark:bg-white/10",
        "text-foreground",
        "font-medium",
      ]
    : [
        "text-foreground/70",
        "hover:bg-white/10 dark:hover:bg-white/5",
        "hover:text-foreground",
      ]

  const focusClasses = focusStyles({ preset: "ring", keyboardOnly: true })

  const content = (
    <>
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-current rounded-r-full"
          initial={false}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      {icon && (
        <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
          {icon}
        </span>
      )}
      <span className="flex-1 truncate">{children}</span>
      {badge && (
        <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full bg-primary/20 text-primary">
          {badge}
        </span>
      )}
    </>
  )

  const mergedClasses = cn(
    baseClasses,
    stateClasses,
    focusClasses,
    className
  )

  if (href && !disabled) {
    return (
      <Link href={href} className={mergedClasses} onClick={onClick}>
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      className={mergedClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </button>
  )
}

// ============================================================================
// SIDEBAR SECTION COMPONENT
// ============================================================================

export const GlassSidebarSection: React.FC<GlassSidebarSectionProps> = ({
  title,
  children,
  className,
}) => {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {title && (
        <span className="px-4 pt-4 pb-2 text-xs font-semibold text-foreground/50 uppercase tracking-wider">
          {title}
        </span>
      )}
      {children}
    </div>
  )
}

// ============================================================================
// MAIN SIDEBAR COMPONENT
// ============================================================================

export const GlassSidebar: React.FC<GlassSidebarProps> = ({
  children,
  variant = "medium",
  position = "left",
  width = "md",
  collapsible = false,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  header,
  footer,
  className,
}) => {
  const [internalCollapsed, setInternalCollapsed] = React.useState(false)
  const [darkMode, setDarkMode] = React.useState(false)

  const collapsed =
    controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed

  const handleCollapse = () => {
    const newState = !collapsed
    setInternalCollapsed(newState)
    onCollapsedChange?.(newState)
  }

  // Detect dark mode
  React.useEffect(() => {
    const root = window.document.documentElement
    setDarkMode(root.classList.contains("dark"))

    const observer = new MutationObserver(() => {
      setDarkMode(root.classList.contains("dark"))
    })

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [])

  // Get glass styles
  const glassStyles = applyGlassPreset(variant, { darkMode })

  const positionClasses = position === "left" ? "left-0" : "right-0"

  const widthClass = collapsed
    ? collapsedWidthClasses[width]
    : widthClasses[width]

  return (
    <motion.aside
      className={cn(
        "fixed top-0 bottom-0 z-40",
        "flex flex-col",
        "border-r border-white/10 dark:border-white/5",
        positionClasses,
        widthClass,
        "transition-all duration-300 ease-out",
        className
      )}
      style={glassStyles}
      initial={false}
      animate={{ width: collapsed ? 64 : undefined }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      {header && (
        <div
          className={cn(
            "flex items-center justify-between",
            "p-4",
            "border-b border-white/10 dark:border-white/5"
          )}
        >
          {!collapsed && <div className="flex-1">{header}</div>}
          {collapsible && (
            <button
              type="button"
              onClick={handleCollapse}
              className={cn(
                "p-2 rounded-md",
                "hover:bg-white/10 dark:hover:bg-white/5",
                "transition-colors",
                focusStyles({ preset: "ring" })
              )}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <motion.svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ rotate: collapsed ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </motion.svg>
            </button>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-1"
            >
              {children}
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-2 items-center"
            >
              {/* Render collapsed versions of sidebar items */}
              {React.Children.map(children, (child) => {
                if (React.isValidElement<GlassSidebarItemProps>(child)) {
                  return (
                    <div
                      key={child.props?.children?.toString()}
                      className={cn(
                        "p-3 rounded-lg",
                        "transition-colors",
                        child.props?.active
                          ? "bg-white/20 dark:bg-white/10"
                          : "hover:bg-white/10 dark:hover:bg-white/5"
                      )}
                      title={child.props?.children?.toString()}
                    >
                      {child.props?.icon}
                    </div>
                  )
                }
                return null
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Footer */}
      {footer && !collapsed && (
        <div
          className={cn(
            "p-4",
            "border-t border-white/10 dark:border-white/5"
          )}
        >
          {footer}
        </div>
      )}
    </motion.aside>
  )
}

// ============================================================================
// COLLAPSE BUTTON COMPONENT
// ============================================================================

export interface GlassSidebarCollapseProps {
  /**
   * Current collapsed state
   */
  collapsed: boolean

  /**
   * Toggle callback
   */
  onToggle: () => void

  /**
   * Additional classes
   */
  className?: string
}

export const GlassSidebarCollapse: React.FC<GlassSidebarCollapseProps> = ({
  collapsed,
  onToggle,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "absolute -right-3 top-6",
        "w-6 h-6 rounded-full",
        "bg-background border border-border",
        "flex items-center justify-center",
        "shadow-md",
        "hover:scale-110 active:scale-95",
        "transition-transform",
        focusStyles({ preset: "ring" }),
        className
      )}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      <motion.svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        animate={{ rotate: collapsed ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </motion.svg>
    </button>
  )
}

export default GlassSidebar
