/**
 * SFS Hamburger Menu - Vanilla JavaScript
 *
 * Comprehensive slide-in navigation menu for SmartFlow Systems static sites
 * No dependencies required - pure JavaScript and CSS
 */

(function() {
  'use strict';

  // Menu configuration for SmartFlowSite
  const menuSections = [
    {
      title: "Main Navigation",
      items: [
        { label: "Home", href: "/", icon: "home" },
        { label: "Projects", href: "#projects", icon: "briefcase" },
        { label: "Latest News", href: "#latest", icon: "newspaper" },
        { label: "Testimonials", href: "#testimonials", icon: "users" },
      ]
    },
    {
      title: "Our Projects",
      items: [
        { label: "AI Social Bot", href: "/projects/ai-bot.html", icon: "bot" },
        { label: "Booking System", href: "/projects/booking.html", icon: "calendar" },
        { label: "E-commerce Shops", href: "/projects/ecom.html", icon: "shopping-cart" },
        { label: "Websites", href: "/projects/websites.html", icon: "globe" },
      ]
    },
    {
      title: "Resources",
      items: [
        { label: "Blog", href: "/blog/", icon: "book" },
        { label: "Documentation", href: "/docs/", icon: "file-text" },
        { label: "Support", href: "/contact.html", icon: "help-circle" },
      ]
    },
    {
      title: "Get Started",
      items: [
        { label: "Pricing", href: "#pricing", icon: "dollar-sign" },
        { label: "Contact Us", href: "/contact.html", icon: "mail" },
      ]
    }
  ];

  // Simple icon set (using basic shapes/text)
  const icons = {
    'home': '🏠',
    'briefcase': '💼',
    'newspaper': '📰',
    'users': '👥',
    'bot': '🤖',
    'calendar': '📅',
    'shopping-cart': '🛒',
    'globe': '🌐',
    'book': '📚',
    'file-text': '📄',
    'help-circle': '❓',
    'dollar-sign': '💰',
    'mail': '✉️'
  };

  function createHamburgerMenu() {
    // Create hamburger button
    const button = document.createElement('button');
    button.id = 'sfs-hamburger-btn';
    button.className = 'sfs-hamburger-btn';
    button.setAttribute('aria-label', 'Toggle menu');
    button.innerHTML = `
      <span class="sfs-hamburger-icon">
        <span></span>
        <span></span>
        <span></span>
      </span>
    `;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'sfs-menu-overlay';
    overlay.className = 'sfs-menu-overlay';

    // Create sidebar
    const sidebar = document.createElement('nav');
    sidebar.id = 'sfs-menu-sidebar';
    sidebar.className = 'sfs-menu-sidebar';

    // Build sidebar content
    let sidebarHTML = `
      <div class="sfs-menu-header">
        <div class="sfs-menu-logo">
          <div class="sfs-logo-icon">⚡</div>
          <div>
            <div class="sfs-logo-text">SmartFlow Systems</div>
            <div class="sfs-logo-subtitle">Build. Automate. Sell.</div>
          </div>
        </div>
        <button class="sfs-menu-close" aria-label="Close menu">×</button>
      </div>
      <div class="sfs-menu-content">
    `;

    menuSections.forEach(section => {
      sidebarHTML += `
        <div class="sfs-menu-section">
          <h3 class="sfs-menu-section-title">${section.title}</h3>
          <ul class="sfs-menu-items">
      `;
      section.items.forEach(item => {
        const icon = icons[item.icon] || '•';
        const isActive = window.location.pathname === item.href || window.location.hash === item.href;
        sidebarHTML += `
          <li>
            <a href="${item.href}" class="sfs-menu-item ${isActive ? 'active' : ''}">
              <span class="sfs-menu-icon">${icon}</span>
              <span class="sfs-menu-label">${item.label}</span>
            </a>
          </li>
        `;
      });
      sidebarHTML += `
          </ul>
        </div>
      `;
    });

    sidebarHTML += `
      </div>
      <div class="sfs-menu-footer">
        <p>© ${new Date().getFullYear()} SmartFlow Systems</p>
      </div>
    `;

    sidebar.innerHTML = sidebarHTML;

    // Append to body
    document.body.appendChild(button);
    document.body.appendChild(overlay);
    document.body.appendChild(sidebar);

    // Event listeners
    const closeButton = sidebar.querySelector('.sfs-menu-close');

    function openMenu() {
      sidebar.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    button.addEventListener('click', openMenu);
    closeButton.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);

    // Close on link click
    const menuLinks = sidebar.querySelectorAll('.sfs-menu-item');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        setTimeout(closeMenu, 100);
      });
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) {
        closeMenu();
      }
    });
  }

  // Add styles
  function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Hamburger Button */
      .sfs-hamburger-btn {
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 1000;
        background: rgba(13, 13, 13, 0.9);
        border: 1px solid rgba(255, 215, 0, 0.3);
        border-radius: 8px;
        padding: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .sfs-hamburger-btn:hover {
        background: rgba(59, 47, 47, 0.9);
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
      }

      .sfs-hamburger-icon span {
        display: block;
        width: 24px;
        height: 2px;
        background: #FFD700;
        margin: 5px 0;
        transition: 0.3s;
      }

      /* Overlay */
      .sfs-menu-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
        z-index: 1100;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }

      .sfs-menu-overlay.open {
        opacity: 1;
        visibility: visible;
      }

      /* Sidebar */
      .sfs-menu-sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: 320px;
        background: linear-gradient(135deg, #0D0D0D 0%, #1a1a1a 100%);
        border-right: 1px solid rgba(255, 215, 0, 0.2);
        z-index: 1200;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
        display: flex;
        flex-direction: column;
        box-shadow: 4px 0 20px rgba(0, 0, 0, 0.5);
      }

      .sfs-menu-sidebar.open {
        transform: translateX(0);
      }

      /* Header */
      .sfs-menu-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid rgba(255, 215, 0, 0.2);
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%);
      }

      .sfs-menu-logo {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .sfs-logo-icon {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #FFD700 0%, #E6C200 100%);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
      }

      .sfs-logo-text {
        color: #FFD700;
        font-weight: 700;
        font-size: 14px;
      }

      .sfs-logo-subtitle {
        color: rgba(245, 245, 220, 0.6);
        font-size: 11px;
      }

      .sfs-menu-close {
        background: none;
        border: none;
        color: rgba(255, 215, 0, 0.7);
        font-size: 32px;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        line-height: 1;
        transition: color 0.3s ease;
      }

      .sfs-menu-close:hover {
        color: #FFD700;
      }

      /* Content */
      .sfs-menu-content {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
      }

      .sfs-menu-content::-webkit-scrollbar {
        width: 6px;
      }

      .sfs-menu-content::-webkit-scrollbar-track {
        background: rgba(59, 47, 47, 0.1);
      }

      .sfs-menu-content::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, #FFD700, #E6C200);
        border-radius: 3px;
      }

      /* Sections */
      .sfs-menu-section {
        margin-bottom: 24px;
      }

      .sfs-menu-section-title {
        color: rgba(255, 215, 0, 0.6);
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin: 0 0 8px 12px;
      }

      .sfs-menu-items {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      /* Menu Items */
      .sfs-menu-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 12px;
        color: rgba(245, 245, 220, 0.8);
        text-decoration: none;
        border-radius: 8px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .sfs-menu-item:hover {
        background: rgba(255, 215, 0, 0.1);
        color: #FFD700;
        padding-left: 16px;
      }

      .sfs-menu-item.active {
        background: rgba(255, 215, 0, 0.2);
        color: #FFD700;
        border-left: 2px solid #FFD700;
      }

      .sfs-menu-icon {
        font-size: 20px;
        width: 24px;
        text-align: center;
      }

      .sfs-menu-label {
        font-size: 14px;
        font-weight: 500;
      }

      /* Footer */
      .sfs-menu-footer {
        padding: 16px;
        border-top: 1px solid rgba(255, 215, 0, 0.2);
        text-align: center;
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, transparent 100%);
      }

      .sfs-menu-footer p {
        color: rgba(245, 245, 220, 0.4);
        font-size: 12px;
        margin: 0;
      }

      /* Mobile adjustments */
      @media (max-width: 768px) {
        .sfs-menu-sidebar {
          width: 280px;
        }

        .sfs-hamburger-btn {
          top: 15px;
          left: 15px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      addStyles();
      createHamburgerMenu();
    });
  } else {
    addStyles();
    createHamburgerMenu();
  }
})();
