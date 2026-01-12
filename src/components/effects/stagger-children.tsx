"use client"

import * as React from "react"
import { motion, Variants, Transition } from "framer-motion"
import { cn } from "@/lib/utils"

// ============================================================================
// STAGGER VARIANTS
// ============================================================================

/**
 * Stagger Direction
 *
 * Direction for staggered animations.
 */
export type StaggerDirection = 1 | -1

/**
 * Fade stagger variants
 */
export const fadeStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
}

/**
 * Slide up stagger variants
 */
export const slideUpStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
}

export const slideUpItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.15 },
  },
}

/**
 * Scale stagger variants
 */
export const scaleStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
}

export const scaleItem: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.15 },
  },
}

/**
 * Blur stagger variants
 */
export const blurStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
}

export const blurItem: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    filter: "blur(10px)",
    transition: { duration: 0.2 },
  },
}

/**
 * Rotate stagger variants
 */
export const rotateStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
}

export const rotateItem: Variants = {
  hidden: { opacity: 0, rotate: -10 },
  visible: {
    opacity: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    rotate: 10,
    transition: { duration: 0.15 },
  },
}

// ============================================================================
// STAGGER TYPE
// ============================================================================

/**
 * Stagger Type
 *
 * Predefined stagger animation types.
 */
export type StaggerType =
  | "fade"
  | "slide-up"
  | "scale"
  | "blur"
  | "rotate"
  | "custom"

/**
 * Get stagger variants by type
 */
export function getStaggerVariants(type: StaggerType): {
  container: Variants
  item: Variants
} {
  switch (type) {
    case "fade":
      return { container: fadeStagger, item: slideUpItem }
    case "slide-up":
      return { container: slideUpStagger, item: slideUpItem }
    case "scale":
      return { container: scaleStagger, item: scaleItem }
    case "blur":
      return { container: blurStagger, item: blurItem }
    case "rotate":
      return { container: rotateStagger, item: rotateItem }
    case "custom":
      return { container: fadeStagger, item: slideUpItem }
  }
}

// ============================================================================
// STAGGER CHILDREN PROPS
// ============================================================================

/**
 * StaggerChildren Props
 */
export interface StaggerChildrenProps {
  /** Children elements to stagger */
  children: React.ReactNode
  /** Stagger animation type */
  type?: StaggerType
  /** Custom container variants */
  variants?: Variants
  /** Custom item variants */
  itemVariants?: Variants
  /** Delay between child animations (seconds) */
  staggerDelay?: number
  /** Initial delay before first child (seconds) */
  initialDelay?: number
  /** Stagger direction (1 = normal, -1 = reverse) */
  staggerDirection?: StaggerDirection
  /** Whether to animate on mount */
  animate?: boolean
  /** Additional CSS class names */
  className?: string
  /** Should exit animations play */
  exitBeforeEnter?: boolean
}

/**
 * StaggerChildren Component
 *
 * Framer Motion container for staggered child animations.
 *
 * @example
 * ```tsx
 * <StaggerChildren type="slide-up" staggerDelay={0.1}>
 *   {items.map((item) => (
 *     <StaggerItem key={item.id}>
 *       <div>{item.content}</div>
 *     </StaggerItem>
 *   ))}
 * </StaggerChildren>
 * ```
 */
export function StaggerChildren({
  children,
  type = "fade",
  variants,
  itemVariants,
  staggerDelay = 0.05,
  initialDelay = 0,
  staggerDirection = 1,
  animate = true,
  className,
  exitBeforeEnter = false,
}: StaggerChildrenProps) {
  const { container: defaultContainer, item: defaultItem } = getStaggerVariants(type)

  const containerVariants = variants || {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
        staggerDirection,
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial={animate ? "hidden" : false}
      animate={animate ? "visible" : false}
      exit={exitBeforeEnter ? "hidden" : undefined}
      className={className}
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) {
          return child
        }

        // Check if child is already a StaggerItem
        if (child.type === StaggerItem) {
          return React.cloneElement(child, {
            variants: itemVariants || defaultItem,
            customDelay: index * staggerDelay,
          } as Partial<StaggerItemProps>)
        }

        // Wrap child in StaggerItem
        return (
          <StaggerItem
            key={child.key || index}
            variants={itemVariants || defaultItem}
          >
            {child}
          </StaggerItem>
        )
      })}
    </motion.div>
  )
}

/**
 * StaggerItem Props
 */
export interface StaggerItemProps {
  /** Item content */
  children: React.ReactNode
  /** Item animation variants */
  variants?: Variants
  /** Custom delay in seconds */
  customDelay?: number
  /** Additional CSS class names */
  className?: string
  /** Transition config */
  transition?: Transition
}

/**
 * StaggerItem Component
 *
 * Individual staggered item.
 *
 * @example
 * ```tsx
 * <StaggerItem>
 *   <div>Content</div>
 * </StaggerItem>
 * ```
 */
export function StaggerItem({
  children,
  variants,
  customDelay = 0,
  className,
  transition,
}: StaggerItemProps) {
  const defaultVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: transition || {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: customDelay,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.15 },
    },
  }

  const selectedVariants = variants || defaultVariants

  return (
    <motion.div variants={selectedVariants} className={className}>
      {children}
    </motion.div>
  )
}

// ============================================================================
// STAGGER LIST
// ============================================================================

/**
 * StaggerList Props
 */
export interface StaggerListProps<T> {
  /** List items */
  items: readonly T[]
  /** Item key extractor */
  itemKey: (item: T, index: number) => string
  /** Render function for each item */
  children: (item: T, index: number) => React.ReactNode
  /** Stagger animation type */
  type?: StaggerType
  /** Stagger delay between items */
  staggerDelay?: number
  /** Initial delay */
  initialDelay?: number
  /** Container className */
  className?: string
  /** Item className */
  itemClassName?: string
  /** Enable animations */
  animate?: boolean
}

/**
 * StaggerList Component
 *
 * Convenience component for animating lists with stagger.
 *
 * @example
 * ```tsx
 * <StaggerList
 *   items={items}
 *   itemKey={(item) => item.id}
 *   type="scale"
 *   staggerDelay={0.05}
 * >
 *   {(item) => <div>{item.name}</div>}
 * </StaggerList>
 * ```
 */
export function StaggerList<T>({
  items,
  itemKey,
  children,
  type = "fade",
  staggerDelay = 0.05,
  initialDelay = 0,
  className,
  itemClassName,
  animate = true,
}: StaggerListProps<T>) {
  const { container, item } = getStaggerVariants(type)

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial={animate ? "hidden" : false}
      animate={animate ? "visible" : false}
      className={className}
    >
      {items.map((itemData, index) => (
        <motion.div
          key={itemKey(itemData, index)}
          variants={item}
          className={itemClassName}
        >
          {children(itemData, index)}
        </motion.div>
      ))}
    </motion.div>
  )
}

// ============================================================================
// GRID STAGGER
// ============================================================================

/**
 * GridStagger Props
 */
export interface GridStaggerProps {
  /** Grid items */
  children: React.ReactNode
  /** Number of columns */
  columns?: number
  /** Stagger type */
  type?: StaggerType
  /** Stagger delay */
  staggerDelay?: number
  /** Grid gap */
  gap?: string
  /** Container className */
  className?: string
}

/**
 * GridStagger Component
 *
 * Stagger animations for grid layouts with diagonal wave effect.
 *
 * @example
 * ```tsx
 * <GridStagger columns={3} gap="1rem">
 *   {items.map((item) => (
 *     <div key={item.id}>{item.content}</div>
 *   ))}
 * </GridStagger>
 * ```
 */
export function GridStagger({
  children,
  columns = 3,
  type = "scale",
  staggerDelay = 0.05,
  gap = "1rem",
  className,
}: GridStaggerProps) {
  const { item } = getStaggerVariants(type)

  const childrenArray = React.Children.toArray(children)

  // Calculate delay based on diagonal position for wave effect
  const getDelay = (index: number) => {
    const row = Math.floor(index / columns)
    const col = index % columns
    return (row + col) * staggerDelay
  }

  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
      }}
    >
      {childrenArray.map((child, index) => (
        <motion.div
          key={(child as React.ReactElement).key || index}
          variants={item}
          initial="hidden"
          animate="visible"
          transition={{
            ...(item.visible as any)?.transition,
            delay: getDelay(index),
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}
