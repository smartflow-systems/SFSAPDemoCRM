====================================================
 SFS UI KIT — SmartFlow Systems
 Version 1.0
====================================================

WHAT'S IN THIS FOLDER
----------------------
  sfs-ui.css   — Full design system (tokens, glass cards, layout,
                 buttons, forms, pricing cards, animations, etc.)
  sfs-bg.js    — Self-injecting animated gold particle/twinkle background
  sfs-nav.js   — Mobile nav toggle helper (optional)
  template.html— Ready-to-use page template showing all components
  README.txt   — This file


HOW TO ADD TO ANY REPO
-----------------------
1. Copy the sfs-kit/ folder into your project's public/ directory.

2. Add these TWO lines to every HTML page:

   In <head>:
     <link rel="stylesheet" href="sfs-kit/sfs-ui.css">

   Just before </body>:
     <script src="sfs-kit/sfs-bg.js"></script>

3. Use template.html as a starting point — duplicate it,
   rename it, and swap in your content.

That's it. Every page will have:
  • Black/Brown/Gold branding (#0D0D0D / #3B2F2F / #FFD700)
  • Inter font stack
  • Animated twinkle particle background
  • Glass cards, gold buttons, pricing cards, forms
  • Responsive layout at all screen sizes


DESIGN TOKENS (CSS Variables — use anywhere in your own CSS)
-------------------------------------------------------------
  --sfs-black:       #0D0D0D
  --sfs-brown:       #3B2F2F
  --sfs-gold:        #FFD700
  --sfs-gold-hover:  #E6C200
  --sfs-beige:       #F5F5DC
  --sfs-glass-bg:    rgba(59,47,47,0.65)
  --sfs-glass-blur:  blur(16px) saturate(180%)
  --sfs-glass-border:1px solid rgba(255,215,0,0.20)
  --sfs-font:        'Inter','Segoe UI',Roboto,...


KEY COMPONENTS
--------------
  Glass card:         <div class="sfs-card"> ... </div>
  Featured card:      <div class="sfs-card sfs-card-featured"> ... </div>
  Gold button:        <a class="sfs-btn sfs-btn-primary">...</a>
  Ghost button:       <a class="sfs-btn sfs-btn-ghost">...</a>
  Gold badge:         <span class="sfs-badge sfs-badge-gold">NEW</span>
  Section title:      <h2 class="sfs-section-title sfs-gold-text">...</h2>
  Grid (3 cols):      <div class="sfs-grid-3 sfs-stagger"> ... </div>
  Stagger animation:  Add class="sfs-stagger" to a grid wrapper
  Slide-up animation: Add class="sfs-animate-slide-up" to any element
  Gold gradient text: Add class="sfs-gold-text" to any heading


ADJUSTING THE BACKGROUND ANIMATION
------------------------------------
Edit the CONFIG object at the top of sfs-bg.js:
  nodeCount:          45    (more = denser network)
  connectionDistance: 160   (max line length in px)
  nodeSpeed:          0.28  (drift speed)
  goldAlpha:          0.14  (line transparency)
  sparkleCount:       60    (twinkling star dots)


CSP NOTES (if your server uses Content-Security-Policy)
--------------------------------------------------------
  sfs-bg.js and sfs-nav.js are fully external scripts — no inline JS.
  sfs-ui.css has no inline styles.
  The canvas element uses no event handler attributes.
  You only need:
    script-src 'self';
    style-src  'self';
  (Plus whatever your other scripts/styles require.)


====================================================
