/**
 * Glass Header Component
 *
 * Fixed header with glassmorphism effect.
 * Provides a premium navigation bar with blur backdrop.
 *
 * Features:
 * - Glass effect with blur
 * - Fixed/sticky positioning
 * - Hide on scroll down, show on scroll up
 * - Shadow that intensifies with scroll
 * - Responsive behavior
 * - Dark mode support
 *
 * @example
 * ```tsx
 * import { GlassHeader } from './glass-header'
 *
 * <GlassHeader>
 *   <Logo />
 *   <Navigation />
 *   <Actions />
 * </GlassHeader>
 * ```
 */

import * as React from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"
import { applyGlassPreset, type GlassPreset } from "./glass-presets"

// ============================================================================
// TYPES
// ============================================================================

export interface GlassHeaderProps {
  /**
   * Header children
   */
  children: React.ReactNode

  /**
   * Glass effect variant
   * @default "medium"
   */
  variant?: GlassPreset

  /**
   * Header position
   * @default "fixed"
   */
  position?: "fixed" | "sticky"

  /**
   * Hide on scroll down
   * @default false
   */
  hideOnScroll?: boolean

  /**
   * Scroll threshold for showing/hiding (in pixels)
   * @default 100
   */
  scrollThreshold?: number

  /**
   * Maximum height for header
   * @default 16 (64px)
   */
  height?: number

  /**
   * Border bottom
   * @default true
   */
  showBorder?: boolean

  /**
   * Enable shadow on scroll
   * @default true
   */
  shadowOnScroll?: boolean

  /**
   * Content container max width
   * @default "7xl"
   */
  containerMaxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl" | "full"

  /**
   * Additional classes
   */
  className?: string

  /**
   * Additional container classes
   */
  containerClassName?: string

  /**
   * Additional inner classes
   */
  innerClassName?: string
}

// ============================================================================
// WIDTH MAPPING
// ============================================================================

const maxWidthClasses: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
}

// ============================================================================
// MAIN HEADER COMPONENT
// ============================================================================

export const GlassHeader: React.FC<GlassHeaderProps> = ({
  children,
  variant = "medium",
  position = "fixed",
  hideOnScroll = false,
  scrollThreshold = 100,
  height = 16,
  showBorder = true,
  shadowOnScroll = true,
  containerMaxWidth = "7xl",
  className,
  containerClassName,
  innerClassName,
}) => {
  const [darkMode, setDarkMode] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const headerRef = React.useRef<HTMLElement>(null)

  const { scrollY, scrollYProgress } = useScroll()
  const translateY = useTransform(
    scrollY,
    [0, scrollThreshold, scrollThreshold * 2],
    hideOnScroll ? [0, 0, -100] : [0, 0, 0]
  )

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

  // Track scroll state for shadow
  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Get glass styles
  const glassStyles = applyGlassPreset(variant, { darkMode })

  // Shadow intensity based on scroll
  const shadowIntensity = useTransform(
    scrollYProgress,
    [0, 0.05],
    [0, 0.15]
  )

  const positionClasses = position === "fixed" ? "fixed" : "sticky"

  const borderClasses = showBorder
    ? "border-b border-white/10 dark:border-white/5"
    : ""

  return (
    <motion.header
      ref={headerRef}
      style={{
        ...glassStyles,
        translateY,
        boxShadow: shadowOnScroll
          ? `0 4px ${8 + (scrolled ? 8 : 0)}px rgb(0 0 0 / ${shadowIntensity.get()})`
          : undefined,
      }}
      className={cn(
        "top-0 left-0 right-0 z-50",
        positionClasses,
        height ? `h-[${height * 4}px]` : "h-16",
        borderClasses,
        "transition-all duration-200",
        className
      )}
    >
      <div className={cn("w-full", containerClassName)}>
        <div
          className={cn(
            "mx-auto px-4 sm:px-6 lg:px-8",
            maxWidthClasses[containerMaxWidth],
            "h-full",
            innerClassName
          )}
        >
          {children}
        </div>
      </div>
    </motion.header>
  )
}

// ============================================================================
// HEADER BRAND COMPONENT
// ============================================================================

export interface GlassHeaderBrandProps {
  /**
   * Brand content (logo, title)
   */
  children: React.ReactNode

  /**
   * Link href
   * @default "/"
   */
  href?: string

  /**
   * Additional classes
   */
  className?: string
}

export const GlassHeaderBrand: React.FC<GlassHeaderBrandProps> = ({
  children,
  href = "/",
  className,
}) => {
  return (
    <a
      href={href}
      className={cn(
        "flex items-center gap-2",
        "font-semibold text-lg",
        "text-foreground",
        "hover:text-primary",
        "transition-colors",
        "focus:outline-none",
        "focus-visible:ring-2 focus-visible:ring-primary/50",
        className
      )}
    >
      {children}
    </a>
  )
}

// ============================================================================
// HEADER NAVIGATION COMPONENT
// ============================================================================

export interface GlassHeaderNavProps {
  /**
   * Navigation items
   */
  children: React.ReactNode

  /**
   * Alignment
   * @default "center"
   */
  align?: "start" | "center" | "end"

  /**
   * Additional classes
   */
  className?: string
}

export const GlassHeaderNav: React.FC<GlassHeaderNavProps> = ({
  children,
  align = "center",
  className,
}) => {
  const alignClasses: Record<string, string> = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
  }

  return (
    <nav
      className={cn(
        "flex items-center gap-1 sm:gap-2",
        alignClasses[align],
        "flex-1",
        className
      )}
    >
      {children}
    </nav>
  )
}

// ============================================================================
// HEADER NAV ITEM COMPONENT
// ============================================================================

export interface GlassHeaderNavItemProps {
  /**
   * Item label
   */
  children: React.ReactNode

  /**
   * Navigation href
   */
  href: string

  /**
   * Active state
   */
  active?: boolean

  /**
   * Additional classes
   */
  className?: string
}

export const GlassHeaderNavItem: React.FC<GlassHeaderNavItemProps> = ({
  children,
  href,
  active = false,
  className,
}) => {
  const pathname = typeof window !== "undefined" ? window.location.pathname : ""
  const isActive = active || pathname === href

  return (
    <a
      href={href}
      className={cn(
        "px-3 py-2 rounded-md",
        "text-sm font-medium",
        "transition-all duration-200",
        "relative",
        isActive
          ? "text-foreground"
          : "text-foreground/70 hover:text-foreground hover:bg-white/10 dark:hover:bg-white/5",
        "focus:outline-none",
        "focus-visible:ring-2 focus-visible:ring-primary/50",
        className
      )}
    >
      {children}
      {isActive && (
        <motion.div
          layoutId="headerActiveIndicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
          initial={false}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </a>
  )
}

// ============================================================================
// HEADER ACTIONS COMPONENT
// ============================================================================

export interface GlassHeaderActionsProps {
  /**
   * Action items
   */
  children: React.ReactNode

  /**
   * Additional classes
   */
  className?: string
}

export const GlassHeaderActions: React.FC<GlassHeaderActionsProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        "flex-shrink-0",
        className
      )}
    >
      {children}
    </div>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default GlassHeader
