"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

// Stagger variants for list items
const staggerContainer = {
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
};

const staggerItem = {
  hidden: { opacity: 0, y: 10 },
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
    y: -10,
    transition: {
      duration: 0.15,
    },
  },
};

// Preset transitions
const transitionPresets = {
  fade: {
    type: "fade",
    duration: 0.2,
  },
  slide: {
    type: "slide",
    duration: 0.3,
  },
  scale: {
    type: "scale",
    duration: 0.25,
  },
  none: {
    type: "none",
    duration: 0,
  },
};

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  type?: keyof typeof transitionPresets;
  mode?: "wait" | "sync" | "popLayout";
}

/**
 * PageTransition Wrapper
 *
 * Provides smooth page transitions using Framer Motion.
 * Wrap your page content with this component for animated transitions.
 *
 * @example
 * ```tsx
 * <PageTransition type="fade">
 *   <YourPageContent />
 * </PageTransition>
 * ```
 */
export function PageTransition({
  children,
  className,
  type = "fade",
  mode = "sync",
}: PageTransitionProps) {
  const pathname = usePathname();
  const [direction, setDirection] = React.useState(0);

  // Track navigation direction
  React.useEffect(() => {
    // Store previous path to determine direction
    const prevPath = pathname;
    return () => {
      // This would be enhanced with actual navigation tracking
    };
  }, [pathname]);

  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { x: direction > 0 ? "100%" : "-100%", opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: direction > 0 ? "-100%" : "100%", opacity: 0 },
    },
    scale: {
      initial: { scale: 0.95, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 1.05, opacity: 0 },
    },
    none: {
      initial: {},
      animate: {},
      exit: {},
    },
  };

  const selectedVariants = variants[type];
  const duration = transitionPresets[type].duration;

  return (
    <AnimatePresence mode={mode} initial={false}>
      <motion.div
        key={pathname}
        variants={selectedVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration, ease: "easeInOut" }}
        className={cn("w-full", className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * StaggerChildren Wrapper
 *
 * Staggers animation of child elements.
 * Useful for lists, grids, and sequential content.
 *
 * @example
 * ```tsx
 * <StaggerChildren>
 *   {items.map(item => (
 *     <StaggerItem key={item.id}>
 *       <div>{item.content}</div>
 *     </StaggerItem>
 *   ))}
 * </StaggerChildren>
 * ```
 */
interface StaggerChildrenProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerChildren({
  children,
  className,
  staggerDelay = 0.05,
}: StaggerChildrenProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function StaggerItem({ children, className, delay }: StaggerItemProps) {
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay,
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * SlideIn Wrapper
 *
 * Animates content sliding in from a specified direction.
 *
 * @example
 * ```tsx
 * <SlideIn direction="up" delay={0.2}>
 *   <div>Content slides up</div>
 * </SlideIn>
 * ```
 */
interface SlideInProps {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
}

export function SlideIn({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.3,
}: SlideInProps) {
  const directionMap = {
    up: { y: 20, x: 0 },
    down: { y: -20, x: 0 },
    left: { y: 0, x: 20 },
    right: { y: 0, x: -20 },
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...directionMap[direction],
      }}
      animate={{
        opacity: 1,
        y: 0,
        x: 0,
      }}
      transition={{
        duration,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * FadeIn Wrapper
 *
 * Simple fade-in animation.
 *
 * @example
 * ```tsx
 * <FadeIn delay={0.5}>
 *   <div>Fades in slowly</div>
 * </FadeIn>
 * ```
 */
interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.3,
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScaleIn Wrapper
 *
 * Scales content from 0 to 1 with a spring animation.
 *
 * @example
 * ```tsx
 * <ScaleIn>
 *   <div>Scales in with spring</div>
 * </ScaleIn>
 * ```
 */
interface ScaleInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  stiffness?: number;
}

export function ScaleIn({
  children,
  className,
  delay = 0,
  stiffness = 100,
}: ScaleInProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness,
        damping: 15,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Export variants for custom use
export { pageVariants, staggerContainer, staggerItem };
export { transitionPresets as presets };
