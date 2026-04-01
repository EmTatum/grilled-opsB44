import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Package, StickyNote, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/orders", label: "Upcoming Orders", icon: ShoppingCart },
  { path: "/inventory", label: "Inventory", icon: Package },
  { path: "/notes", label: "Client Notes", icon: StickyNote },
];

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background font-body flex">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-50 top-0 left-0 h-full w-64 flex flex-col transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ background: "#0d0d0d", borderRight: "1px solid hsl(40 20% 14%)" }}
      >
        {/* Logo area */}
        <div className="px-7 py-8" style={{ borderBottom: "1px solid hsl(40 20% 12%)" }}>
          <div className="mb-1">
            <span
              className="font-display font-bold tracking-luxury uppercase"
              style={{ fontSize: "22px", color: "hsl(40 57% 54%)", letterSpacing: "0.22em" }}
            >
              GRILLED
            </span>
          </div>
          <div
            className="tracking-luxury uppercase"
            style={{ fontSize: "9px", color: "hsl(36 10% 45%)", letterSpacing: "0.28em" }}
          >
            Operations Suite
          </div>
          {/* Gold line accent */}
          <div className="mt-4 h-px w-8" style={{ background: "hsl(40 57% 54% / 0.5)" }} />
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm transition-all duration-200 uppercase tracking-wide ${
                  isActive
                    ? "text-primary"
                    : "text-sidebar-foreground hover:text-foreground"
                }`}
                style={
                  isActive
                    ? {
                        background: "hsl(40 57% 54% / 0.08)",
                        border: "1px solid hsl(40 57% 54% / 0.22)",
                        letterSpacing: "0.1em",
                      }
                    : {
                        border: "1px solid transparent",
                        letterSpacing: "0.1em",
                      }
                }
              >
                <item.icon
                  size={15}
                  strokeWidth={isActive ? 1.5 : 1.2}
                  style={{ color: isActive ? "hsl(40 57% 54%)" : "hsl(36 10% 48%)" }}
                />
                <span style={{ fontSize: "11px", fontFamily: "Inter, sans-serif" }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-7 py-5" style={{ borderTop: "1px solid hsl(40 20% 12%)" }}>
          <p
            className="tracking-luxury uppercase"
            style={{ fontSize: "8px", color: "hsl(36 10% 35%)", letterSpacing: "0.2em" }}
          >
            Grilled.inc © 2026
          </p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile header */}
        <header
          className="lg:hidden flex items-center justify-between px-5 py-4"
          style={{ background: "#0d0d0d", borderBottom: "1px solid hsl(40 20% 12%)" }}
        >
          <span
            className="font-display font-bold tracking-luxury uppercase"
            style={{ fontSize: "17px", color: "hsl(40 57% 54%)", letterSpacing: "0.22em" }}
          >
            GRILLED
          </span>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="transition-colors"
            style={{ color: "hsl(36 10% 55%)" }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </header>

        <main className="flex-1 p-5 md:p-10 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}