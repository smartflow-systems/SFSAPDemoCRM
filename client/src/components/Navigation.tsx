import { Link, useLocation } from "wouter";
import { useCRM } from "@/contexts/CRMContext";
import NotificationCenter from "./Notifications/NotificationCenter";

export default function Navigation() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useCRM();

  if (!isAuthenticated) {
    return null;
  }

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", id: "dashboard" },
    { href: "/pipeline", label: "Pipeline", id: "pipeline" },
    { href: "/leads", label: "Leads", id: "leads" },
    { href: "/contacts", label: "Contacts", id: "contacts" },
    { href: "/accounts", label: "Accounts", id: "accounts" },
    { href: "/tasks", label: "Tasks", id: "tasks" },
    { href: "/reports", label: "Reports", id: "reports" },
    { href: "/users", label: "Users", id: "users" },
    { href: "/settings", label: "Settings", id: "settings" },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard" && (location === "/" || location === "/dashboard")) {
      return true;
    }
    return location === href;
  };

  return (
    <nav className="panel-dark border-b border-gold-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-gold-shine text-xl font-extrabold">Smart Flow Systems</div>
            <span className="text-gold-300 text-sm ml-2">CRM</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  className={`px-3 py-2 rounded-md font-semibold transition-colors ${
                    isActive(link.href)
                      ? "text-gold"
                      : "text-gold-300 hover:text-gold-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notification Center */}
            <NotificationCenter />

            <span className="text-gold-300 text-sm">{user?.fullName}</span>
            <button
              onClick={logout}
              className="btn-gold-ghost text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
