/**
 * ============================================================================
 * SFS CIRCUIT FLOW - Animated Background for SmartFlow Systems
 * ============================================================================
 * Circuit board animation with golden nodes and connections
 * Optimized for performance with visibility detection
 *
 * INSTALLATION:
 * 1. Add to HTML: <canvas id="circuit-canvas"></canvas>
 * 2. Link CSS theme: <link rel="stylesheet" href="sfs-complete-theme.css">
 * 3. Initialize: <script src="sfs-circuit-flow.js"></script>
 *
 * OR call manually: initSFSCircuitFlow()
 *
 * Version: 2.0
 * Updated: 2025-11-02
 * ============================================================================
 */

function initSFSCircuitFlow() {
  const canvas = document.getElementById('circuit-canvas')
  if (!canvas) {
    console.warn('SFS Circuit Flow: Canvas element #circuit-canvas not found')
    return null
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    console.error('SFS Circuit Flow: Unable to get 2D context')
    return null
  }

  let animationId = null
  let isVisible = true

  // Set canvas size
  const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)

  // Circuit nodes
  const nodes = []
  const nodeCount = 35 // Optimized node count
  const connectionDistance = 150
  const connectionDistanceSq = connectionDistance * connectionDistance
  const goldAlpha = 0.15

  // Initialize nodes with random positions and velocities
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    })
  }

  // Pause animation when tab is hidden (saves CPU/battery)
  const handleVisibilityChange = () => {
    isVisible = !document.hidden
    if (isVisible && !animationId) {
      animate()
    }
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)

  // Animation loop - OPTIMIZED
  function animate() {
    if (!ctx || !canvas || !isVisible) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Update and draw nodes
    nodes.forEach((node, i) => {
      // Move node
      node.x += node.vx
      node.y += node.vy

      // Bounce off edges
      if (node.x < 0 || node.x > canvas.width) node.vx *= -1
      if (node.y < 0 || node.y > canvas.height) node.vy *= -1

      // Draw connections - OPTIMIZED: Use squared distance to avoid Math.sqrt()
      for (let j = i + 1; j < nodes.length; j++) {
        const other = nodes[j]
        const dx = other.x - node.x
        const dy = other.y - node.y
        const distanceSq = dx * dx + dy * dy

        if (distanceSq < connectionDistanceSq) {
          // Only calculate sqrt when needed for opacity
          const distance = Math.sqrt(distanceSq)
          const opacity = (1 - distance / connectionDistance) * goldAlpha
          ctx.strokeStyle = `rgba(255, 215, 0, ${opacity})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(other.x, other.y)
          ctx.stroke()
        }
      }

      // Draw node
      ctx.fillStyle = `rgba(255, 215, 0, ${goldAlpha * 2})`
      ctx.beginPath()
      ctx.arc(node.x, node.y, 2, 0, Math.PI * 2)
      ctx.fill()
    })

    animationId = requestAnimationFrame(animate)
  }

  animate()

  // Cleanup function to stop animation and remove listeners
  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
    window.removeEventListener('resize', resize)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSFSCircuitFlow)
} else {
  // DOM already loaded
  initSFSCircuitFlow()
}

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initSFSCircuitFlow }
}
