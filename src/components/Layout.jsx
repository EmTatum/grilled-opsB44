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
        <div onClick={() => setMobileOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 40 }} />
      )}

      {/* SIDEBAR */}
      <aside
        style={{
          width: "240px", flexShrink: 0,
          background: "linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%)",
          borderRight: "1px solid rgba(201,168,76,0.25)",
          display: "flex", flexDirection: "column",
          position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 50,
          transition: "transform 0.3s ease",
        }}
        className={!mobileOpen ? "max-lg:-translate-x-full lg:translate-x-0" : "translate-x-0"}
      >
        {/* Logo block */}
        <div style={{ padding: "28px 20px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ height: "1px", width: "100%", background: "linear-gradient(90deg, transparent, #C9A84C, transparent)", marginBottom: "16px" }} />
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: "18px", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.25em", textAlign: "center", textTransform: "uppercase", margin: 0 }}>GRILLED OPS</p>
          <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "9px", fontWeight: 300, color: "rgba(201,168,76,0.45)", letterSpacing: "0.3em", textAlign: "center", marginTop: "6px", textTransform: "uppercase" }}>— Internal Operations —</p>
          <div style={{ height: "1px", width: "100%", background: "linear-gradient(90deg, transparent, #C9A84C, transparent)", marginTop: "16px" }} />
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "8px 0" }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 24px",
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: "11px", fontWeight: 500,
                  letterSpacing: "0.18em", textTransform: "uppercase",
                  color: isActive ? "#C9A84C" : "rgba(245,240,232,0.5)",
                  background: isActive ? "rgba(201,168,76,0.07)" : "transparent",
                  borderLeft: isActive ? "2px solid #C9A84C" : "2px solid transparent",
                  borderRadius: 0, textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.color = "rgba(245,240,232,0.85)"; e.currentTarget.style.background = "rgba(201,168,76,0.04)"; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.color = "rgba(245,240,232,0.5)"; e.currentTarget.style.background = "transparent"; } }}
              >
                <item.icon size={14} strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
          <div style={{ margin: "8px 24px", height: "1px", background: "rgba(201,168,76,0.12)" }} />
        </nav>

        {/* Footer */}
        <div style={{ padding: "16px 20px 20px" }}>
          <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)", marginBottom: "12px" }} />
          <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "9px", fontWeight: 400, color: "rgba(201,168,76,0.25)", letterSpacing: "0.2em", textAlign: "center", textTransform: "uppercase" }}>
            Grilled.inc © 2026
          </p>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, marginLeft: "240px", display: "flex", flexDirection: "column", minHeight: "100vh" }} className="max-lg:!ml-0">
        {/* Mobile header */}
        <header className="lg:hidden" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "#0f0f0f", borderBottom: "1px solid rgba(201,168,76,0.2)" }}>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "15px", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.2em" }}>GRILLED OPS</span>
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(245,240,232,0.5)" }}>
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </header>

        <div className="page-border-top" />

        <main style={{ flex: 1, padding: "40px 48px", overflowY: "auto" }} className="max-md:!p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}