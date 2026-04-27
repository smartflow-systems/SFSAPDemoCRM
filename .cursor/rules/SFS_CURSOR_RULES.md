# SFS Design System Rules for AI Development
# Location: .cursor/rules/sfs_design_system.md
# Purpose: Guide AI assistants (Claude, Cursor) in maintaining design system compliance

## 🎨 BRAND IDENTITY

**Color Palette (Use ONLY these):**
- Primary Black: `#0D0D0D` (backgrounds, text emphasis)
- Primary Brown: `#3B2F2F` (secondary UI, borders)
- Primary Gold: `#FFD700` (interactive, highlights)
- Gold Hover: `#E6C200` (gold interactive state)
- Beige: `#F5F5DC` (light backgrounds, cards)
- White: `#FFFFFF` (content areas)

**In Tailwind:** Use custom classes: `bg-sfs-gold`, `text-sfs-black`, `border-sfs-brown`

**Glassmorphism Always:** Cards/modals should use: `bg-white/70 backdrop-blur-glass border border-sfs-gold/10 rounded-lg shadow-glass`

---

## ⚙️ TECH STACK (Non-negotiable)

- **Framework:** React 18.x/19.x + TypeScript 5.x
- **Styling:** Tailwind CSS 3.x (utility-first ONLY)
- **Components:** Radix UI primitives + Lucide React icons
- **Build:** Vite (frontend) / FastAPI (backend)
- **Icons:** lucide-react, 24px default size
- **Type-safety:** All data shapes must have TypeScript interfaces

---

## 📐 SPACING & SIZING

**Grid basis: 4px multiples**
```
Spacing: 4, 8, 12, 16, 24, 32, 48, 64px
Padding: p-1 (4px) → p-16 (64px)
Margin: m-1 → m-16
Gap: gap-1 → gap-16

Responsive gap:
gap-4 sm:gap-6 lg:gap-8
```

**Breakpoints (Tailwind defaults):**
- xs (mobile): 0px
- sm (tablet portrait): 640px
- md (tablet landscape): 768px
- lg (desktop): 1024px
- xl (wide): 1280px
- 2xl (ultra-wide): 1536px

Mobile-first approach ALWAYS.

---

## ✅ COMPONENT RULES

### When Creating Components:

1. **Must use class-variance-authority (CVA) for variants**
   ```typescript
   const buttonVariants = cva('base-classes', {
     variants: { variant: { primary: '...', secondary: '...' } }
   });
   ```

2. **Must accept `className` prop and merge with `cn()`**
   ```typescript
   className={cn(buttonVariants({ variant, size }), className)}
   ```

3. **Must be TypeScript with proper interfaces**
   ```typescript
   interface ComponentProps extends React.HTMLAttributes<HTMLElement> {
     variant?: 'primary' | 'secondary';
   }
   ```

4. **Must have proper focus states for accessibility**
   ```
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sfs-gold
   ```

5. **Must support disabled/loading states**
   ```
   disabled:opacity-50 disabled:cursor-not-allowed
   ```

6. **Must be responsive by default**
   - Always use mobile-first (implicit xs breakpoint)
   - Add sm:, md:, lg: variants for larger screens

### Icon Usage:
- Import from `lucide-react`
- Default size: 24px
- Never hardcode: use size parameter
- Always wrap in colored container for emphasis
  ```typescript
  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-sfs-gold">
    <Icon size={24} />
  </div>
  ```

### Colors:
- ❌ Never hardcode: `background-color: '#FFD700'`
- ✅ Always use Tailwind: `bg-sfs-gold`
- Use semantic colors for alerts: `text-red-600`, `bg-green-100`, `border-yellow-500`

---

## 📁 FILE STRUCTURE (Required Pattern)

```
src/
├── components/
│   ├── Common/           # Shared primitives (Button, Card, Input, etc.)
│   ├── Layout/           # Page layouts (Container, Grid, Flex)
│   ├── Features/         # Feature-specific (domain-based organization)
│   └── Icons/            # Custom icon wrappers
├── hooks/                # Custom React hooks (useAuth, useFetch, etc.)
├── services/             # API clients, external integrations
├── types/                # TypeScript definitions
├── utils/                # Utility functions
├── constants/            # Application constants
├── styles/
│   ├── globals.css       # Global styles
│   ├── animations.css    # Reusable animations
│   └── tokens/           # Design token definitions
└── app.tsx               # Root component
```

**Naming conventions:**
- Components: `PascalCase.tsx` (Button.tsx, UserCard.tsx)
- Hooks: `camelCase.ts` (useAuth.ts, useFetch.ts)
- Services: `camelCase.ts` (authService.ts, apiClient.ts)
- Types: `PascalCase.ts` (User.ts, Config.ts)
- Utils: `camelCase.ts` (formatDate.ts, validators.ts)
- Tests: `*.test.ts` or `*.spec.ts`

---

## 🚀 RESPONSIVE DESIGN PATTERN

**ALWAYS mobile-first:**

```typescript
<div className="
  grid grid-cols-1         // Mobile base
  sm:grid-cols-2           // Tablet
  lg:grid-cols-3           // Desktop
  gap-4 sm:gap-6 lg:gap-8  // Responsive gaps
  px-4 sm:px-6 lg:px-8     // Responsive padding
">
  {/* Content */}
</div>
```

**Dark mode support (when applicable):**
```
bg-white dark:bg-dark-bg
text-sfs-black dark:text-dark-text
border-gray-200 dark:border-gray-800
```

---

## 🔍 ACCESSIBILITY REQUIREMENTS

- [ ] Semantic HTML: `<button>` not `<div>` for buttons
- [ ] ARIA labels where needed: `aria-label`, `aria-describedby`
- [ ] Keyboard navigation: Tab, Enter, Escape all work
- [ ] Focus indicators: Visible outline on all interactive elements
- [ ] Color contrast: 4.5:1 minimum for text (WCAG AA)
- [ ] Form labels: Every input has associated `<label>`
- [ ] Images: All `<img>` tags have descriptive `alt` text
- [ ] Lists: Use `<ul>`, `<ol>`, `<li>` for list content

---

## 🧪 TESTING REQUIREMENTS

**Minimum expectations:**
- Unit tests for utility functions: 100% coverage
- Component tests for interactive elements: >80% coverage
- Integration tests for user flows: Smoke tests minimum
- E2E tests for critical paths: Booking, checkout, etc.

**Testing tools:**
- Framework: Vitest or Jest
- DOM testing: @testing-library/react
- E2E: Playwright or Cypress

**Required test patterns:**
```typescript
// src/components/Button/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('respects disabled state', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

## 🎨 FIGMA → CODE WORKFLOW (MCP Ready)

**Design source of truth:** Figma file "SFS Design System"

**Sync points:**
1. **Token updates** → Auto-sync to `src/styles/tokens/figma-exported.ts`
2. **Component changes** → Alert via MCP server
3. **Color palette updates** → Regenerate Tailwind theme
4. **Typography specs** → Update `src/styles/tokens/typography.ts`

**Manual extraction template:**
```markdown
### From Figma Token: [Token Name]
- Value: #XXXXXX
- Usage: [component names]
- Tailwind class: [class name]
- Updated: [date]
```

---

## 🐛 COMMON MISTAKES TO AVOID

| ❌ Wrong | ✅ Correct | Reason |
|---|---|---|
| `background-color: '#FFD700'` | `bg-sfs-gold` | Maintainability, theming |
| `<div onClick={...}>` | `<button onClick={...}>` | Accessibility, semantics |
| `padding: 15px` | `p-4` (or p-3, p-5) | Consistency, 4px grid |
| Hard-coded colors | CSS variables / Tailwind | Design sync, dark mode |
| No loading state | Skeleton / spinner shown | UX, perceived performance |
| No error boundary | Error boundary wrapper | App stability |
| Magic numbers | Named constants | Maintainability |
| CSS-in-JS | Tailwind classes | Bundle size, performance |
| `any` types | Proper TypeScript | Type safety, IDE support |
| No tests | >80% coverage | Quality, regression prevention |

---

## 📋 PRE-COMMIT CHECKLIST

Before pushing code:

- [ ] All Tailwind classes (no inline styles)
- [ ] TypeScript strict mode passes
- [ ] No `any` types
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Accessibility check passed (keyboard nav, contrast)
- [ ] Tests written and passing (>80% new code)
- [ ] No console errors/warnings
- [ ] Linting passes (`npm run lint`)
- [ ] Color palette matches SFS brand
- [ ] Icons use Lucide React 24px default
- [ ] Component has proper prop documentation
- [ ] Dark mode support (if applicable)

---

## 🔗 INTEGRATION WITH MCP SERVERS

**Figma MCP Config Example:**
```json
{
  "name": "figma-sync",
  "description": "Sync Figma design tokens to codebase",
  "enabled": true,
  "config": {
    "figmaFileId": "YOUR_FILE_ID",
    "figmaAccessToken": "${FIGMA_TOKEN}",
    "exportPath": "src/styles/tokens/figma-exported.ts",
    "format": "typescript",
    "includeComponents": true
  }
}
```

**When creating components from Figma designs:**
1. Identify component in Figma
2. Note all variants (size, state, color)
3. Extract design tokens (colors, spacing, typography)
4. Create TypeScript component with CVA variants
5. Test responsive behavior
6. Add to component library index
7. Document in Storybook (if applicable)

---

## 📝 DOCUMENTATION REQUIREMENTS

Every component should have:

```typescript
/**
 * Button component with multiple variants
 * 
 * @example
 * <Button variant="primary" size="lg">
 *   Click me
 * </Button>
 * 
 * @param variant - Visual style: 'primary' | 'secondary' | 'ghost' | 'danger'
 * @param size - Button size: 'sm' | 'md' | 'lg'
 * @param children - Button content
 * @param disabled - Disables interaction
 */
export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', ...props }) => {
  // Implementation
};
```

---

## 🚨 CRITICAL RULES (Never Break These)

1. **Always use TypeScript** - No `any` types unless absolutely justified (with comment)
2. **Always use Tailwind** - No inline styles or CSS-in-JS
3. **Always mobile-first** - Design for 375px first, then expand
4. **Always accessible** - Keyboard nav, ARIA labels, semantic HTML
5. **Always test** - Minimum >80% coverage on new code
6. **Always document** - JSDoc comments on public APIs
7. **Always follow spacing grid** - Only 4px multiples
8. **Always use brand colors** - SFS palette only (no random colors)

---

## 🔄 CONTINUOUS IMPROVEMENT

**Monthly audit:**
- [ ] Review new component patterns
- [ ] Check for color compliance
- [ ] Audit bundle size
- [ ] Test accessibility across apps
- [ ] Update token documentation
- [ ] Review Figma file for design drift

**Quarterly review:**
- [ ] Major dependency updates
- [ ] Performance optimization review
- [ ] UX/design consistency audit
- [ ] Team feedback incorporation

---

**Version:** 1.0  
**Last Updated:** Jan 16, 2025  
**Maintained By:** SFS Engineering  
**Status:** Active - Enforce on all PRs
