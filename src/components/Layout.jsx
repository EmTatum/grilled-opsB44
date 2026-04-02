import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Package, StickyNote, LineChart, Menu, X, Lock } from "lucide-react";
import { logout } from "./PasswordGate";
import { useState } from "react";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/orders", label: "Upcoming Orders", icon: ShoppingCart },
  { path: "/orders-planner", label: "Orders Planner", icon: ShoppingCart },
  { path: "/daily-dispatch-manifest", label: "Dispatch Manifest", icon: ShoppingCart },
  { path: "/inventory", label: "Inventory", icon: Package },
  { path: "/notes", label: "Client Notes", icon: StickyNote },
  { path: "/client-analytics", label: "Client Analytics", icon: LineChart },
];

const sidebarStyle = {
  width: "220px",
  background: "linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%)",
  borderRight: "1px solid rgba(201,168,76,0.25)",
  display: "flex", flexDirection: "column",
  position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 100,
};

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0a" }}>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 99 }} />
      )}

      {/* SIDEBAR — always visible on md+ */}
      <aside
        style={{
          ...sidebarStyle,
          transform: mobileOpen ? "translateX(0)" : undefined,
          transition: "transform 0.3s ease",
        }}
        className={`hidden md:flex flex-col`}
      >
        {/* Header block */}
        <div style={{ padding: "28px 16px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ height: "1px", width: "100%", background: "linear-gradient(90deg, transparent, #C9A84C, transparent)", marginBottom: "16px" }} />
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: "15px", fontWeight: 600, color: "#C9A84C", letterSpacing: "0.25em", textAlign: "center", textTransform: "uppercase", margin: 0 }}>GRILLED OPS</p>
          <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "8px", fontWeight: 300, color: "rgba(201,168,76,0.4)", letterSpacing: "0.3em", textAlign: "center", marginTop: "6px", textTransform: "uppercase" }}>— Internal Operations —</p>
          <div style={{ height: "1px", width: "100%", background: "linear-gradient(90deg, transparent, #C9A84C, transparent)", marginTop: "16px" }} />
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, paddingTop: "8px" }}>
          {navItems.map((item, i) => {
            const isActive = location.pathname === item.path;
            return (
              <div key={item.path}>
                {i === 1 && (
                  <div style={{ height: "1px", background: "rgba(201,168,76,0.1)", margin: "8px 16px" }} />
                )}
                <Link
                  to={item.path}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "13px 20px",
                    fontFamily: "'Raleway', sans-serif",
                    fontSize: "10px", fontWeight: 600,
                    letterSpacing: "0.2em", textTransform: "uppercase",
                    color: isActive ? "#C9A84C" : "rgba(245,240,232,0.5)",
                    background: isActive ? "rgba(201,168,76,0.07)" : "transparent",
                    borderLeft: isActive ? "2px solid #C9A84C" : "2px solid transparent",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.color = "rgba(245,240,232,0.85)"; e.currentTarget.style.background = "rgba(201,168,76,0.04)"; } }}
                  onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.color = "rgba(245,240,232,0.5)"; e.currentTarget.style.background = "transparent"; } }}
                >
                  <item.icon size={14} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                  {item.label}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ marginTop: "auto", padding: "20px 16px", borderTop: "1px solid rgba(201,168,76,0.12)" }}>
          <button
            onClick={logout}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", padding: "6px 0", width: "100%", justifyContent: "center", marginBottom: "10px", color: "rgba(201,168,76,0.3)", fontFamily: "'Raleway', sans-serif", fontSize: "8px", letterSpacing: "0.18em", textTransform: "uppercase", transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "rgba(201,168,76,0.7)"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(201,168,76,0.3)"}
          >
            <Lock size={10} />
            Lock Session
          </button>
          <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "8px", letterSpacing: "0.18em", color: "rgba(201,168,76,0.25)", textAlign: "center", textTransform: "uppercase", margin: 0 }}>GRILLED.INC © 2026</p>
        </div>
      </aside>

      {/* Mobile drawer */}
      <aside
        style={{
          ...sidebarStyle,
          width: "240px",
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
        }}
        className="flex flex-col md:hidden"
      >
        <div style={{ padding: "28px 16px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ height: "1px", width: "100%", background: "linear-gradient(90deg, transparent, #C9A84C, transparent)", marginBottom: "16px" }} />
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: "15px", fontWeight: 600, color: "#C9A84C", letterSpacing: "0.25em", textAlign: "center", textTransform: "uppercase", margin: 0 }}>GRILLED OPS</p>
          <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "8px", fontWeight: 300, color: "rgba(201,168,76,0.4)", letterSpacing: "0.3em", textAlign: "center", marginTop: "6px", textTransform: "uppercase" }}>— Internal Operations —</p>
          <div style={{ height: "1px", width: "100%", background: "linear-gradient(90deg, transparent, #C9A84C, transparent)", marginTop: "16px" }} />
        </div>
        <nav style={{ flex: 1, paddingTop: "8px" }}>
          {navItems.map((item, i) => {
            const isActive = location.pathname === item.path;
            return (
              <div key={item.path}>
                {i === 1 && <div style={{ height: "1px", background: "rgba(201,168,76,0.1)", margin: "8px 16px" }} />}
                <Link
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "13px 20px",
                    fontFamily: "'Raleway', sans-serif",
                    fontSize: "10px", fontWeight: 600,
                    letterSpacing: "0.2em", textTransform: "uppercase",
                    color: isActive ? "#C9A84C" : "rgba(245,240,232,0.5)",
                    background: isActive ? "rgba(201,168,76,0.07)" : "transparent",
                    borderLeft: isActive ? "2px solid #C9A84C" : "2px solid transparent",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  <item.icon size={14} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                  {item.label}
                </Link>
              </div>
            );
          })}
        </nav>
        <div style={{ marginTop: "auto", padding: "20px 16px", borderTop: "1px solid rgba(201,168,76,0.12)" }}>
          <button
            onClick={logout}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", padding: "6px 0", width: "100%", justifyContent: "center", marginBottom: "10px", color: "rgba(201,168,76,0.3)", fontFamily: "'Raleway', sans-serif", fontSize: "8px", letterSpacing: "0.18em", textTransform: "uppercase", transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "rgba(201,168,76,0.7)"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(201,168,76,0.3)"}
          >
            <Lock size={10} />
            Lock Session
          </button>
          <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "8px", letterSpacing: "0.18em", color: "rgba(201,168,76,0.25)", textAlign: "center", textTransform: "uppercase", margin: 0 }}>GRILLED.INC © 2026</p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }} className="md:ml-[220px]">
        {/* Mobile top bar */}
        <header className="flex md:hidden" style={{ alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "#0f0f0f", borderBottom: "1px solid rgba(201,168,76,0.2)" }}>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "15px", fontWeight: 600, color: "#C9A84C", letterSpacing: "0.2em" }}>GRILLED OPS</span>
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: "none", border: "none", cursor: "pointer", color: "#C9A84C" }}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        <main style={{ flex: 1, padding: "40px 48px", overflowY: "auto" }} className="max-md:!p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}