# Color Transition Guidelines

## Overview

This document provides guidelines for implementing smooth color transitions throughout the application. The color effects system provides utilities for interpolating, morphing, and animating colors in a performant and accessible way.

## Core Utilities

### Color Interpolator (`color-interpolator.ts`)

The color interpolator provides utilities for smooth color transitions between RGB, HSL, and HEX colors.

#### Features
- Linear interpolation (LERP) between colors
- RGB interpolation with gamma correction
- HSL interpolation for perceptual color transitions
- Multi-color gradient interpolation
- Easing functions for non-linear transitions
- Reduced motion support

#### Basic Usage

```ts
import { interpolateColor, createGradient } from '@/components/effects/colors/color-interpolator'

// Simple interpolation
const midColor = interpolateColor('#ff0000', '#0000ff', 0.5) // '#7f007f'

// With easing
const smoothColor = interpolateColor(
  '#ff0000',
  '#0000ff',
  0.5,
  { easing: easings.smooth }
)

// Create gradient function
const gradient = createGradient(['#ff0000', '#00ff00', '#0000ff'])
const color1 = gradient(0) // First color
const color2 = gradient(0.5) // Middle color
const color3 = gradient(1) // Last color
```

### Theme Transition (`theme-transition.tsx`)

Provides smooth theme switching between light and dark modes.

#### Usage

```tsx
import { ThemeTransition, ThemeSwitchButton } from '@/components/effects/colors/theme-transition'

// Wrap your app content
<ThemeTransition duration={400} showOverlay>
  <YourContent />
</ThemeTransition>

// Or use the switch button
<ThemeSwitchButton size="md" showLabel />
```

### Color Morph (`color-morph.tsx`)

Color morphing effects for state changes (hover, active, focus, etc.).

#### Usage

```tsx
import { ColorMorph, MorphingBadge } from '@/components/effects/colors/color-morph'

// Morph on hover
<ColorMorph
  fromColor="#3b82f6"
  toColor="#10b981"
  trigger="hover"
  duration={300}
  property="backgroundColor"
>
  <button>Hover me</button>
</ColorMorph>

// Morphing badge
<MorphingBadge state="success">
  Completed
</MorphingBadge>

// Morphing progress bar
<MorphingProgress value={75} showLabel />
```

### Gradient Animation (`gradient-animation.tsx`)

Animated gradient backgrounds with multiple patterns.

#### Usage

```tsx
import {
  AnimatedGradient,
  AuroraGradient,
  MeshGradient
} from '@/components/effects/colors/gradient-animation'

// Wave pattern gradient
<AnimatedGradient
  colors={['#3b82f6', '#8b5cf6', '#ec4899']}
  pattern="wave"
  duration={10}
>
  <div>Content</div>
</AnimatedGradient>

// Aurora effect
<AuroraGradient
  colors={['#7c3aed', '#2563eb', '#0891b2']}
  opacity={0.6}
>
  <div>Content</div>
</AuroraGradient>

// Mesh gradient
<MeshGradient colors={['#ff6b6b', '#4ecdc4', '#45b7d1']}>
  <div>Content</div>
</MeshGradient>
```

## Best Practices

### 1. Use HSL for Perceptual Transitions

When interpolating between colors, HSL generally provides more perceptually smooth transitions than RGB.

```ts
// Better for perceptual smoothness
interpolateColor(color1, color2, t, { useHSL: true })
```

### 2. Respect Reduced Motion

All color animation components check `prefers-reduced-motion` automatically. Ensure you pass through the `respectReducedMotion` prop for custom animations.

```tsx
<ColorMorph
  fromColor="#ff0000"
  toColor="#00ff00"
  respectReducedMotion={true}
>
  {children}
</ColorMorph>
```

### 3. Use Appropriate Durations

- Micro-interactions (hover, focus): 150-300ms
- State changes: 300-500ms
- Background animations: 5-15s

### 4. Easing Functions

Choose easing functions based on the type of interaction:

- `linear`: Continuous animations (loading, progress)
- `smooth` / `smoother`: Natural motion
- `easeOut`: Entering elements
- `easeIn`: Exiting elements

### 5. Performance Considerations

- Use `will-change` sparingly
- Prefer `transform` and `opacity` over animating colors directly
- Use `requestAnimationFrame` for custom animations
- Cache parsed colors to avoid repeated computation

## Color Formats

The system supports multiple color formats:

- HEX: `#ff0000` or `#f00`
- RGB: `{ r: 255, g: 0, b: 0 }`
- HSL: `{ h: 0, s: 100, l: 50 }`

## Accessibility

### Color Contrast

Ensure text remains readable during color transitions:

```tsx
// Use high contrast combinations
<ColorMorph
  fromColor="#000000"
  toColor="#333333"
  property="color"
>
  <span className="bg-white">Always readable text</span>
</ColorMorph>
```

### Reduced Motion

Users who prefer reduced motion will see instant transitions instead of animations. This is handled automatically by all components.

## Troubleshooting

### Flash of Wrong Color

If you see a flash during theme transitions, ensure your CSS transitions match the JavaScript duration:

```css
* {
  transition-property: color, background-color, border-color;
  transition-duration: 300ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Performance Issues

If animations are janky:

1. Reduce the number of animated elements
2. Use `will-change: background-color` sparingly
3. Lower the frame rate for complex animations
4. Use CSS-only animations where possible

## API Reference

### Color Interpolator

- `parseColor(color: string): RGB` - Parse HEX to RGB
- `rgbToHex(rgb: RGB): string` - Convert RGB to HEX
- `rgbToHsl(rgb: RGB): HSL` - Convert RGB to HSL
- `hslToRgb(hsl: HSL): RGB` - Convert HSL to RGB
- `interpolateColor(color1, color2, t, options?): string` - Interpolate between colors
- `interpolateGradient(stops[], t, options?): string` - Multi-stop gradient
- `animateColor(from, to, duration, onUpdate, options?): () => void` - Animate color change

### Theme Transition

- `ThemeTransition` - Wrapper for smooth theme switching
- `ThemeSwitchButton` - Button that triggers theme change
- `ThemeAware` - Theme-aware wrapper component

### Color Morph

- `ColorMorph` - Generic color morphing wrapper
- `MorphingBadge` - Badge with state-based color morphing
- `MorphingProgress` - Progress bar with color morphing
- `MorphingTextGradient` - Text with animated gradient
- `useColorMorph` - Hook for color morphing state

### Gradient Animation

- `AnimatedGradient` - Generic animated gradient
- `AuroraGradient` - Aurora-like effect
- `MeshGradient` - Complex mesh gradient
- `ShimmerGradient` - Shimmer loading effect
- `ConicSpinner` - Rotating conic gradient
- `useAnimatedGradient` - Hook for gradient state
- `useMousePosition` - Hook for mouse tracking
