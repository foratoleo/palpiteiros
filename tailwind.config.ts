import type { Config } from "tailwindcss";

/**
 * Tailwind CSS Configuration
 *
 * Extended with design tokens from src/lib/design-tokens.ts
 * Apple + Material Design fusion
 */

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		// Colors - Shadcn/UI base + design tokens
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))',
  				// Light/dark variants
  				50: 'hsl(var(--primary-50))',
  				100: 'hsl(var(--primary-100))',
  				200: 'hsl(var(--primary-200))',
  				300: 'hsl(var(--primary-300))',
  				400: 'hsl(var(--primary-400))',
  				500: 'hsl(var(--primary-500))',
  				600: 'hsl(var(--primary-600))',
  				700: 'hsl(var(--primary-700))',
  				800: 'hsl(var(--primary-800))',
  				900: 'hsl(var(--primary-900))',
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			// Semantic colors
  			success: {
  				DEFAULT: 'hsl(var(--success))',
  				foreground: 'hsl(var(--success-foreground))',
  				light: 'hsl(var(--success-light))',
  				dark: 'hsl(var(--success-dark))',
  			},
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))',
  				light: 'hsl(var(--warning-light))',
  				dark: 'hsl(var(--warning-dark))',
  			},
  			danger: {
  				DEFAULT: 'hsl(var(--danger))',
  				foreground: 'hsl(var(--danger-foreground))',
  				light: 'hsl(var(--danger-light))',
  				dark: 'hsl(var(--danger-dark))',
  			},
  			info: {
  				DEFAULT: 'hsl(var(--info))',
  				foreground: 'hsl(var(--info-foreground))',
  				light: 'hsl(var(--info-light))',
  				dark: 'hsl(var(--info-dark))',
  			},
  			// Glassmorphism
  			glass: {
  				light: 'hsla(var(--glass-light))',
  				dark: 'hsla(var(--glass-dark))',
  				border: 'hsla(var(--glass-border))',
  			},
  		},
  		// Typography - Apple SF Pro inspired
  		fontFamily: {
  			sans: [
  				'var(--font-sans)',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'"SF Pro Display"',
  				'"SF Pro Text"',
  				'"Segoe UI"',
  				'Roboto',
  				'sans-serif'
  			],
  			mono: [
  				'var(--font-mono)',
  				'"SF Mono"',
  				'"Monaco"',
  				'"Cascadia Code"',
  				'monospace'
  			],
  			display: [
  				'var(--font-display)',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'"SF Pro Display"',
  				'sans-serif'
  			]
  		},
  		fontSize: {
  			// Base scale from design tokens
  			xs: ['var(--text-xs)', { lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-normal)' }],
  			sm: ['var(--text-sm)', { lineHeight: 'var(--leading-normal)', letterSpacing: 'var(--tracking-normal)' }],
  			base: ['var(--text-base)', { lineHeight: 'var(--leading-normal)', letterSpacing: 'var(--tracking-normal)' }],
  			lg: ['var(--text-lg)', { lineHeight: 'var(--leading-normal)', letterSpacing: 'var(--tracking-tight)' }],
  			xl: ['var(--text-xl)', { lineHeight: 'var(--leading-relaxed)', letterSpacing: 'var(--tracking-tight)' }],
  			'2xl': ['var(--text-2xl)', { lineHeight: 'var(--leading-relaxed)', letterSpacing: 'var(--tracking-tighter)' }],
  			'3xl': ['var(--text-3xl)', { lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tighter)' }],
  			'4xl': ['var(--text-4xl)', { lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tighter)' }],
  			'5xl': ['var(--text-5xl)', { lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tighter)' }],
  			'6xl': ['var(--text-6xl)', { lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tighter)' }],
  			'7xl': ['var(--text-7xl)', { lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tighter)' }],
  			'8xl': ['var(--text-8xl)', { lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tighter)' }],
  			'9xl': ['var(--text-9xl)', { lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tighter)' }],
  		},
  		fontWeight: {
  			hairline: 'var(--font-hairline)',
  			thin: 'var(--font-thin)',
  			light: 'var(--font-light)',
  			regular: 'var(--font-regular)',
  			medium: 'var(--font-medium)',
  			semibold: 'var(--font-semibold)',
  			bold: 'var(--font-bold)',
  			extrabold: 'var(--font-extrabold)',
  			black: 'var(--font-black)',
  		},
  		letterSpacing: {
  			tighter: 'var(--tracking-tighter)',
  			tight: 'var(--tracking-tight)',
  			normal: 'var(--tracking-normal)',
  			wide: 'var(--tracking-wide)',
  			wider: 'var(--tracking-wider)',
  			widest: 'var(--tracking-widest)',
  		},
  		lineHeight: {
  			none: 'var(--leading-none)',
  			tight: 'var(--leading-tight)',
  			snug: 'var(--leading-snug)',
  			normal: 'var(--leading-normal)',
  			relaxed: 'var(--leading-relaxed)',
  			loose: 'var(--leading-loose)',
  		},
  		// Spacing - 4px base unit
  		spacing: {
  			'0': '0',
  			px: '1px',
  			0.5: '0.125rem', // 2px
  			1: '0.25rem', // 4px
  			2: '0.5rem', // 8px
  			3: '0.75rem', // 12px
  			4: '1rem', // 16px
  			5: '1.25rem', // 20px
  			6: '1.5rem', // 24px
  			8: '2rem', // 32px
  			10: '2.5rem', // 40px
  			12: '3rem', // 48px
  			16: '4rem', // 64px
  			20: '5rem', // 80px
  			24: '6rem', // 96px
  			32: '8rem', // 128px
  			40: '10rem', // 160px
  			48: '12rem', // 192px
  			56: '14rem', // 224px
  			64: '16rem', // 256px
  			72: '18rem', // 288px
  			80: '20rem', // 320px
  			96: '24rem', // 384px
  		},
  		// Border Radius - Apple inspired
  		borderRadius: {
  			none: 'var(--radius-none)',
  			sm: 'var(--radius-sm)',
  			DEFAULT: 'var(--radius-base)',
  			md: 'var(--radius-md)',
  			lg: 'var(--radius-lg)',
  			xl: 'var(--radius-xl)',
  			'2xl': 'var(--radius-2xl)',
  			'3xl': 'var(--radius-3xl)',
  			full: 'var(--radius-full)',
  		},
  		// Elevation/Shadows - Material Design inspired with colored shadows
  		boxShadow: {
  			// Base elevation
  			0: 'var(--elevation-0)',
  			1: 'var(--elevation-1)',
  			2: 'var(--elevation-2)',
  			3: 'var(--elevation-3)',
  			4: 'var(--elevation-4)',
  			5: 'var(--elevation-5)',
  			6: 'var(--elevation-6)',
  			7: 'var(--elevation-7)',
  			8: 'var(--elevation-8)',
  			// Colored shadows
  			'primary-sm': 'var(--shadow-primary-sm)',
  			'primary-md': 'var(--shadow-primary-md)',
  			'primary-lg': 'var(--shadow-primary-lg)',
  			'primary-xl': 'var(--shadow-primary-xl)',
  			'success-sm': 'var(--shadow-success-sm)',
  			'success-md': 'var(--shadow-success-md)',
  			'success-lg': 'var(--shadow-success-lg)',
  			'danger-sm': 'var(--shadow-danger-sm)',
  			'danger-md': 'var(--shadow-danger-md)',
  			'danger-lg': 'var(--shadow-danger-lg)',
  			// Inner shadows
  			'inner-sm': 'var(--shadow-inner-sm)',
  			'inner-md': 'var(--shadow-inner-md)',
  			'inner-lg': 'var(--shadow-inner-lg)',
  			// Neon glow
  			'neon-blue': '0 0 5px theme(colors.blue.500), 0 0 20px theme(colors.blue.500)',
  			'neon-purple': '0 0 5px theme(colors.purple.500), 0 0 20px theme(colors.purple.500)',
  			'neon-pink': '0 0 5px theme(colors.pink.500), 0 0 20px theme(colors.pink.500)',
  			'neon-cyan': '0 0 5px theme(colors.cyan.500), 0 0 20px theme(colors.cyan.500)',
  		},
  		// Animation timing - Apple inspired
  		transitionTimingFunction: {
  			'linear': 'cubic-bezier(0, 0, 1, 1)',
  			'ease': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  			'ease-in': 'cubic-bezier(0.42, 0, 1, 1)',
  			'ease-out': 'cubic-bezier(0, 0, 0.58, 1)',
  			'ease-in-out': 'cubic-bezier(0.42, 0, 0.58, 1)',
  			// Apple curves
  			'apple': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  			'apple-in': 'cubic-bezier(0.42, 0, 1, 1)',
  			'apple-out': 'cubic-bezier(0, 0, 0.58, 1)',
  			// Spring
  			'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  			'spring-soft': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  			'spring-bouncy': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  			// Material
  			'material': 'cubic-bezier(0.4, 0, 0.2, 1)',
  			'material-decelerate': 'cubic-bezier(0, 0, 0.2, 1)',
  			'material-accelerate': 'cubic-bezier(0.4, 0, 1, 1)',
  			// Cinematic
  			'cinematic': 'cubic-bezier(0.22, 1, 0.36, 1)',
  			'dramatic': 'cubic-bezier(0.87, 0, 0.13, 1)',
  		},
  		transitionDuration: {
  			instant: '100ms',
  			fast: '150ms',
  			DEFAULT: '200ms',
  			normal: '300ms',
  			slow: '400ms',
  			slower: '500ms',
  			slowest: '700ms',
  		},
  		// Z-index scale
  		zIndex: {
  			base: '0',
  			dropdown: '1000',
  			sticky: '1020',
  			fixed: '1030',
  			overlay: '1040',
  			'modal-backdrop': '1050',
  			modal: '1060',
  			popover: '1070',
  			tooltip: '1080',
  			toast: '1090',
  		},
  		// Glassmorphism
  		backdropBlur: {
  			xs: 'blur(4px)',
  			sm: 'blur(8px)',
  			DEFAULT: 'blur(12px)',
  			md: 'blur(12px)',
  			lg: 'blur(16px)',
  			xl: 'blur(24px)',
  			'2xl': 'blur(40px)',
  		},
  		// Animation keyframes
  		keyframes: {
  			// Float animation
  			float: {
  				'0%, 100%': { transform: 'translateY(0)' },
  				'50%': { transform: 'translateY(-10px)' },
  			},
  			// Pulse glow
  			'pulse-glow': {
  				'0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' },
  				'50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(59, 130, 246, 0.3)' },
  			},
  			// Shimmer
  			shimmer: {
  				'0%': { backgroundPosition: '-1000px 0' },
  				'100%': { backgroundPosition: '1000px 0' },
  			},
  			// Spin
  			spin: {
  				'from': { transform: 'rotate(0deg)' },
  				'to': { transform: 'rotate(360deg)' },
  			},
  			// Ping
  			ping: {
  				'75%, 100%': { transform: 'scale(2)', opacity: '0' },
  			},
  			// Bounce
  			bounce: {
  				'0%, 100%': { transform: 'translateY(-5%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
  				'50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
  			},
  		},
  		animation: {
  			float: 'float 3s ease-in-out infinite',
  			'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
  			shimmer: 'shimmer 2s linear infinite',
  			spin: 'spin 1s linear infinite',
  			ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
  			bounce: 'bounce 1s infinite',
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
