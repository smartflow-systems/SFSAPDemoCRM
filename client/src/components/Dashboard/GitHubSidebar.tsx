import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { X, Menu, LayoutDashboard, GitBranch, Users, Building2, ListTodo, BarChart3, UserCircle, Settings } from 'lucide-react';
import { useCRM } from '@/contexts/CRMContext';

export default function GitHubSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useCRM();

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Pipeline', href: '/pipeline', icon: GitBranch },
    { label: 'Leads', href: '/leads', icon: Users },
    { label: 'Contacts', href: '/contacts', icon: UserCircle },
    { label: 'Accounts', href: '/accounts', icon: Building2 },
    { label: 'Tasks', href: '/tasks', icon: ListTodo },
    { label: 'Reports', href: '/reports', icon: BarChart3 },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard' && (location === '/' || location === '/dashboard')) {
      return true;
    }
    return location === href;
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-5 left-5 z-50 p-2.5 bg-[#0D0D0D] rounded hover:bg-[#3B2F2F] transition-colors"
        aria-label="Toggle Menu"
      >
        <Menu className="w-6 h-6 text-[#FFD700]" />
      </button>

      {/* Overlay */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black/70 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      />

      {/* Sidebar */}
      <nav
        className={`fixed top-0 left-0 h-screen w-[300px] bg-[#0D0D0D] text-[#F5F5DC] z-50 flex flex-col overflow-y-auto transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-[#FFD700] hover:text-[#E6C200] transition-colors"
          aria-label="Close Menu"
        >
          <X className="w-8 h-8" />
        </button>

        {/* Header */}
        <div className="pt-16 px-5 pb-5 border-b border-[#3B2F2F]">
          <h2 className="text-[#FFD700] text-xl font-semibold">
            SmartFlow Systems
          </h2>
        </div>

        {/* Menu Items */}
        <ul className="flex-grow py-5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 py-4 px-5 border-l-[3px] transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-[#3B2F2F] border-[#FFD700] text-[#FFD700] pl-7'
                      : 'border-transparent text-[#F5F5DC] hover:bg-[#3B2F2F] hover:pl-7 hover:border-[#FFD700]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Footer - User Info & Logout */}
        <div className="p-5 border-t border-[#3B2F2F]">
          <div className="mb-3">
            <p className="text-[#FFD700] text-sm font-semibold">{user?.fullName}</p>
            <p className="text-[#F5F5DC]/70 text-xs">{user?.email}</p>
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="block w-full py-3 px-4 bg-[#FFD700] text-[#0D0D0D] text-center font-semibold rounded hover:bg-[#E6C200] transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>
    </>
  );
}
