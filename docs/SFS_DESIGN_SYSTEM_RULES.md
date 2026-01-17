# SFS Design System Rules & Architecture

**Version:** 1.0 | **Last Updated:** Jan 2025 | **Scope:** All 26 SFS repositories

---

## 1. TOKEN DEFINITIONS

### Color Palette (Brand Standards)

```typescript
// Location: SmartFlowSite/src/styles/tokens/colors.ts
// Also mirrored in: tailwind.config.js as custom theme extensions

const SFS_COLORS = {
  // Primary brand colors
  primary: {
    black: '#0D0D0D',      // Dark backgrounds, text emphasis
    brown: '#3B2F2F',      // Secondary UI, borders, accents
    gold: '#FFD700',       // Interactive states, highlights
    goldHover: '#E6C200',  // Hover state for gold elements
    beige: '#F5F5DC',      // Light backgrounds, cards
    white: '#FFFFFF',      // Content areas, text
  },
  
  // Semantic colors
  semantic: {
    success: '#10B981',    // Alerts, confirmations
    error: '#EF4444',      // Errors, destructive actions
    warning: '#F59E0B',    // Warnings, cautions
    info: '#3B82F6',       // Informational states
  },
  
  // Transparency variants
  opacity: {
    black10: 'rgba(13, 13, 13, 0.1)',
    black20: 'rgba(13, 13, 13, 0.2)',
    black50: 'rgba(13, 13, 13, 0.5)',
    gold10: 'rgba(255, 215, 0, 0.1)',
    gold20: 'rgba(255, 215, 0, 0.2)',
  },
};

// Export for Tailwind
module.exports = {
  colors: {
    'sfs-black': '#0D0D0D',
    'sfs-brown': '#3B2F2F',
    'sfs-gold': '#FFD700',
    'sfs-gold-hover': '#E6C200',
    'sfs-beige': '#F5F5DC',
  }
};
```

### Typography Tokens

```typescript
// Location: SmartFlowSite/src/styles/tokens/typography.ts

const TYPOGRAPHY = {
  fontFamily: {
    sans: "'Inter', 'Segoe UI', 'Helvetica Neue', sans-serif",
    mono: "'Monaco', 'Courier New', monospace",
  },
  
  scale: {
    // Headings
    h1: { fontSize: '3.5rem', fontWeight: 700, lineHeight: 1.1 },
    h2: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 },
    h3: { fontSize: '1.875rem', fontWeight: 600, lineHeight: 1.3 },
    h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.5 },
    h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 },
    
    // Body text
    bodyLg: { fontSize: '1.125rem', fontWeight: 400, lineHeight: 1.6 },
    body: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.6 },
    bodySm: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.5 },
    
    // Labels & captions
    label: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.4 },
    caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.4 },
  },
};
```

### Spacing Scale

```typescript
// Location: tailwind.config.js (inherited by all repos)

const SPACING = {
  0: '0px',
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
};

// Grid basis: 4px (smallest unit), multiples of 4
// Use: 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64
```

### Shadow & Elevation System

```typescript
// Location: SmartFlowSite/src/styles/tokens/shadows.ts

const SHADOWS = {
  none: 'none',
  
  // Glassmorphism layers
  glass: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.1)',
    md: '0 4px 16px rgba(0, 0, 0, 0.12)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.15)',
    xl: '0 12px 48px rgba(0, 0, 0, 0.2)',
  },
  
  // Border emphasis
  border: {
    sm: '0 0 0 1px rgba(255, 215, 0, 0.2)',
    md: '0 0 0 2px rgba(255, 215, 0, 0.3)',
  },
  
  // Interactive feedback
  focus: '0 0 0 3px rgba(255, 215, 0, 0.3)',
  error: '0 0 0 2px rgba(239, 68, 68, 0.3)',
};
```

---

## 2. COMPONENT LIBRARY

### Architecture

**Location:** Component definitions distributed across repos per domain

| Repository | Component Scope |
|---|---|
| SmartFlowSite | Core UI primitives, layout, branding |
| SocialScaleBooster | Social feed, content cards, analytics |
| Barber-booker-v1 | Booking calendar, schedule components |
| sfs-white-label-dashboard | Dashboard grid, charts, tables |
| sfs-analytics-engine | Data visualization, metric cards |

### Component Structure Pattern

```typescript
// Standard SFS component structure (all repos follow this)
// Location example: SmartFlowSite/src/components/Button/Button.tsx

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn'; // Tailwind utility merger

const buttonVariants = cva(
  // Base styles (all buttons)
  'inline-flex items-center justify-center rounded-lg font-medium ' +
  'transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-sfs-gold text-sfs-black hover:bg-sfs-gold-hover shadow-md hover:shadow-lg',
        secondary: 'bg-sfs-brown text-sfs-white hover:bg-sfs-brown/90',
        ghost: 'text-sfs-black hover:bg-sfs-black/5',
        danger: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
);
Button.displayName = 'Button';
```

### Common Components (Across All Repos)

```
SmartFlowSite/src/components/
├── Button/
│   ├── Button.tsx
│   ├── Button.stories.tsx          # Storybook documentation
│   └── Button.test.tsx             # Unit tests
├── Card/
├── Input/
├── Select/
├── Modal/
├── Badge/
├── Loading/
├── Alert/
├── Navbar/
├── Sidebar/
└── Layout/
    ├── Container.tsx
    ├── Grid.tsx
    └── Flex.tsx
```

### Glassmorphism Pattern (SFS Signature Style)

```typescript
// Applied across all visual components for premium aesthetic
// Location: SmartFlowSite/src/styles/glassmorphism.css

.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 215, 0, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border-radius: 12px;
}

.glass-card:hover {
  border-color: rgba(255, 215, 0, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

/* Darker variant for dark-mode contexts */
.glass-card-dark {
  background: rgba(13, 13, 13, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 215, 0, 0.15);
  color: #F5F5DC;
}
```

---

## 3. FRAMEWORKS & LIBRARIES

### Core Stack (All Repos)

| Framework | Version | Usage |
|---|---|---|
| React | 18.x / 19.x | UI rendering |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Utility-first styling |
| Radix UI | Latest | Accessible primitives |
| class-variance-authority | Latest | Component variants |

### Build Systems & Bundlers

**Frontend Repos:**
```json
{
  "build": "vite build",
  "dev": "vite",
  "preview": "vite preview"
}
```

**Backend Repos (FastAPI):**
```bash
uvicorn main:app --reload  # Development
gunicorn -w 4 main:app     # Production
```

### Styling Framework Configuration

```javascript
// tailwind.config.js (master config in SmartFlowSite)
// Inherited by all frontend repos via shared config

module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './index.html',
  ],
  
  theme: {
    extend: {
      colors: {
        'sfs-black': '#0D0D0D',
        'sfs-brown': '#3B2F2F',
        'sfs-gold': '#FFD700',
        'sfs-gold-hover': '#E6C200',
        'sfs-beige': '#F5F5DC',
      },
      
      fontFamily: {
        sans: ["'Inter'", 'sans-serif'],
        mono: ["'Monaco'", 'monospace'],
      },
      
      backdropBlur: {
        glass: '10px',
      },
      
      boxShadow: {
        glass: '0 4px 16px rgba(0, 0, 0, 0.12)',
        'glass-lg': '0 8px 32px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

---

## 4. ASSET MANAGEMENT

### Directory Structure

```
/assets
├── /images
│   ├── /brand         # Logo, favicon, OG images
│   ├── /hero          # Landing page hero images
│   ├── /features      # Feature screenshots
│   ├── /social        # Social media assets
│   └── /illustrations # Custom SVG illustrations
├── /videos
│   ├── /demos         # Product demos
│   └── /tutorials     # Tutorial content
├── /documents
│   ├── /guides        # PDF guides
│   └── /whitepapers   # Technical documentation
└── /fonts
    ├── /inter         # Typography font files
    └── /mono          # Code font files
```

### Asset Optimization & CDN

```typescript
// Location: SmartFlowSite/src/utils/assetOptimizer.ts

// Image optimization: Next.js Image or equivalent
<Image
  src="/images/feature.webp"
  alt="Feature description"
  width={1200}
  height={630}
  quality={85}
  priority={false}
/>

// CDN Configuration (if applicable):
// CloudFront / Cloudinary prefix: https://cdn.smartflowsystems.com/
// Fallback to /public for self-hosted assets

// WebP conversion: All images should have .webp variants
// Naming: image.webp (primary), image.jpg (fallback)
```

### Asset Naming Convention

```
Convention: {domain}-{type}-{descriptor}-{variant}

Examples:
- sfs-logo-horizontal-light.svg
- barber-booking-hero-dark.webp
- social-feed-card-preview-mobile.png
- dashboard-chart-revenue-1200x630.png
```

---

## 5. ICON SYSTEM

### Icon Library

```typescript
// Location: All repos use Lucide React icons
// Installation: npm install lucide-react

import { 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  BarChart3,
  Users,
  Settings,
} from 'lucide-react';

// Icon sizing conventions:
// sm: 16px (labels, badges)
// md: 24px (buttons, nav items)
// lg: 32px (hero sections)
// xl: 48px+ (feature cards)

export const IconSizes = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};
```

### Icon Usage Pattern

```typescript
// SmartFlowSite/src/components/Feature/Feature.tsx

import { Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  variant?: 'light' | 'dark';
}

export const Feature: React.FC<FeatureProps> = ({
  icon,
  title,
  description,
  variant = 'light',
}) => {
  return (
    <div className={cn(
      'flex flex-col gap-3 p-6 rounded-lg',
      variant === 'light' ? 'bg-sfs-beige' : 'bg-sfs-black'
    )}>
      <div className={cn(
        'flex items-center justify-center w-12 h-12 rounded-lg',
        variant === 'light' 
          ? 'bg-sfs-gold text-sfs-black' 
          : 'bg-sfs-gold/20 text-sfs-gold'
      )}>
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

// Usage:
<Feature
  icon={<Calendar size={24} />}
  title="Smart Scheduling"
  description="AI-powered booking optimization"
/>
```

### Custom Icons (If Needed)

```
SmartFlowSite/src/components/Icons/
├── CustomIcon.tsx        # Icon wrapper component
├── SocialMediaIcons.tsx  # Social platform icons
└── BrandIcons.tsx        # Custom SFS icons (logo variants, etc.)

// Custom SVG pattern:
export const CustomIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    {/* SVG content */}
  </svg>
);
```

---

## 6. STYLING APPROACH

### CSS Methodology: Tailwind CSS + Utility-First

**All SFS repos follow utility-first Tailwind approach:**

```typescript
// ✅ PREFERRED: Utility classes
<div className="flex items-center justify-between p-4 bg-sfs-beige rounded-lg shadow-md">
  <span className="text-lg font-semibold text-sfs-black">Title</span>
  <button className="px-4 py-2 bg-sfs-gold rounded hover:bg-sfs-gold-hover transition">
    Action
  </button>
</div>

// ❌ AVOID: Inline styles or arbitrary CSS
<div style={{backgroundColor: '#F5F5DC', padding: '16px'}}>
```

### Global Styles

```css
/* Location: SmartFlowSite/src/styles/globals.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

/* Base element overrides */
@layer base {
  html {
    scroll-behavior: smooth;
  }
  
  body {
    @apply bg-white text-sfs-black font-sans;
  }
  
  h1, h2, h3, h4, h5, h6 {
    @apply font-bold text-sfs-black;
  }
  
  a {
    @apply text-sfs-gold hover:text-sfs-gold-hover transition;
  }
  
  button:focus-visible {
    @apply outline-none ring-2 ring-sfs-gold ring-offset-2;
  }
}

/* Component layer shortcuts */
@layer components {
  .btn-primary {
    @apply px-6 py-3 bg-sfs-gold text-sfs-black font-semibold rounded-lg 
           hover:bg-sfs-gold-hover transition-colors;
  }
  
  .card {
    @apply p-6 bg-white border border-gray-100 rounded-lg shadow-md;
  }
  
  .glass {
    @apply bg-white/70 backdrop-blur-glass border border-sfs-gold/10 rounded-lg shadow-glass;
  }
}
```

### Responsive Design

```typescript
// Breakpoint system (Tailwind defaults extended):
const BREAKPOINTS = {
  xs: '0px',      // Mobile
  sm: '640px',    // Tablet portrait
  md: '768px',    // Tablet landscape
  lg: '1024px',   // Desktop
  xl: '1280px',   // Wide desktop
  '2xl': '1536px' // Ultra-wide
};

// Usage pattern:
<div className="
  // Mobile-first (xs breakpoint is implicit)
  grid grid-cols-1 gap-4
  
  // Tablet
  sm:grid-cols-2 sm:gap-6
  
  // Desktop
  lg:grid-cols-3 lg:gap-8
  
  // Always responsive by default
">
  {/* Grid items */}
</div>
```

### Dark Mode Support

```typescript
// Location: SmartFlowSite/tailwind.config.js

module.exports = {
  darkMode: 'class', // Use class-based dark mode
  
  theme: {
    extend: {
      colors: {
        // Dark mode variants
        'dark-bg': '#0D0D0D',
        'dark-card': '#1A1A1A',
        'dark-text': '#F5F5DC',
      }
    }
  }
};

// Component usage:
<div className="bg-white dark:bg-dark-bg text-sfs-black dark:text-dark-text">
  {/* Content adapts to dark mode */}
</div>
```

---

## 7. PROJECT STRUCTURE

### Repository Organization Pattern

```
{repo-name}/
├── .github/
│   └── workflows/
│       ├── sfs-ci-deploy.yml       # Shared SFS CI/CD (sourced from SmartFlowSite@main)
│       └── tests.yml               # Unit/integration tests
├── src/
│   ├── components/                 # React components
│   │   ├── Common/                 # Shared UI primitives
│   │   ├── Layout/                 # Page layouts
│   │   ├── Features/               # Feature-specific components
│   │   └── {Domain}/               # Domain-specific components
│   ├── pages/ (or routes/)         # Page components / route definitions
│   ├── styles/
│   │   ├── globals.css             # Global styles
│   │   ├── tokens/                 # Design tokens
│   │   └── animations.css          # Reusable animations
│   ├── hooks/                      # Custom React hooks
│   ├── utils/                      # Utility functions
│   ├── services/                   # API clients, external integrations
│   ├── types/                      # TypeScript type definitions
│   ├── constants/                  # Application constants
│   └── app.tsx (or main.tsx)      # Entry point
├── public/                         # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
├── tests/                          # Test files (mirror src structure)
├── docs/                           # Project documentation
│   ├── AGENTS.md                   # AI agent guidance (for Claude/ChatGPT)
│   ├── ARCHITECTURE.md             # Technical architecture
│   └── CONTRIBUTING.md             # Contribution guidelines
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts (or similar)
└── README.md
```

### Feature Organization Pattern

```
src/features/{feature-name}/
├── components/
│   ├── {Feature}Card.tsx
│   ├── {Feature}Form.tsx
│   └── {Feature}List.tsx
├── hooks/
│   └── use{Feature}.ts
├── services/
│   └── {feature}Service.ts         # API calls for this feature
├── types/
│   └── {feature}.types.ts
├── utils/
│   └── {feature}Utils.ts
└── index.ts                        # Barrel export
```

### File Naming Conventions

```
Components:        PascalCase.tsx        (e.g., Button.tsx, UserCard.tsx)
Hooks:             camelCase.ts          (e.g., useAuth.ts, useFetch.ts)
Services:          camelCase.ts          (e.g., authService.ts, apiService.ts)
Types/Interfaces:  PascalCase.ts         (e.g., User.ts, Config.ts)
Utils:             camelCase.ts          (e.g., formatDate.ts, validators.ts)
Tests:             *.test.ts or *.spec.ts (e.g., Button.test.tsx)
Styles:            globals.css           (entry), domain-specific.css (optional)
```

---

## 8. DESIGN SYSTEM COMPLIANCE CHECKLIST

### For New Components

- [ ] Uses Tailwind CSS utility classes only
- [ ] Implements SFS brand colors (#0D0D0D, #3B2F2F, #FFD700, #F5F5DC)
- [ ] Includes TypeScript types/interfaces
- [ ] Has proper focus states for accessibility
- [ ] Supports responsive design (mobile-first)
- [ ] Includes loading/disabled states
- [ ] Has appropriate spacing (4px grid)
- [ ] Uses Lucide React icons (24px default)
- [ ] Follows glassmorphism pattern (if applicable)
- [ ] Includes unit tests (>80% coverage goal)
- [ ] Documented in Storybook (if complex)

### For New Pages/Features

- [ ] Uses existing component library
- [ ] Follows feature folder structure
- [ ] Includes AGENTS.md guidance
- [ ] Implements proper error boundaries
- [ ] Has loading states and skeletons
- [ ] Responsive on mobile, tablet, desktop
- [ ] Accessible (WCAG 2.1 AA minimum)
- [ ] Performance optimized (lazy loading, code splitting)

---

## 9. FIGMA → CODE INTEGRATION (MCP Ready)

### Figma Design File Structure (Recommended)

```
Figma File: "SFS Design System"
├── 📐 Colors & Tokens
│   ├── Brand Colors
│   ├── Semantic Colors
│   └── Opacity Variants
├── 🔤 Typography
│   ├── Heading Styles
│   ├── Body Styles
│   └── Label Styles
├── 📦 Components
│   ├── Buttons (all variants)
│   ├── Forms (inputs, selects, checkboxes)
│   ├── Cards
│   ├── Navigation
│   ├── Modals
│   └── Lists
├── 📱 Layouts
│   ├── Mobile Templates
│   ├── Tablet Templates
│   └── Desktop Templates
├── 🎨 Glassmorphism Library
│   ├── Glass Cards
│   ├── Glass Modals
│   └── Glass Navigation
└── 📚 Design Patterns
    ├── Error States
    ├── Loading States
    └── Empty States
```

### MCP Integration Points

**Via Figma MCP Server:**
1. Extract design tokens → Auto-generate Tailwind theme
2. Component designs → Generate TypeScript component stubs
3. Color updates → Automatic palette sync across repos
4. Typography specs → Auto-update font scale tokens

**Implementation:**
```bash
# In SmartFlowSite (source of truth):
npm install @figma/rest-api-client mcp

# MCP server config: .mcp/figma-design-sync.json
{
  "figmaFileId": "YOUR_FILE_ID",
  "tokenExportPath": "src/styles/tokens/figma-exported.ts",
  "componentIndexPath": "src/components/COMPONENT_INDEX.ts",
  "syncInterval": "manual" // or "on-pr"
}
```

---

## 10. QUICK REFERENCE: COMMON PATTERNS

### Building a Feature Component

```typescript
// Step 1: Define types
// src/features/booking/types/booking.types.ts
export interface BookingSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  available: boolean;
}

// Step 2: Create component
// src/features/booking/components/BookingCard.tsx
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

export const BookingCard: React.FC<{ slot: BookingSlot }> = ({ slot }) => (
  <Card className="p-4 flex justify-between items-center">
    <span className="text-sm font-semibold">
      {slot.startTime.toLocaleTimeString()}
    </span>
    <Button
      variant={slot.available ? 'primary' : 'ghost'}
      disabled={!slot.available}
    >
      Book Now
    </Button>
  </Card>
);

// Step 3: Add tests
// tests/features/booking/components/BookingCard.test.tsx
import { render, screen } from '@testing-library/react';
import { BookingCard } from '@/features/booking/components/BookingCard';

describe('BookingCard', () => {
  it('renders available slot', () => {
    const slot = { id: '1', startTime: new Date(), endTime: new Date(), available: true };
    render(<BookingCard slot={slot} />);
    expect(screen.getByText('Book Now')).not.toBeDisabled();
  });
});
```

### Adding Custom Colors

```typescript
// In tailwind.config.js:
theme: {
  extend: {
    colors: {
      'brand-custom': '#ABC123', // New color
    }
  }
}

// Usage:
<div className="bg-brand-custom text-white">Custom color</div>
```

### Creating Responsive Layouts

```typescript
// Mobile-first approach
<div className="
  grid grid-cols-1         // 1 column on mobile (xs)
  sm:grid-cols-2           // 2 columns on tablet (sm)
  lg:grid-cols-3           // 3 columns on desktop (lg)
  gap-4 sm:gap-6 lg:gap-8  // Responsive gap
  px-4 sm:px-6 lg:px-8     // Responsive padding
">
  {items.map(item => <Card key={item.id}>{item.name}</Card>)}
</div>
```

---

## 11. COMMON PITFALLS & SOLUTIONS

| Issue | Problem | Solution |
|---|---|---|
| Hard-coded colors | Not maintainable | Use Tailwind custom color tokens (sfs-gold, sfs-black, etc.) |
| Inconsistent spacing | Layout misalignment | Always use spacing scale: 4, 8, 12, 16, 24, 32, 48, 64 |
| Missing TypeScript | Runtime errors | Define interfaces for all data shapes |
| No loading states | Poor UX | Always show skeleton/loader during async operations |
| Accessibility ignored | WCAG violations | Always use semantic HTML, test with keyboard navigation |
| No dark mode support | Incomplete feature | Use dark: prefix for dark mode variants |
| Static component props | Brittle | Make components configurable via props + variants |
| Unused dependencies | Bloated bundle | Audit monthly with `npm audit` |

---

## 12. DEPLOYMENT & CI/CD INTEGRATION

### Shared CI/CD Workflow

```yaml
# File: .github/workflows/sfs-ci-deploy.yml
# Source: SmartFlowSite@main (all repos reference this)

name: SFS Build & Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Build
        run: npm run build
      
      - name: Test
        run: npm test -- --coverage
      
      - name: Health Check
        run: npm run health
      
      - name: Deploy
        if: github.ref == 'refs/heads/main'
        run: |
          git config user.name "SFS Bot"
          git config user.email "bot@smartflowsystems.com"
          npm run deploy
```

### Health Check Endpoint

```typescript
// All SFS apps must have: GET /health

// Express/Node:
app.get('/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// FastAPI:
@app.get('/health')
def health():
  return {'ok': True}

// React (via API):
export const checkHealth = async (baseUrl: string) => {
  const res = await fetch(`${baseUrl}/health`);
  return res.json();
};
```

---

## 13. RESOURCES & DOCUMENTATION

- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **Radix UI Components:** https://www.radix-ui.com/
- **React Best Practices:** https://react.dev/
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/
- **Lucide Icons:** https://lucide.dev/
- **Accessibility (A11y):** https://www.w3.org/WAI/WCAG21/quickref/

---

## 14. VERSION HISTORY

| Version | Date | Changes |
|---|---|---|
| 1.0 | Jan 2025 | Initial comprehensive design system rules for SFS ecosystem |

---

**Last Reviewed:** Jan 16, 2025  
**Maintained By:** SFS Design & Engineering Team  
**Status:** Active - Follow for all new development
