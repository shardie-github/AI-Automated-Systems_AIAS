/**
 * Motion & Transition System
 * 
 * Standardized motion constants and utilities for consistent animations
 * across the AI Automated Systems platform.
 * 
 * All animations respect prefers-reduced-motion for accessibility.
 */

// Duration constants (in milliseconds)
export const motionDurations = {
  instant: 0,
  fast: 100,
  quick: 150,
  standard: 200,
  moderate: 250,
  slow: 300,
  slower: 400,
  slowest: 500,
} as const;

// Easing curves (CSS cubic-bezier values)
export const motionEasing = {
  // Standard easing
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  // Smooth entrance (ease-out)
  enter: 'cubic-bezier(0.0, 0, 0.2, 1)',
  // Smooth exit (ease-in)
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
  // Sharp entrance
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
} as const;

// Framer Motion transition presets
export const motionTransitions = {
  // Micro-interactions (hover, focus)
  micro: {
    duration: motionDurations.fast / 1000,
    ease: motionEasing.standard,
  },
  // Standard transitions (buttons, cards)
  standard: {
    duration: motionDurations.standard / 1000,
    ease: motionEasing.standard,
  },
  // Page transitions
  page: {
    duration: motionDurations.slow / 1000,
    ease: motionEasing.enter,
  },
  // Entrance animations
  entrance: {
    duration: motionDurations.moderate / 1000,
    ease: motionEasing.enter,
  },
  // Exit animations
  exit: {
    duration: motionDurations.standard / 1000,
    ease: motionEasing.exit,
  },
} as const;

// Scale values for interactions
export const motionScale = {
  hover: 1.02,
  hoverLarge: 1.05,
  active: 0.95,
  activeLarge: 0.98,
} as const;

// Translate values for lift effects
export const motionTranslate = {
  lift: -2,
  liftLarge: -4,
  liftXLarge: -8,
} as const;

// Opacity values
export const motionOpacity = {
  hidden: 0,
  visible: 1,
  disabled: 0.5,
  subtle: 0.6,
  muted: 0.8,
} as const;

// Common animation variants for Framer Motion
export const motionVariants = {
  // Fade in
  fadeIn: {
    hidden: { opacity: motionOpacity.hidden },
    visible: { 
      opacity: motionOpacity.visible,
      transition: motionTransitions.entrance,
    },
  },
  // Fade in up
  fadeInUp: {
    hidden: { 
      opacity: motionOpacity.hidden,
      y: 20,
    },
    visible: { 
      opacity: motionOpacity.visible,
      y: 0,
      transition: motionTransitions.entrance,
    },
  },
  // Fade in down
  fadeInDown: {
    hidden: { 
      opacity: motionOpacity.hidden,
      y: -20,
    },
    visible: { 
      opacity: motionOpacity.visible,
      y: 0,
      transition: motionTransitions.entrance,
    },
  },
  // Scale in
  scaleIn: {
    hidden: { 
      opacity: motionOpacity.hidden,
      scale: 0.95,
    },
    visible: { 
      opacity: motionOpacity.visible,
      scale: 1,
      transition: motionTransitions.entrance,
    },
  },
  // Slide in from left
  slideInLeft: {
    hidden: { 
      opacity: motionOpacity.hidden,
      x: -20,
    },
    visible: { 
      opacity: motionOpacity.visible,
      x: 0,
      transition: motionTransitions.entrance,
    },
  },
  // Slide in from right
  slideInRight: {
    hidden: { 
      opacity: motionOpacity.hidden,
      x: 20,
    },
    visible: { 
      opacity: motionOpacity.visible,
      x: 0,
      transition: motionTransitions.entrance,
    },
  },
} as const;

// Stagger children animation
export const staggerChildren = {
  hidden: { opacity: motionOpacity.hidden },
  visible: {
    opacity: motionOpacity.visible,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
} as const;

/**
 * Check if user prefers reduced motion
 * Use this to conditionally disable animations
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get transition config respecting reduced motion preference
 */
export const getTransition = (
  duration: number = motionDurations.standard,
  ease: string = motionEasing.standard
) => {
  if (prefersReducedMotion()) {
    return {
      duration: 0.01,
      ease: 'linear',
    };
  }
  return {
    duration: duration / 1000,
    ease,
  };
};

/**
 * CSS transition string for Tailwind/vanilla CSS
 */
export const cssTransition = (
  properties: string[] = ['all'],
  duration: number = motionDurations.standard,
  easing: string = motionEasing.standard
): string => {
  const durationMs = `${duration}ms`;
  return properties
    .map((prop) => `${prop} ${durationMs} ${easing}`)
    .join(', ');
};

/**
 * Common CSS transition classes
 */
export const transitionClasses = {
  // Standard transitions
  all: cssTransition(['all'], motionDurations.standard),
  colors: cssTransition(['color', 'background-color', 'border-color'], motionDurations.standard),
  opacity: cssTransition(['opacity'], motionDurations.quick),
  transform: cssTransition(['transform'], motionDurations.standard),
  shadow: cssTransition(['box-shadow'], motionDurations.standard),
  
  // Fast transitions
  fast: cssTransition(['all'], motionDurations.fast),
  
  // Slow transitions
  slow: cssTransition(['all'], motionDurations.slow),
} as const;

// Export types
export type MotionDuration = typeof motionDurations[keyof typeof motionDurations];
export type MotionEasing = typeof motionEasing[keyof typeof motionEasing];
