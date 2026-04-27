import { Link, useLocation } from "wouter";
import { useCRM } from "@/contexts/CRMContext";
import HamburgerMenu from "./HamburgerMenu";

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
    { href: "/tasks", label: "My Tasks", id: "tasks" },
    { href: "/reports", label: "Reports", id: "reports" },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard" && (location === "/" || location === "/dashboard")) {
      return true;
    }
    return location === href;
  };

  return (
    <nav style={{
      background: 'linear-gradient(135deg, rgba(13,13,13,.8), rgba(59,47,47,.6))',
      backdropFilter: 'saturate(180%) blur(20px)',
      borderBottom: '1px solid rgba(255,215,0,.4)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Left — Hamburger + Logo */}
      <div className="flex items-center gap-3">
        <HamburgerMenu />
        <a className="brand" href="/">
          <img
            src="/sfs-kit/sfs-logo-nav.png"
            alt="SmartFlow Systems"
            className="nav-logo"
          />
        </a>
      </div>

      {/* Centre — Nav Links (desktop) */}
      <div className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.id}
            href={link.href}
            className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
              isActive(link.href)
                ? "text-[#FFD700]"
                : "text-[#F5F5DC] hover:text-[#FFD700]"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Right — User Menu (desktop) */}
      <div className="hidden md:flex items-center gap-3">
        <span className="text-sm" style={{ color: 'var(--sfs-beige)' }}>{user?.fullName}</span>
        <button
          onClick={logout}
          className="sfs-btn sfs-btn-ghost"
          style={{ padding: '6px 16px', fontSize: '0.85rem' }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
