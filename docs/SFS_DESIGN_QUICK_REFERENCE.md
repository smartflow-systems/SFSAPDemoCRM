# SFS Design System Quick Reference

**Print this. Tape it to your desk. Live by it.**

---

## 🎨 COLORS (Use ONLY These)

```
Primary Gold      #FFD700  →  bg-sfs-gold
Gold Hover        #E6C200  →  hover:bg-sfs-gold-hover
Primary Black     #0D0D0D  →  text-sfs-black bg-sfs-black
Primary Brown     #3B2F2F  →  bg-sfs-brown text-sfs-brown
Light Beige       #F5F5DC  →  bg-sfs-beige
White             #FFFFFF  →  bg-white
```

**Semantic:**
- Success: `text-green-600`
- Error: `text-red-600`
- Warning: `text-yellow-600`
- Info: `text-blue-600`

---

## 📐 SPACING (4px Grid)

```
4px   = p-1, m-1
8px   = p-2, m-2
12px  = p-3, m-3
16px  = p-4, m-4
24px  = p-6, m-6
32px  = p-8, m-8
48px  = p-12, m-12
64px  = p-16, m-16
```

**Quick pattern:** `gap-4 sm:gap-6 lg:gap-8`

---

## 🔤 TYPOGRAPHY

| Type | Size | Weight | Class |
|---|---|---|---|
| H1 | 3.5rem | 700 | font-bold text-4xl |
| H2 | 2.5rem | 700 | font-bold text-3xl |
| H3 | 1.875rem | 600 | font-semibold text-2xl |
| Body | 1rem | 400 | text-base |
| Small | 0.875rem | 400 | text-sm |
| Caption | 0.75rem | 400 | text-xs |

**Font:** Inter (sans) or Monaco (mono)

---

## ⚡ COMPONENT TEMPLATE

```typescript
import { cva } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const componentVariants = cva('base classes', {
  variants: {
    variant: { primary: 'bg-sfs-gold', secondary: 'bg-sfs-brown' },
    size: { sm: 'p-2', md: 'p-4', lg: 'p-6' },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});

export const Component = React.forwardRef(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(componentVariants({ variant, size, className }))}
      {...props}
    />
  )
);
```

---

## 📱 RESPONSIVE BREAKPOINTS

```
Mobile (xs)    ← DESIGN HERE FIRST
  ↓ 640px
Tablet (sm)
  ↓ 768px
Tablet L (md)
  ↓ 1024px
Desktop (lg)
  ↓ 1280px
Wide (xl)
  ↓ 1536px
Ultra-wide (2xl)
```

**Pattern:** `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

---

## 🧩 ICON USAGE

```typescript
import { CheckCircle, AlertTriangle, Calendar } from 'lucide-react';

// Default size: 24px
<CheckCircle size={24} className="text-sfs-gold" />

// In container (for emphasis):
<div className="flex items-center justify-center w-12 h-12 rounded-lg bg-sfs-gold">
  <CheckCircle size={24} className="text-sfs-black" />
</div>
```

**Sizes:** sm(16) md(24) lg(32) xl(48)

---

## ✨ GLASSMORPHISM CARD

```typescript
<div className="
  bg-white/70
  backdrop-blur-glass
  border border-sfs-gold/10
  rounded-lg
  shadow-glass
  hover:shadow-glass-lg
  transition-all
">
  {/* Content */}
</div>
```

---

## ✅ BEFORE YOU COMMIT

- [ ] No hardcoded colors (use Tailwind classes)
- [ ] No inline styles (use Tailwind utilities)
- [ ] Responsive design works (test on mobile/tablet/desktop)
- [ ] Accessibility: keyboard nav, focus states, ARIA labels
- [ ] TypeScript: no `any` types
- [ ] Tests written (>80% coverage)
- [ ] `npm run build` passes
- [ ] No console errors
- [ ] Component documented with JSDoc

---

## 🚀 COMMON COMMANDS

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run tests
npm run lint         # Check code quality
npm run health       # Health check
npm run figma:sync   # Sync with Figma
git push origin main # Deploy via CI/CD
```

---

## 🔗 KEYBOARD SHORTCUTS

| Action | Keys |
|---|---|
| Focus next | Tab |
| Focus prev | Shift + Tab |
| Activate button | Enter / Space |
| Close dialog | Escape |
| Submit form | Enter |

---

## 💾 FILE NAMING

```
Components:   PascalCase.tsx     (Button.tsx)
Hooks:        camelCase.ts       (useAuth.ts)
Utilities:    camelCase.ts       (formatDate.ts)
Types:        PascalCase.ts      (User.ts)
Tests:        *.test.tsx         (Button.test.tsx)
Styles:       globals.css        (global entry)
```

---

## 🐛 QUICK FIXES

**Colors not showing?**
```bash
npm run build  # Rebuild Tailwind
```

**Build failing?**
```bash
npm run lint  # Fix linting
npx tsc --noEmit  # Check types
```

**Component not responsive?**
```
Add: sm:class md:class lg:class
```

**Focus visible off?**
```
Add: focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sfs-gold
```

---

## 📞 QUICK LINKS

- **Design System Docs:** SFS_DESIGN_SYSTEM_RULES.md
- **Cursor Rules:** SFS_CURSOR_RULES.md
- **Figma Integration:** SFS_FIGMA_MCP_INTEGRATION.md
- **Tailwind Docs:** https://tailwindcss.com/docs
- **Radix UI:** https://www.radix-ui.com/
- **Lucide Icons:** https://lucide.dev/

---

**Version 1.0 | Last Updated: Jan 16, 2025**

*Keep this in your IDE. Reference it. Learn it. Live it.*
