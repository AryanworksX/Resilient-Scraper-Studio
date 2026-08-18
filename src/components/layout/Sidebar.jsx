import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  HeartPulse,
  Radar,
  Menu,
  X,
  Zap,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Package },
  { to: "/scraper-health", label: "Scraper Health", icon: HeartPulse },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/products") {
      return location.pathname.startsWith("/products");
    }
    return location.pathname === path;
  };

  const sidebarContent = (
    <>
      {/* Logo Header */}
      <div className="px-6 pt-6 pb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-teal flex items-center justify-center shadow-md shadow-accent-teal/20">
            <Radar className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-text-primary">
            Radar
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">
          Main Menu
        </p>
        <div className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200 group relative
                  ${
                    active
                      ? "bg-accent-teal text-white shadow-md shadow-accent-teal/25"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                  }
                `}
              >
                <Icon
                  className={`w-5 h-5 ${
                    active ? "text-white" : "text-text-muted group-hover:text-text-primary"
                  }`}
                />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Bottom Promo & Status Card */}
      <div className="px-4 pb-6 space-y-4">
        {/* Upgrade / Hackathon Card */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-accent-teal to-accent-teal-hover text-white shadow-lg shadow-accent-teal/20">
          <div className="relative z-10">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
              <Zap className="w-4 h-4 text-amber-300" />
            </div>
            <p className="text-xs font-bold tracking-wide uppercase text-teal-100">
              Scrape-Verse
            </p>
            <p className="text-sm font-semibold mt-0.5 text-white">
              Self-Healing Radar
            </p>
            <p className="text-[11px] text-teal-100/90 mt-1">
              Hackathon 2026 Edition
            </p>
          </div>
          {/* Decorative background circle */}
          <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10 blur-xl pointer-events-none" />
        </div>

        {/* System Status Indicator */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-bg-elevated border border-border">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse-soft" />
          <span className="text-xs font-medium text-text-secondary">
            Collectors Operational
          </span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white border border-border shadow-sm lg:hidden"
        id="sidebar-toggle"
      >
        <Menu className="w-5 h-5 text-text-primary" />
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col fixed left-0 top-0 bottom-0 w-[250px] bg-white border-r border-border z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[270px] bg-white border-r border-border z-50 flex flex-col lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:bg-bg-elevated"
              >
                <X className="w-5 h-5 text-text-primary" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
