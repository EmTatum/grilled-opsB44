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

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <div style={{ width: "24px", height: "24px", border: "1px solid rgba(201,168,76,0.2)", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

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

  if (loading) return <Spinner />;

  const upcoming = orders.filter(o => o.status === "Pending" || o.status === "Confirmed");
  const lowStock = products.filter(p => p.current_stock < (p.low_stock_threshold || 5));
  const clients = new Set([...orders.map(o => o.client_name), ...notes.map(n => n.client_name)]);
  const recentNotes = notes.slice(0, 3);

  return (
    <div>
      <PageHeader title="Operations" subtitle="Grilled.inc — Private Operations Dashboard" />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "16px", marginBottom: "40px" }}>
        <StatCard icon={ShoppingCart} label="Upcoming Orders" value={upcoming.length} />
        <StatCard icon={AlertTriangle} label="Low Stock" value={lowStock.length} />
        <StatCard icon={Users} label="Active Clients" value={clients.size} />
        <StatCard icon={StickyNote} label="Client Notes" value={notes.length} />
      </div>

      {/* Divider */}
      <div className="gold-divider"><span className="gold-divider-diamond">◆</span></div>

      {/* Quick access */}
      <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "10px", fontWeight: 500, color: "rgba(201,168,76,0.45)", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "16px" }}>
        Quick Access
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "40px" }}>
        {quickLinks.map(card => (
          <Link
            key={card.path}
            to={card.path}
            style={{
              display: "block",
              background: "#141414",
              border: "1px solid rgba(201,168,76,0.2)",
              borderRadius: 0,
              padding: "24px",
              textDecoration: "none",
              transition: "all 0.25s ease",
              position: "relative",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C9A84C"; e.currentTarget.style.boxShadow = "0 8px 40px rgba(0,0,0,0.6)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <card.icon size={16} strokeWidth={1.2} style={{ color: "rgba(201,168,76,0.5)" }} />
              <ArrowRight size={14} strokeWidth={1} style={{ color: "rgba(201,168,76,0.35)" }} />
            </div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", fontWeight: 600, fontStyle: "italic", color: "#C9A84C", marginBottom: "8px", letterSpacing: "0.02em" }}>{card.label}</p>
            <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "12px", fontWeight: 300, color: "rgba(245,240,232,0.45)", lineHeight: 1.7 }}>{card.desc}</p>
          </Link>
        ))}
      </div>

      {/* Divider */}
      <div className="gold-divider"><span className="gold-divider-diamond">◆</span></div>

      {/* Bottom panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="max-md:!grid-cols-1">

        {/* Recent notes */}
        <div style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.18)", borderRadius: 0 }}>
          <div style={{ background: "#0a0a0a", padding: "14px 20px", borderBottom: "1px solid rgba(201,168,76,0.25)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", letterSpacing: "0.25em", color: "rgba(201,168,76,0.7)", textTransform: "uppercase" }}>Recent Notes</span>
            <Link to="/notes" style={{ fontFamily: "'Raleway', sans-serif", fontSize: "10px", fontWeight: 500, color: "rgba(201,168,76,0.5)", letterSpacing: "0.15em", textTransform: "uppercase" }}>View All</Link>
          </div>
          <div>
            {recentNotes.length === 0 ? (
              <p style={{ padding: "24px 20px", fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.25)" }}>No notes yet.</p>
            ) : recentNotes.map(note => (
              <div key={note.id} style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "16px", fontWeight: 600, color: "#F5F0E8" }}>{note.client_name}</span>
                  <StatusBadge status={note.priority} />
                </div>
                <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.5)", lineHeight: 1.6, marginBottom: "8px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{note.content}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Clock size={9} style={{ color: "rgba(245,240,232,0.22)" }} />
                  <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: "10px", color: "rgba(245,240,232,0.22)", letterSpacing: "0.08em" }}>{moment(note.created_date).fromNow()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock */}
        <div style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.18)", borderRadius: 0 }}>
          <div style={{ background: "#0a0a0a", padding: "14px 20px", borderBottom: "1px solid rgba(201,168,76,0.25)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", letterSpacing: "0.25em", color: "rgba(201,168,76,0.7)", textTransform: "uppercase" }}>Low Stock Alerts</span>
            <Link to="/inventory" style={{ fontFamily: "'Raleway', sans-serif", fontSize: "10px", fontWeight: 500, color: "rgba(201,168,76,0.5)", letterSpacing: "0.15em", textTransform: "uppercase" }}>View All</Link>
          </div>
          <div>
            {lowStock.length === 0 ? (
              <p style={{ padding: "24px 20px", fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.25)" }}>All products well stocked.</p>
            ) : lowStock.map(p => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div>
                  <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "13px", fontWeight: 500, color: "#F5F0E8" }}>{p.product_name}</p>
                  <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "11px", color: "rgba(245,240,232,0.35)", marginTop: "2px" }}>{p.category}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: "28px", fontWeight: 600, color: "#C2185B", lineHeight: 1 }}>{p.current_stock}</p>
                  <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "9px", color: "rgba(245,240,232,0.25)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: "2px" }}>units</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}