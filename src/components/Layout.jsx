import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Package, StickyNote, LineChart, Menu, X, LogOut, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useEffect, useMemo, useState } from "react";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/orders", label: "Orders", icon: ShoppingCart },
  { path: "/daily-dispatch-manifest", label: "Dispatch Manifest", icon: ShoppingCart },
  { path: "/inventory", label: "Catalogue", icon: Package },
  { path: "/notes", label: "Member Intelligence", icon: StickyNote },
  { path: "/client-analytics", label: "Member Circle", icon: LineChart },
];

const sidebarStyle = {
  width: "220px",
  background: "#030101",
  borderRight: "1px solid rgba(210,156,108,0.3)",
  display: "flex", flexDirection: "column",
  position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 100,
};

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberResults, setMemberResults] = useState([]);

  useEffect(() => {
    base44.entities.CustomerNote.list("-updated_date", 300).then((records) => {
      const uniqueNames = [...new Set((records || []).map((item) => (item.client_name || "").trim()).filter(Boolean))];
      setMemberResults(uniqueNames.map((name) => ({ client_name: name })));
    });
  }, []);

  const filteredResults = useMemo(() => {
    if (!memberSearch.trim()) return [];
    return memberResults
      .filter((item) => item.client_name.toLowerCase().includes(memberSearch.toLowerCase()))
      .slice(0, 8);
  }, [memberResults, memberSearch]);

  const handleLogout = () => {
    base44.auth.logout();
  };

  const handleMemberSelect = (clientName) => {
    setMemberSearch("");
    setMobileOpen(false);
    navigate(`/notes?search=${encodeURIComponent(clientName)}`);
  };

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
          <div style={{ height: "1px", width: "100%", background: "rgba(210,156,108,0.2)", marginBottom: "16px" }} />
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: 600, color: "var(--color-gold)", letterSpacing: "0.15em", textAlign: "center", textTransform: "uppercase", margin: 0 }}>GRILLED OPS</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 300, color: "rgba(210,156,108,0.5)", letterSpacing: "0.12em", textAlign: "center", marginTop: "6px", textTransform: "uppercase" }}>INTERNAL OPERATIONS</p>
          <div style={{ height: "1px", width: "100%", background: "rgba(210,156,108,0.2)", marginTop: "16px" }} />
        </div>

        <div style={{ padding: "0 16px 12px", position: "relative" }}>
          <div style={{ position: "relative" }}>
            <Search size={12} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "rgba(245,240,232,0.3)" }} />
            <input
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="Search member..."
              style={{ width: "100%", background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.2)", color: "#F5F0E8", fontFamily: "var(--font-body)", fontSize: "13px", padding: "10px 12px 10px 32px", outline: "none", borderRadius: "2px" }}
            />
          </div>
          {filteredResults.length > 0 && (
            <div style={{ position: "absolute", left: "16px", right: "16px", top: "44px", background: "#111111", border: "1px solid rgba(201,168,76,0.2)", zIndex: 120 }}>
              {filteredResults.map((item) => (
                <button
                  key={item.client_name}
                  onClick={() => handleMemberSelect(item.client_name)}
                  style={{ width: "100%", textAlign: "left", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.04)", color: "#F5F0E8", fontFamily: "var(--font-body)", fontSize: "12px", padding: "10px 12px", cursor: "pointer" }}
                >
                  {item.client_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, paddingTop: "8px" }}>
          {navItems.map((item, i) => {
            const isActive = location.pathname === item.path;
            return (
              <div key={item.path}>
                {i === 1 && (
                  <div style={{ height: "1px", background: "rgba(210,156,108,0.2)", margin: "8px 16px" }} />
                )}
                <Link
                  to={item.path}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "13px 20px",
                    fontFamily: "var(--font-body)",
                    fontSize: "13px", fontWeight: 500,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    color: isActive ? "var(--color-gold)" : "#eee3b4",
                    background: isActive ? "rgba(10,38,39,0.55)" : "transparent",
                    borderLeft: isActive ? "2px solid var(--color-gold)" : "2px solid transparent",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.color = "#F5F0E8"; e.currentTarget.style.background = "rgba(210,156,108,0.05)"; } }}
                  onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.color = "rgba(245,240,232,0.7)"; e.currentTarget.style.background = "transparent"; } }}
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
            onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", padding: "6px 0", width: "100%", justifyContent: "center", marginBottom: "10px", color: "rgba(201,168,76,0.3)", fontFamily: "'Raleway', sans-serif", fontSize: "8px", letterSpacing: "0.18em", textTransform: "uppercase", transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "rgba(201,168,76,0.7)"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(201,168,76,0.3)"}
          >
            <LogOut size={10} />
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
          <div style={{ height: "1px", width: "100%", background: "rgba(210,156,108,0.2)", marginBottom: "16px" }} />
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: 600, color: "var(--color-gold)", letterSpacing: "0.15em", textAlign: "center", textTransform: "uppercase", margin: 0 }}>GRILLED OPS</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 300, color: "rgba(210,156,108,0.5)", letterSpacing: "0.12em", textAlign: "center", marginTop: "6px", textTransform: "uppercase" }}>INTERNAL OPERATIONS</p>
          <div style={{ height: "1px", width: "100%", background: "rgba(210,156,108,0.2)", marginTop: "16px" }} />
        </div>
        <div style={{ padding: "0 16px 12px", position: "relative" }}>
          <div style={{ position: "relative" }}>
            <Search size={12} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "rgba(245,240,232,0.3)" }} />
            <input
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="Search member..."
              style={{ width: "100%", background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.2)", color: "#F5F0E8", fontFamily: "var(--font-body)", fontSize: "13px", padding: "10px 12px 10px 32px", outline: "none", borderRadius: "2px" }}
            />
          </div>
          {filteredResults.length > 0 && (
            <div style={{ position: "absolute", left: "16px", right: "16px", top: "44px", background: "#111111", border: "1px solid rgba(201,168,76,0.2)", zIndex: 120 }}>
              {filteredResults.map((item) => (
                <button
                  key={item.client_name}
                  onClick={() => handleMemberSelect(item.client_name)}
                  style={{ width: "100%", textAlign: "left", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.04)", color: "#F5F0E8", fontFamily: "var(--font-body)", fontSize: "12px", padding: "10px 12px", cursor: "pointer" }}
                >
                  {item.client_name}
                </button>
              ))}
            </div>
          )}
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
                    fontFamily: "var(--font-body)",
                    fontSize: "13px", fontWeight: 500,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    color: isActive ? "var(--color-gold)" : "#eee3b4",
                    background: isActive ? "rgba(10,38,39,0.55)" : "transparent",
                    borderLeft: isActive ? "2px solid var(--color-gold)" : "2px solid transparent",
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
            onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", padding: "6px 0", width: "100%", justifyContent: "center", marginBottom: "10px", color: "rgba(201,168,76,0.3)", fontFamily: "'Raleway', sans-serif", fontSize: "8px", letterSpacing: "0.18em", textTransform: "uppercase", transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "rgba(201,168,76,0.7)"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(201,168,76,0.3)"}
          >
            <LogOut size={10} />
            Lock Session
          </button>
          <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "8px", letterSpacing: "0.18em", color: "rgba(201,168,76,0.25)", textAlign: "center", textTransform: "uppercase", margin: 0 }}>GRILLED.INC © 2026</p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }} className="md:ml-[220px]">
        {/* Mobile top bar */}
        <header className="flex md:hidden" style={{ alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "#111111", borderBottom: "1px solid rgba(210,156,108,0.2)" }}>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: "17px", fontWeight: 600, color: "var(--color-gold)", letterSpacing: "0.15em" }}>GRILLED OPS</span>
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