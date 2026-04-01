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
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0a" }}>
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 40 }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: "240px",
          flexShrink: 0,
          background: "#111111",
          borderRight: "1px solid rgba(201,168,76,0.3)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          zIndex: 50,
          transform: mobileOpen ? "translateX(0)" : undefined,
          transition: "transform 0.3s ease",
        }}
        className={!mobileOpen ? "max-lg:!-translate-x-full" : ""}
      >
        {/* Logo */}
        <div style={{ padding: "32px 28px 24px", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            GRILLED OPS
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 300, fontSize: "11px", color: "rgba(201,168,76,0.5)", letterSpacing: "0.12em", marginTop: "6px", textTransform: "uppercase" }}>
            Internal Operations
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 0" }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 28px",
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: isActive ? "#C9A84C" : "rgba(245,240,232,0.7)",
                  background: isActive ? "rgba(201,168,76,0.08)" : "transparent",
                  borderLeft: isActive ? "2px solid #C9A84C" : "2px solid transparent",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.color = "#F5F0E8"; e.currentTarget.style.background = "rgba(201,168,76,0.05)"; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.color = "rgba(245,240,232,0.7)"; e.currentTarget.style.background = "transparent"; } }}
              >
                <item.icon size={15} strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}

          {/* Gold divider */}
          <div style={{ margin: "16px 28px", height: "1px", background: "rgba(201,168,76,0.2)" }} />
        </nav>

        {/* Footer */}
        <div style={{ padding: "20px 28px", borderTop: "1px solid rgba(201,168,76,0.15)" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "rgba(245,240,232,0.25)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Grilled.inc © 2026
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", marginLeft: "240px", minHeight: "100vh" }} className="max-lg:!ml-0">
        {/* Mobile header */}
        <header
          className="lg:hidden"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "#111111", borderBottom: "1px solid rgba(201,168,76,0.2)" }}
        >
          <span style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.15em" }}>GRILLED OPS</span>
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{ color: "rgba(245,240,232,0.6)", background: "none", border: "none", cursor: "pointer" }}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        <main style={{ flex: 1, padding: "48px 48px", overflowY: "auto" }} className="max-md:!p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}