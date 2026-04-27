/**
 * ============================================================================
 * SFS BG — SmartFlow Systems Animated Background
 * ============================================================================
 * Injects a gold particle network + twinkle effect as a fixed canvas.
 * Zero dependencies. Drop into any SFS repo.
 *
 * USAGE: <script src="sfs-kit/sfs-bg.js"></script>
 * ============================================================================
 */
(function () {
  'use strict';

  /* ---------- CONFIG (tweak these per repo) ---------- */
  var CONFIG = {
    nodeCount:          45,        // number of drifting nodes
    connectionDistance: 160,       // max px distance for lines
    nodeSpeed:          0.28,      // drift speed
    nodeRadius:         2.2,       // dot size (px)
    goldAlpha:          0.14,      // base opacity for lines
    sparkleCount:       60,        // static twinkling stars
    sparkleMaxRadius:   1.6,       // max sparkle size (px)
    sparkleSpeed:       0.008,     // twinkle pulsation speed
    mobileBreakpoint:   768,       // px — halve nodes below this
    pauseOnHide:        true,      // save CPU when tab hidden
  };
  /* --------------------------------------------------- */

  var canvas, ctx, nodes, sparkles, animId, running;
  var W = 0, H = 0;

  /* ---------- Utilities ---------- */
  function rand(min, max) { return min + Math.random() * (max - min); }

  /* ---------- Bootstrap ---------- */
  function init() {
    /* Create canvas */
    canvas = document.createElement('canvas');
    canvas.id = 'sfs-bg-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;';
    document.body.insertBefore(canvas, document.body.firstChild);
    ctx = canvas.getContext('2d');

    resize();
    buildNodes();
    buildSparkles();
    running = true;
    tick();

    window.addEventListener('resize', onResize);
    if (CONFIG.pauseOnHide) {
      document.addEventListener('visibilitychange', onVisibility);
    }
  }

  /* ---------- Resize ---------- */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  var resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resize();
      buildNodes();
      buildSparkles();
    }, 120);
  }

  /* ---------- Nodes (particle network) ---------- */
  function buildNodes() {
    var count = W < CONFIG.mobileBreakpoint
      ? Math.ceil(CONFIG.nodeCount / 2)
      : CONFIG.nodeCount;
    nodes = [];
    for (var i = 0; i < count; i++) {
      var angle = rand(0, Math.PI * 2);
      var speed = rand(CONFIG.nodeSpeed * 0.4, CONFIG.nodeSpeed);
      nodes.push({
        x:  rand(0, W),
        y:  rand(0, H),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
      });
    }
  }

  /* ---------- Sparkles (static twinkling stars) ---------- */
  function buildSparkles() {
    sparkles = [];
    var count = W < CONFIG.mobileBreakpoint
      ? Math.ceil(CONFIG.sparkleCount / 2)
      : CONFIG.sparkleCount;
    for (var i = 0; i < count; i++) {
      sparkles.push({
        x:     rand(0, W),
        y:     rand(0, H),
        r:     rand(0.3, CONFIG.sparkleMaxRadius),
        phase: rand(0, Math.PI * 2),
        speed: rand(CONFIG.sparkleSpeed * 0.5, CONFIG.sparkleSpeed * 1.5),
      });
    }
  }

  /* ---------- Animation loop ---------- */
  function tick() {
    if (!running) return;
    animId = requestAnimationFrame(tick);
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    var distSq, dx, dy, dist, alpha, i, j, n, s, other;
    var maxDistSq = CONFIG.connectionDistance * CONFIG.connectionDistance;

    /* — Twinkle sparkles — */
    for (i = 0; i < sparkles.length; i++) {
      s = sparkles[i];
      s.phase += s.speed;
      var brightness = 0.5 + 0.5 * Math.sin(s.phase);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * brightness, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,215,0,' + (brightness * 0.45) + ')';
      ctx.fill();
    }

    /* — Particle network — */
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];

      /* Move */
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;

      /* Connections */
      for (j = i + 1; j < nodes.length; j++) {
        other = nodes[j];
        dx = other.x - n.x;
        dy = other.y - n.y;
        distSq = dx * dx + dy * dy;
        if (distSq < maxDistSq) {
          dist  = Math.sqrt(distSq);
          alpha = (1 - dist / CONFIG.connectionDistance) * CONFIG.goldAlpha;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = 'rgba(255,215,0,' + alpha + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      /* Node dot */
      ctx.beginPath();
      ctx.arc(n.x, n.y, CONFIG.nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,215,0,' + (CONFIG.goldAlpha * 2.2) + ')';
      ctx.fill();
    }
  }

  /* ---------- Visibility ---------- */
  function onVisibility() {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(animId);
    } else {
      running = true;
      tick();
    }
  }

  /* ---------- Start ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ---------- Export (ESM / CJS) ---------- */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { init: init };
  }
})();
