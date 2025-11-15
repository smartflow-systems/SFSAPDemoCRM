/**
 * SFS Circuit Flow Animation
 * Creates a golden particle network animation with circuit-like connections
 * Version: 1.0.0
 */

(function() {
  'use strict';

  // Configuration (can be overridden by sfs-theme-config.json)
  let config = {
    particleCount: 80,
    speed: 0.3,
    lineWidth: 1,
    nodeRadius: 3,
    connectionDistance: 150,
    goldOpacity: 0.6,
    goldColor: '#FFD700',
    enabled: true
  };

  // Canvas and context
  let canvas, ctx;
  let particles = [];
  let animationId = null;
  let isVisible = true;

  // Particle class
  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * config.speed;
      this.vy = (Math.random() - 0.5) * config.speed;
      this.radius = config.nodeRadius;
      this.opacity = Math.random() * 0.5 + 0.5;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off edges
      if (this.x < 0 || this.x > canvas.width) {
        this.vx = -this.vx;
        this.x = Math.max(0, Math.min(canvas.width, this.x));
      }
      if (this.y < 0 || this.y > canvas.height) {
        this.vy = -this.vy;
        this.y = Math.max(0, Math.min(canvas.height, this.y));
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 215, 0, ${this.opacity * config.goldOpacity})`;
      ctx.fill();

      // Add glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = config.goldColor;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // Initialize canvas
  function initCanvas() {
    canvas = document.getElementById('sfs-circuit');
    if (!canvas) {
      console.warn('SFS Circuit Flow: Canvas element with id "sfs-circuit" not found');
      return false;
    }

    ctx = canvas.getContext('2d');
    resizeCanvas();

    // Set canvas styles
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-1';

    return true;
  }

  // Resize canvas to fill window
  function resizeCanvas() {
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Recreate particles on resize
    createParticles();
  }

  // Create particles
  function createParticles() {
    particles = [];
    for (let i = 0; i < config.particleCount; i++) {
      particles.push(new Particle(
        Math.random() * canvas.width,
        Math.random() * canvas.height
      ));
    }
  }

  // Draw connections between nearby particles
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < config.connectionDistance) {
          const opacity = (1 - distance / config.connectionDistance) * config.goldOpacity;

          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255, 215, 0, ${opacity * 0.3})`;
          ctx.lineWidth = config.lineWidth;
          ctx.stroke();
        }
      }
    }
  }

  // Animation loop
  function animate() {
    if (!isVisible || !config.enabled) {
      animationId = requestAnimationFrame(animate);
      return;
    }

    // Clear canvas with fade effect
    ctx.fillStyle = 'rgba(13, 13, 13, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });

    // Draw connections
    drawConnections();

    animationId = requestAnimationFrame(animate);
  }

  // Handle visibility change (pause when tab is hidden)
  function handleVisibilityChange() {
    isVisible = !document.hidden;
  }

  // Load configuration from JSON
  async function loadConfig() {
    try {
      const response = await fetch('/sfs-theme-config.json');
      if (response.ok) {
        const data = await response.json();
        if (data.theme && data.theme.circuitFlow) {
          config = { ...config, ...data.theme.circuitFlow };
        }
      }
    } catch (error) {
      console.warn('SFS Circuit Flow: Could not load config, using defaults');
    }
  }

  // Initialize
  async function init() {
    // Load config first
    await loadConfig();

    if (!config.enabled) {
      console.log('SFS Circuit Flow: Animation disabled in config');
      return;
    }

    // Initialize canvas
    if (!initCanvas()) {
      return;
    }

    // Create particles
    createParticles();

    // Start animation
    animate();

    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  // Cleanup function
  function cleanup() {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    window.removeEventListener('resize', resizeCanvas);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  }

  // Public API
  window.SFSCircuitFlow = {
    init,
    cleanup,
    setConfig: (newConfig) => {
      config = { ...config, ...newConfig };
      if (canvas) {
        createParticles();
      }
    },
    getConfig: () => ({ ...config }),
    pause: () => { config.enabled = false; },
    resume: () => { config.enabled = true; }
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
