/**
 * ============================================================================
 * SFS TAILWIND PRESET
 * ============================================================================
 * SmartFlow Systems design tokens for Tailwind CSS
 * Use this preset in all SFS apps to ensure consistent theming
 *
 * Usage in tailwind.config.js:
 * module.exports = {
 *   presets: [require('@smartflow-systems/design-system/tailwind.preset.js')],
 *   content: ['./src/**\/*.{js,jsx,ts,tsx}'],
 * }
 * ============================================================================
 */

module.exports = {
  theme: {
    extend: {
      colors: {
        // SmartFlow Core Colors
        'sf-black': '#0D0D0D',
        'sf-brown': '#3B2F2F',
        'sf-gold': '#FFD700',
        'sf-gold-hover': '#E6C200',
        'sf-gold-bright': '#ffdd00',
        'sf-beige': '#F5F5DC',
        'sf-white': '#FFFFFF',

        // Semantic naming
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        // Glass effects
        'glass': {
          DEFAULT: 'rgba(59, 47, 47, 0.4)',
          hover: 'rgba(59, 47, 47, 0.5)',
          active: 'rgba(59, 47, 47, 0.6)',
        },
      },

      backgroundColor: {
        'glass': 'rgba(59, 47, 47, 0.4)',
        'glass-hover': 'rgba(59, 47, 47, 0.5)',
        'glass-active': 'rgba(59, 47, 47, 0.6)',
      },

      backdropBlur: {
        'glass': '12px',
        'glass-strong': '20px',
      },

      borderColor: {
        'glass': 'rgba(255, 215, 0, 0.2)',
        'glass-hover': 'rgba(255, 215, 0, 0.35)',
        DEFAULT: 'hsl(var(--border))',
      },

      borderRadius: {
        lg: 'var(--sf-radius, 1rem)',
        md: 'calc(var(--sf-radius, 1rem) - 2px)',
        sm: 'calc(var(--sf-radius, 1rem) - 4px)',
      },

      boxShadow: {
        'glass': '0 8px 32px rgba(13, 13, 13, 0.37)',
        'glass-hover': '0 12px 48px rgba(255, 215, 0, 0.15)',
        'gold-glow': '0 0 20px rgba(255, 215, 0, 0.3)',
        'gold-glow-strong': '0 0 40px rgba(255, 215, 0, 0.5)',
      },

      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['Source Code Pro', 'SF Mono', 'Monaco', 'monospace'],
      },

      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },

      spacing: {
        'sidebar': 'var(--sidebar-width, 280px)',
        'sidebar-collapsed': 'var(--sidebar-collapsed-width, 60px)',
      },

      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'pulse-gold': 'pulseGold 1.5s ease-in-out infinite',
      },

      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        pulseGold: {
          '0%, 100%': {
            boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
          },
          '50%': {
            boxShadow: '0 4px 20px rgba(255, 215, 0, 0.5)',
          },
        },
      },
    },
  },
  plugins: [],
};
