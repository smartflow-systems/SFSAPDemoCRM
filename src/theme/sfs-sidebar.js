/**
 * ============================================================================
 * SFS SIDEBAR - JavaScript Controller
 * ============================================================================
 * Handles sidebar toggle, collapse, mobile menu, and submenu interactions
 * Auto-initializes on DOM ready
 * ============================================================================
 */

class SFSSidebar {
  constructor(sidebarElement) {
    this.sidebar = sidebarElement;
    this.toggle = this.sidebar.querySelector('.sfs-sidebar-toggle');
    this.overlay = document.querySelector('.sfs-sidebar-overlay');
    this.mainContent = document.querySelector('.sfs-main-content');
    this.submenuToggles = this.sidebar.querySelectorAll('.sfs-sidebar-item.has-submenu');

    // State
    this.isCollapsed = localStorage.getItem('sfs-sidebar-collapsed') === 'true';
    this.isMobile = window.innerWidth <= 768;

    this.init();
  }

  init() {
    // Apply saved state
    if (this.isCollapsed && !this.isMobile) {
      this.sidebar.classList.add('collapsed');
    }

    // Event listeners
    this.attachEventListeners();

    // Set active item based on current URL
    this.setActiveItem();

    // Handle window resize
    this.handleResize();
  }

  attachEventListeners() {
    // Toggle button
    if (this.toggle) {
      this.toggle.addEventListener('click', () => this.toggleSidebar());
    }

    // Overlay click (mobile)
    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.closeMobileSidebar());
    }

    // Submenu toggles
    this.submenuToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        // Only toggle submenu if clicking the parent item, not the link
        if (e.target === toggle || e.target.classList.contains('sfs-sidebar-item-chevron')) {
          e.preventDefault();
          this.toggleSubmenu(toggle);
        }
      });
    });

    // Window resize
    window.addEventListener('resize', () => this.handleResize());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + B to toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        this.toggleSidebar();
      }

      // Escape to close mobile sidebar
      if (e.key === 'Escape' && this.isMobile) {
        this.closeMobileSidebar();
      }
    });
  }

  toggleSidebar() {
    if (this.isMobile) {
      this.toggleMobileSidebar();
    } else {
      this.toggleDesktopSidebar();
    }
  }

  toggleDesktopSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.sidebar.classList.toggle('collapsed');

    // Save state
    localStorage.setItem('sfs-sidebar-collapsed', this.isCollapsed);

    // Update toggle button state
    if (this.toggle) {
      this.toggle.classList.toggle('active', !this.isCollapsed);
    }
  }

  toggleMobileSidebar() {
    const isOpen = this.sidebar.classList.contains('open');

    if (isOpen) {
      this.closeMobileSidebar();
    } else {
      this.openMobileSidebar();
    }
  }

  openMobileSidebar() {
    this.sidebar.classList.add('open');
    if (this.overlay) {
      this.overlay.classList.add('active');
    }
    document.body.style.overflow = 'hidden';

    if (this.toggle) {
      this.toggle.classList.add('active');
    }
  }

  closeMobileSidebar() {
    this.sidebar.classList.remove('open');
    if (this.overlay) {
      this.overlay.classList.remove('active');
    }
    document.body.style.overflow = '';

    if (this.toggle) {
      this.toggle.classList.remove('active');
    }
  }

  toggleSubmenu(parentItem) {
    const submenu = parentItem.nextElementSibling;
    const isOpen = submenu.classList.contains('open');

    // Close all other submenus at the same level
    const siblings = parentItem.parentElement.querySelectorAll('.sfs-sidebar-submenu');
    siblings.forEach(sibling => {
      if (sibling !== submenu) {
        sibling.classList.remove('open');
        sibling.previousElementSibling.classList.remove('open');
      }
    });

    // Toggle current submenu
    if (isOpen) {
      submenu.classList.remove('open');
      parentItem.classList.remove('open');
    } else {
      submenu.classList.add('open');
      parentItem.classList.add('open');
    }
  }

  setActiveItem() {
    const currentPath = window.location.pathname;
    const allItems = this.sidebar.querySelectorAll('.sfs-sidebar-item[href]');

    allItems.forEach(item => {
      const href = item.getAttribute('href');

      if (href === currentPath || (href !== '/' && currentPath.startsWith(href))) {
        item.classList.add('active');

        // If item is in a submenu, open the parent
        const submenu = item.closest('.sfs-sidebar-submenu');
        if (submenu) {
          submenu.classList.add('open');
          submenu.previousElementSibling.classList.add('open');
        }
      } else {
        item.classList.remove('active');
      }
    });
  }

  handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 768;

    // Transitioning from mobile to desktop
    if (wasMobile && !this.isMobile) {
      this.closeMobileSidebar();

      // Restore collapsed state
      if (this.isCollapsed) {
        this.sidebar.classList.add('collapsed');
      }
    }

    // Transitioning from desktop to mobile
    if (!wasMobile && this.isMobile) {
      this.sidebar.classList.remove('collapsed');
      this.closeMobileSidebar();
    }
  }
}

// Auto-initialize on DOM ready
function initSFSSidebar() {
  const sidebar = document.querySelector('.sfs-sidebar');

  if (sidebar) {
    window.sfsSidebar = new SFSSidebar(sidebar);
    console.log('✅ SFS Sidebar initialized');
  } else {
    console.warn('⚠️ SFS Sidebar element not found. Add an element with class "sfs-sidebar" to use this component.');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSFSSidebar);
} else {
  initSFSSidebar();
}

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SFSSidebar, initSFSSidebar };
}
