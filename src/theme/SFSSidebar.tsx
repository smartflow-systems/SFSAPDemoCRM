/**
 * ============================================================================
 * SFS SIDEBAR - React Component
 * ============================================================================
 * GitHub-style collapsible sidebar navigation for React/TypeScript apps
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import './sfs-sidebar.css';

interface SidebarItem {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  badge?: string | number;
  submenu?: SidebarItem[];
  onClick?: () => void;
}

interface SFSSidebarProps {
  logo?: {
    icon: string | React.ReactNode;
    text: string;
    href?: string;
  };
  items: SidebarItem[];
  user?: {
    name: string;
    role: string;
    avatar?: string | React.ReactNode;
    onClick?: () => void;
  };
  defaultCollapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

export const SFSSidebar: React.FC<SFSSidebarProps> = ({
  logo,
  items,
  user,
  defaultCollapsed = false,
  onToggle,
  showSearch = false,
  onSearch,
}) => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sfs-sidebar-collapsed');
      return saved ? saved === 'true' : defaultCollapsed;
    }
    return defaultCollapsed;
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());
  const [activeItem, setActiveItem] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save collapsed state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sfs-sidebar-collapsed', collapsed.toString());
    }
    onToggle?.(collapsed);
  }, [collapsed, onToggle]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + B to toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        handleToggle();
      }

      // Escape to close mobile sidebar
      if (e.key === 'Escape' && isMobile && mobileOpen) {
        setMobileOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, mobileOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen, isMobile]);

  const handleToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const toggleSubmenu = (itemId: string) => {
    setOpenSubmenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const renderIcon = (icon: string | React.ReactNode) => {
    if (typeof icon === 'string') {
      return <span dangerouslySetInnerHTML={{ __html: icon }} />;
    }
    return icon;
  };

  const renderItem = (item: SidebarItem, level = 0) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isSubmenuOpen = openSubmenus.has(item.id);
    const isActive = activeItem === item.id;

    return (
      <div key={item.id}>
        {item.href ? (
          <a
            href={item.href}
            className={`sfs-sidebar-item ${isActive ? 'active' : ''} ${hasSubmenu ? 'has-submenu' : ''} ${isSubmenuOpen ? 'open' : ''}`}
            onClick={(e) => {
              if (hasSubmenu) {
                e.preventDefault();
                toggleSubmenu(item.id);
              } else {
                setActiveItem(item.id);
                if (isMobile) setMobileOpen(false);
                item.onClick?.();
              }
            }}
          >
            {item.icon && (
              <span className="sfs-sidebar-item-icon">
                {renderIcon(item.icon)}
              </span>
            )}
            <span className="sfs-sidebar-item-text">{item.label}</span>
            {item.badge && (
              <span className="sfs-sidebar-item-badge">{item.badge}</span>
            )}
            {hasSubmenu && (
              <span className="sfs-sidebar-item-chevron">›</span>
            )}
          </a>
        ) : (
          <div
            className={`sfs-sidebar-item ${hasSubmenu ? 'has-submenu' : ''} ${isSubmenuOpen ? 'open' : ''}`}
            onClick={() => {
              if (hasSubmenu) {
                toggleSubmenu(item.id);
              } else {
                item.onClick?.();
              }
            }}
          >
            {item.icon && (
              <span className="sfs-sidebar-item-icon">
                {renderIcon(item.icon)}
              </span>
            )}
            <span className="sfs-sidebar-item-text">{item.label}</span>
            {item.badge && (
              <span className="sfs-sidebar-item-badge">{item.badge}</span>
            )}
            {hasSubmenu && (
              <span className="sfs-sidebar-item-chevron">›</span>
            )}
          </div>
        )}

        {hasSubmenu && (
          <div className={`sfs-sidebar-submenu ${isSubmenuOpen ? 'open' : ''}`}>
            {item.submenu!.map(subItem => renderItem(subItem, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const sidebarClasses = [
    'sfs-sidebar',
    collapsed && !isMobile ? 'collapsed' : '',
    mobileOpen && isMobile ? 'open' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      {/* Sidebar */}
      <aside className={sidebarClasses}>
        {/* Header */}
        <div className="sfs-sidebar-header">
          {logo && (
            <a href={logo.href || '/'} className="sfs-sidebar-logo">
              <div className="sfs-sidebar-logo-icon">
                {renderIcon(logo.icon)}
              </div>
              <span>{logo.text}</span>
            </a>
          )}

          <button
            className={`sfs-sidebar-toggle ${(mobileOpen || !collapsed) ? 'active' : ''}`}
            onClick={handleToggle}
            aria-label="Toggle sidebar"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Search */}
        {showSearch && (
          <div className="sfs-sidebar-search">
            <input
              type="text"
              className="sfs-sidebar-search-input"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        )}

        {/* Navigation */}
        <nav className="sfs-sidebar-nav">
          {items.map(item => {
            // Section header
            if (item.submenu && !item.href) {
              return (
                <div key={item.id} className="sfs-sidebar-section">
                  <div className="sfs-sidebar-section-title">
                    {item.label}
                  </div>
                  {item.submenu.map(subItem => renderItem(subItem))}
                </div>
              );
            }

            // Regular item
            return renderItem(item);
          })}
        </nav>

        {/* User Footer */}
        {user && (
          <div className="sfs-sidebar-footer">
            <div
              className="sfs-sidebar-user"
              onClick={user.onClick}
            >
              <div className="sfs-sidebar-user-avatar">
                {user.avatar || user.name.charAt(0).toUpperCase()}
              </div>
              <div className="sfs-sidebar-user-info">
                <div className="sfs-sidebar-user-name">{user.name}</div>
                <div className="sfs-sidebar-user-role">{user.role}</div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Overlay */}
      {isMobile && (
        <div
          className={`sfs-sidebar-overlay ${mobileOpen ? 'active' : ''}`}
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
};

export default SFSSidebar;
