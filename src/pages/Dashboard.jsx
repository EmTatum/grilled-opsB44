import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ShoppingCart, Package, StickyNote, Users, AlertTriangle, Clock, ArrowRight } from "lucide-react";
import StatCard from "../components/StatCard";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import moment from "moment";

const quickLinks = [
  { path: "/orders", label: "Upcoming Orders", desc: "Log and manage all pending and confirmed orders.", icon: ShoppingCart },
  { path: "/inventory", label: "Inventory", desc: "Track product stock counts and low-stock alerts.", icon: Package },
  { path: "/notes", label: "Client Notes", desc: "CRM notes, credits, debts, and client retention.", icon: StickyNote },
];

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Order.list("-created_date", 50),
      base44.entities.Product.list("-created_date", 50),
      base44.entities.CustomerNote.list("-created_date", 50),
    ]).then(([o, p, n]) => { setOrders(o); setProducts(p); setNotes(n); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ width: "28px", height: "28px", borderRadius: "50%", border: "2px solid rgba(201,168,76,0.2)", borderTopColor: "#C9A84C", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const upcoming = orders.filter(o => o.status === "Pending" || o.status === "Confirmed");
  const lowStock = products.filter(p => p.current_stock < (p.low_stock_threshold || 5));
  const clients = new Set([...orders.map(o => o.client_name), ...notes.map(n => n.client_name)]);
  const recentNotes = notes.slice(0, 3);

  return (
    <div>
      <PageHeader title="Operations" subtitle="Grilled.inc — Internal Dashboard" />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "48px" }}>
        <StatCard icon={ShoppingCart} label="Upcoming Orders" value={upcoming.length} />
        <StatCard icon={AlertTriangle} label="Low Stock Alerts" value={lowStock.length} />
        <StatCard icon={Users} label="Active Clients" value={clients.size} />
        <StatCard icon={StickyNote} label="Client Notes" value={notes.length} />
      </div>

      {/* Quick links */}
      <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 500, color: "rgba(201,168,76,0.5)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>
        Quick Access
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "48px" }}>
        {quickLinks.map(card => (
          <Link
            key={card.path}
            to={card.path}
            style={{
              display: "block",
              background: "#1a1a1a",
              border: "1px solid rgba(201,168,76,0.25)",
              borderRadius: "2px",
              padding: "24px",
              textDecoration: "none",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.6)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(201,168,76,0.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.25)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <card.icon size={18} strokeWidth={1.2} style={{ color: "rgba(201,168,76,0.7)" }} />
              <ArrowRight size={14} strokeWidth={1} style={{ color: "rgba(201,168,76,0.4)" }} />
            </div>
            <p style={{ fontFamily: "var(--font-heading)", fontSize: "20px", fontWeight: 600, color: "#C9A84C", marginBottom: "8px", letterSpacing: "0.05em" }}>{card.label}</p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 300, color: "rgba(245,240,232,0.5)", lineHeight: 1.6 }}>{card.desc}</p>
          </Link>
        ))}
      </div>

      {/* Bottom panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="max-md:!grid-cols-1">
        {/* Recent notes */}
        <div style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "2px" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(201,168,76,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: 600, color: "#C9A84C", letterSpacing: "0.05em" }}>Recent Notes</span>
            <Link to="/notes" style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 500, color: "rgba(201,168,76,0.6)", letterSpacing: "0.12em", textTransform: "uppercase" }}>View All</Link>
          </div>
          <div style={{ padding: "16px" }}>
            {recentNotes.length === 0 ? (
              <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.35)", padding: "12px 8px" }}>No notes yet.</p>
            ) : recentNotes.map(note => (
              <div key={note.id} style={{ padding: "14px", borderBottom: "1px solid rgba(255,255,255,0.04)", marginBottom: "2px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#F5F0E8", fontWeight: 500 }}>{note.client_name}</span>
                  <StatusBadge status={note.priority} />
                </div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.5)", lineHeight: 1.5, marginBottom: "8px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{note.content}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Clock size={10} style={{ color: "rgba(245,240,232,0.25)" }} />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "rgba(245,240,232,0.25)" }}>{moment(note.created_date).fromNow()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock */}
        <div style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "2px" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(201,168,76,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: 600, color: "#C9A84C", letterSpacing: "0.05em" }}>Low Stock Alerts</span>
            <Link to="/inventory" style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 500, color: "rgba(201,168,76,0.6)", letterSpacing: "0.12em", textTransform: "uppercase" }}>View All</Link>
          </div>
          <div style={{ padding: "16px" }}>
            {lowStock.length === 0 ? (
              <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.35)", padding: "12px 8px" }}>All products well stocked.</p>
            ) : lowStock.map(p => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(194,24,91,0.04)" }}>
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#F5F0E8", fontWeight: 500 }}>{p.product_name}</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.4)", marginTop: "2px" }}>{p.category}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 600, color: "#C2185B", lineHeight: 1 }}>{p.current_stock}</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "rgba(245,240,232,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>units</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}