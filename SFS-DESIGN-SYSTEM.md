# SmartFlow Systems Design System

**Version:** 1.0.0
**Aesthetic:** Sparkling gold with dark marble brown-tinted black
**Inspiration:** Crickit flow dashboard with smooth curves and gold accents

---

## 📦 Files Included

- `sfs-theme-config.json` - Design tokens in JSON format (for JavaScript/TypeScript projects)
- `sfs-globals.css` - CSS variables and utility classes (for all web projects)

---

## 🎨 Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Black** | `#0D0D0D` | Primary background (marble black) |
| **Brown** | `#3B2F2F` | Surface overlays, tints, accents |
| **Gold** | `#FFD700` | Primary accent (sparkling gold) |
| **Gold Hover** | `#E6C200` | Interactive gold hover state |
| **Beige** | `#F5F5DC` | Text on dark backgrounds |
| **White** | `#FFFFFF` | Highlights and emphasis |

---

## 🔮 Glassmorphism Styles

### Card Style
- **Backdrop Blur:** 12px
- **Background:** `rgba(59, 47, 47, 0.4)` (semi-transparent brown)
- **Border:** `1px solid rgba(255, 215, 0, 0.15)` (subtle gold tint)
- **Shadow:** `0 8px 32px 0 rgba(13, 13, 13, 0.37)`
- **Hover Shadow:** `0 12px 48px 0 rgba(255, 215, 0, 0.15)` (gold glow)

### Panel Style
- **Backdrop Blur:** 16px
- **Background:** `rgba(13, 13, 13, 0.7)` (darker, more opaque)
- **Border:** `1px solid rgba(255, 215, 0, 0.25)`

---

## 📐 Layout Tokens

### Spacing Scale
- `xs` → 4px
- `sm` → 8px
- `md` → 16px
- `lg` → 24px
- `xl` → 32px
- `2xl` → 48px
- `3xl` → 64px

### Border Radius
- `sm` → 4px
- `md` → 8px
- `lg` → 12px
- `xl` → 16px
- `2xl` → 24px
- `round` → 50%
- `flow` → 16px 4px (Crickit-inspired smooth curves)

### Shadows
- `sm` → Subtle depth
- `md` → Standard elevation
- `lg` → Prominent depth
- `xl` → Maximum elevation
- `goldGlow` → Soft gold ambient glow
- `goldGlowStrong` → Intense gold glow for active states
- `inner` → Inset shadow for depth

### Dashboard Layout
- **Grid Gap:** 24px
- **Card Padding:** 24px
- **Header Height:** 64px
- **Sidebar Width:** 280px
- **Content Max Width:** 1400px

---

## ✨ Crickit-Inspired Flow Dashboard

### Curves (Easing Functions)
- `smooth` → `cubic-bezier(0.4, 0, 0.2, 1)` - Standard smooth transitions
- `bounce` → `cubic-bezier(0.68, -0.55, 0.265, 1.55)` - Playful bounce effect
- `flow` → `cubic-bezier(0.45, 0.05, 0.55, 0.95)` - Smooth flow motion

### Transitions
- `fast` → 150ms
- `normal` → 250ms
- `slow` → 350ms

### Gold Accents
- **Highlight Background:** Linear gradient with gold tint
- **Active Indicator:** Solid gold with strong glow
- **Flow Lines:** 2px gold stroke with drop shadow (for connecting elements)

---

## 🚀 Usage Instructions

### For Web Projects (HTML/CSS/JS)

#### 1. Import CSS at the root of your project

**In HTML:**
```html
<link rel="stylesheet" href="./sfs-globals.css">
```

**In CSS:**
```css
@import url('./sfs-globals.css');
```

**In JavaScript/React:**
```javascript
import './sfs-globals.css';
```

#### 2. Use CSS Variables
```css
.my-component {
  background: var(--sfs-glass-bg);
  color: var(--sfs-text);
  border-radius: var(--sfs-radius-lg);
  box-shadow: var(--sfs-shadow-lg);
}
```

#### 3. Use Utility Classes
```html
<!-- Glass card -->
<div class="sfs-glass-card">
  <h2>Sparkling Dashboard</h2>
</div>

<!-- Flow-inspired card -->
<div class="sfs-flow-card">
  <p>Crickit-style smooth curves</p>
</div>

<!-- Primary button -->
<button class="sfs-btn-primary">Get Started</button>

<!-- Ghost button -->
<button class="sfs-btn-ghost">Learn More</button>
```

---

### For React/Next.js Projects

#### 1. Import at the root layout or _app
```javascript
// app/layout.tsx or pages/_app.tsx
import '../sfs-globals.css';
```

#### 2. Use with Tailwind (optional)
Extend your `tailwind.config.js`:
```javascript
const sfsTheme = require('./sfs-theme-config.json');

module.exports = {
  theme: {
    extend: {
      colors: {
        'sfs-black': sfsTheme.colors.brand.black.value,
        'sfs-brown': sfsTheme.colors.brand.brown.value,
        'sfs-gold': sfsTheme.colors.brand.gold.value,
        // ... add more as needed
      },
      spacing: sfsTheme.layout.spacing,
      borderRadius: sfsTheme.layout.borderRadius,
    },
  },
};
```

#### 3. Use JSON tokens in JavaScript
```javascript
import sfsTheme from './sfs-theme-config.json';

const cardStyle = {
  background: sfsTheme.glassmorphism.card.background.default,
  backdropFilter: `blur(${sfsTheme.glassmorphism.card.backdrop.blur})`,
  borderRadius: sfsTheme.layout.borderRadius.lg,
};
```

---

### For React Native Projects

#### Use JSON tokens directly
```javascript
import sfsTheme from './sfs-theme-config.json';

const styles = StyleSheet.create({
  card: {
    backgroundColor: sfsTheme.colors.brand.brown.value + '66', // Add alpha
    borderRadius: parseInt(sfsTheme.layout.borderRadius.lg),
    padding: parseInt(sfsTheme.layout.spacing.lg),
  },
});
```

---

### For Vue/Nuxt Projects

#### 1. Import in main entry
```javascript
// main.js or nuxt.config.js
import './sfs-globals.css';
```

#### 2. Use in components
```vue
<style scoped>
.dashboard-card {
  background: var(--sfs-glass-bg);
  backdrop-filter: blur(var(--sfs-glass-blur));
  border: 1px solid var(--sfs-glass-border);
}
</style>
```

---

### For Angular Projects

#### 1. Import in global styles
```css
/* src/styles.css */
@import './sfs-globals.css';
```

#### 2. Use in components
```scss
// component.scss
.card {
  background: var(--sfs-glass-bg);
  border-radius: var(--sfs-radius-lg);
}
```

---

## 🎯 Example Components

### Glass Card Component (React)
```jsx
const GlassCard = ({ children, className = '' }) => (
  <div className={`sfs-glass-card ${className}`}>
    {children}
  </div>
);
```

### Flow Dashboard Grid (HTML)
```html
<div class="sfs-dashboard-grid">
  <div class="sfs-flow-card">Card 1</div>
  <div class="sfs-flow-card">Card 2</div>
  <div class="sfs-flow-card">Card 3</div>
</div>
```

### Styled Component (React + styled-components)
```javascript
import styled from 'styled-components';

const FlowCard = styled.div`
  background: var(--sfs-glass-bg);
  backdrop-filter: blur(var(--sfs-glass-blur));
  border: 1px solid var(--sfs-glass-border);
  border-radius: var(--sfs-radius-flow);
  padding: var(--sfs-card-padding);
  transition: all var(--sfs-transition-normal) var(--sfs-curve-flow);

  &:hover {
    background: var(--sfs-glass-bg-hover);
    box-shadow: var(--sfs-shadow-gold);
    transform: translateY(-2px);
  }
`;
```

---

## 📋 Integration Checklist

When starting a new SFS project:

- [ ] Copy `sfs-theme-config.json` and `sfs-globals.css` to your project
- [ ] Import `sfs-globals.css` at the root level
- [ ] Update README with design system reference
- [ ] Configure build tools to include design files
- [ ] Test glassmorphism rendering in target browsers
- [ ] Verify gold accent colors display correctly
- [ ] Implement responsive breakpoints
- [ ] Add custom utility classes as needed

---

## 🎨 Design Principles

1. **Dark & Luxurious:** Black marble base with brown tints creates depth
2. **Sparkling Accents:** Gold highlights draw attention to key interactions
3. **Glass Morphism:** Semi-transparent surfaces with blur create layered depth
4. **Smooth Flows:** Crickit-inspired curves and transitions feel organic
5. **Consistent Spacing:** 8px base grid maintains visual rhythm
6. **Accessible Contrast:** Beige/white text ensures readability on dark surfaces

---

## 🔄 Versioning

This design system follows semantic versioning:
- **Major:** Breaking changes to token names or values
- **Minor:** New tokens or non-breaking additions
- **Patch:** Bug fixes or documentation updates

---

## 🤝 Contributing

When updating the design system:
1. Update both JSON and CSS files simultaneously
2. Increment version number in all files
3. Document changes in project CHANGELOG
4. Test across all active SFS projects
5. Update usage examples if API changes

---

## 📞 Support

For design system questions or updates, contact the SFS design team or open an issue in the SmartFlow Systems design system repository.

---

**Last Updated:** 2025-11-01
**Maintained By:** SmartFlow Systems Design Team
