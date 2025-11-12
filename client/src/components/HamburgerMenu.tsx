import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Menu,
  X,
  LayoutDashboard,
  GitBranch,
  Users,
  CheckSquare,
  User,
  Settings,
  Shield,
  BarChart3,
  HelpCircle,
  FileText,
  MessageCircle,
  Phone,
  LogOut
} from "lucide-react";
import { useCRM } from "@/contexts/CRMContext";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useCRM();

  const menuSections: MenuSection[] = [
    {
      title: "Main Navigation",
      items: [
        { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { id: "pipeline", label: "Pipeline", href: "/pipeline", icon: GitBranch },
        { id: "leads", label: "Leads", href: "/leads", icon: Users },
        { id: "tasks", label: "My Tasks", href: "/tasks", icon: CheckSquare },
      ],
    },
    {
      title: "User Profile & Settings",
      items: [
        { id: "profile", label: "My Profile", href: "/profile", icon: User },
        { id: "settings", label: "Settings", href: "/settings", icon: Settings },
      ],
    },
    {
      title: "Admin & System Tools",
      items: [
        { id: "admin", label: "Admin Panel", href: "/admin", icon: Shield },
        { id: "analytics", label: "Analytics", href: "/analytics", icon: BarChart3 },
        { id: "users", label: "User Management", href: "/admin/users", icon: Users },
      ],
    },
    {
      title: "Help & Resources",
      items: [
        { id: "help", label: "Help Center", href: "/help", icon: HelpCircle },
        { id: "docs", label: "Documentation", href: "/docs", icon: FileText },
        { id: "support", label: "Contact Support", href: "/support", icon: MessageCircle },
        { id: "contact", label: "Contact Us", href: "/contact", icon: Phone },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard" && (location === "/" || location === "/dashboard")) {
      return true;
    }
    return location === href;
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gold-300 hover:text-gold-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 rounded-md"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-in Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-brown-900 border-r border-gold-800/30 z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gold-800/30">
          <div className="flex items-center">
            <div className="text-gold-shine text-lg font-extrabold">Smart Flow Systems</div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-gold-300 hover:text-gold-100 transition-colors rounded-md"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-gold-800/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gold-600/20 border border-gold-500/30 flex items-center justify-center">
                <User className="h-5 w-5 text-gold-400" />
              </div>
              <div>
                <div className="text-gold-100 font-semibold text-sm">{user.fullName}</div>
                <div className="text-gold-400 text-xs">{user.email}</div>
              </div>
            </div>
          </div>
        )}

        {/* Menu Sections */}
        <div className="py-4">
          {menuSections.map((section, sectionIndex) => (
            <div key={section.title} className={sectionIndex > 0 ? "mt-6" : ""}>
              <div className="px-4 mb-2">
                <h3 className="text-gold-400 text-xs font-bold uppercase tracking-wider">
                  {section.title}
                </h3>
              </div>
              <div className="space-y-1 px-2">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={handleLinkClick}
                    >
                      <a
                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors ${
                          active
                            ? "bg-gold-600/20 text-gold-100 border-l-2 border-gold-500"
                            : "text-gold-300 hover:bg-gold-600/10 hover:text-gold-100"
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${active ? "text-gold-400" : ""}`} />
                        <span className="font-medium text-sm">{item.label}</span>
                      </a>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-gold-800/30 mt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gold-600/10 hover:bg-gold-600/20 text-gold-300 hover:text-gold-100 rounded-md transition-colors border border-gold-800/30"
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 text-center">
          <p className="text-gold-500 text-xs">
            © 2024 Smart Flow Systems
          </p>
        </div>
      </div>
    </>
  );
}
