/**
 * Glassmorphism Components
 *
 * Premium glassmorphism UI components with blur effects.
 * All components support dark mode and have performance optimizations.
 *
 * @example
 * ```tsx
 * import {
 *   GlassCard,
 *   GlassDialog,
 *   GlassSidebar,
 *   GlassHeader,
 *   glassPresets,
 *   applyGlassPreset
 * } from '@/components/effects/glassmorphism'
 * ```
 */

// Main components
export { GlassCard } from "./glass-card"
export {
  GlassCardSubtle,
  GlassCardMedium,
  GlassCardHeavy,
  GlassCardColored,
  GlassCardInteractive,
  GlassCardBlue,
  GlassCardPurple,
  GlassCardGreen,
  GlassCardAmber,
  GlassCardRose,
} from "./glass-card"
export type { GlassCardProps } from "./glass-card"

export {
  GlassDialog,
  GlassDialogHeader,
  GlassDialogFooter,
  DialogContent,
} from "./glass-dialog"
export type {
  GlassDialogProps,
  DialogContentProps,
  GlassDialogHeaderProps,
  GlassDialogFooterProps,
} from "./glass-dialog"

export {
  GlassSidebar,
  GlassSidebarItem,
  GlassSidebarSection,
  GlassSidebarCollapse,
} from "./glass-sidebar"
export type {
  GlassSidebarProps,
  GlassSidebarItemProps,
  GlassSidebarSectionProps,
  GlassSidebarCollapseProps,
} from "./glass-sidebar"

export {
  GlassHeader,
  GlassHeaderBrand,
  GlassHeaderNav,
  GlassHeaderNavItem,
  GlassHeaderActions,
} from "./glass-header"
export type {
  GlassHeaderProps,
  GlassHeaderBrandProps,
  GlassHeaderNavProps,
  GlassHeaderNavItemProps,
  GlassHeaderActionsProps,
} from "./glass-header"

// Presets and utilities
export {
  glassPresets,
  coloredGlassVariants,
  applyGlassPreset,
  getGlassClasses,
  getGlassStyles,
  glassCSS,
  glassUtilities,
  supportsBackdropFilter,
  useGlass,
} from "./glass-presets"
export type {
  GlassPreset,
  GlassConfig,
  GlassStyles,
  UseGlassOptions,
} from "./glass-presets"
