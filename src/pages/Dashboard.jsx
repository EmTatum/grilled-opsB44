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

/* Ornate Art Deco corner bracket as SVG */
const CornerBracket = ({ flip }) => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"
    style={{ position: "absolute", ...(flip ? { bottom: 0, right: 0, transform: "rotate(180deg)" } : { top: 0, left: 0 }) }}>
    <path d="M2 26 L2 2 L26 2" stroke="#C9A84C" strokeWidth="1.2" strokeOpacity="0.7" fill="none" />
    <path d="M2 10 L8 10 L8 2" stroke="#C9A84C" strokeWidth="0.7" strokeOpacity="0.4" fill="none" />
  </svg>
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
      {/* Hero header with brand imagery */}
      <div style={{
        position: "relative",
        marginBottom: "40px",
        padding: "36px 40px",
        background: "linear-gradient(135deg, #0f0a00 0%, #0a0a0a 50%, #100808 100%)",
        border: "1px solid rgba(201,168,76,0.25)",
        overflow: "hidden",
      }}>
        {/* Decorative corner brackets */}
        <CornerBracket />
        <CornerBracket flip />
        
        {/* Background glow */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "500px", height: "300px", background: "radial-gradient(ellipse, rgba(201,168,76,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "40px", position: "relative", zIndex: 1, flexWrap: "wrap" }}>
          {/* Logo */}
          <div style={{ flexShrink: 0 }}>
            <img
              src="https://media.base44.com/images/public/69cd3aaf3e23608c6e7a4c23/85abe4afd_generated_image.png"
              alt="Grilled Inc"
              style={{ width: "160px", filter: "drop-shadow(0 0 24px rgba(201,168,76,0.4)) drop-shadow(0 0 6px rgba(194,24,91,0.2))" }}
            />
          </div>

          {/* Title block */}
          <div style={{ flex: 1, minWidth: "200px" }}>
            <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "9px", fontWeight: 400, color: "rgba(201,168,76,0.45)", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: "8px" }}>
              ◆ &nbsp; Private Operations Terminal &nbsp; ◆
            </p>
            <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.18em", textTransform: "uppercase", margin: 0, lineHeight: 1.1, textShadow: "0 0 40px rgba(201,168,76,0.3)" }}>
              Operations
            </h1>
            <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 700, color: "#F5F0E8", letterSpacing: "0.18em", textTransform: "uppercase", margin: 0, lineHeight: 1.1, opacity: 0.9 }}>
              Command
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "14px" }}>
              <div style={{ height: "1px", width: "40px", background: "linear-gradient(90deg, transparent, #C9A84C)" }} />
              <span style={{ color: "rgba(201,168,76,0.5)", fontSize: "8px" }}>◆</span>
              <div style={{ height: "1px", width: "40px", background: "linear-gradient(90deg, #C9A84C, transparent)" }} />
            </div>
            <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "12px", fontWeight: 300, color: "rgba(245,240,232,0.35)", letterSpacing: "0.15em", marginTop: "10px" }}>
              Grilled.inc — Members-only dashboard
            </p>
          </div>

          {/* Date stamp */}
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: "22px", fontWeight: 400, color: "rgba(201,168,76,0.6)", lineHeight: 1 }}>{moment().format("DD")}</p>
            <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "10px", color: "rgba(245,240,232,0.3)", letterSpacing: "0.2em", textTransform: "uppercase" }}>{moment().format("MMM YYYY")}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "13px", fontWeight: 600, color: "rgba(201,168,76,0.6)", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "14px" }}>
        Live Intelligence
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px", marginBottom: "40px" }}>
        <StatCard icon={ShoppingCart} label="Upcoming Orders" value={upcoming.length} accent="#C9A84C" />
        <StatCard icon={AlertTriangle} label="Low Stock" value={lowStock.length} accent="#C9A84C" />
        <StatCard icon={Users} label="Active Clients" value={clients.size} accent="#C9A84C" />
        <StatCard icon={StickyNote} label="Client Notes" value={notes.length} accent="#C9A84C" />
      </div>

      {/* Divider */}
      <div className="gold-divider"><span className="gold-divider-diamond">◆</span></div>

      {/* Quick access */}
      <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "13px", fontWeight: 600, color: "rgba(201,168,76,0.6)", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "14px" }}>
        Quick Access
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "40px" }}>
        {quickLinks.map(card => (
          <Link
            key={card.path}
            to={card.path}
            style={{
              display: "block", position: "relative",
              background: "linear-gradient(135deg, #141414 0%, #0f0f0f 100%)",
              border: "1px solid rgba(201,168,76,0.2)",
              borderRadius: 0, padding: "24px",
              textDecoration: "none", transition: "all 0.25s ease",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C9A84C"; e.currentTarget.style.boxShadow = "0 8px 40px rgba(0,0,0,0.7), 0 0 20px rgba(201,168,76,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {/* Corner accents */}
            <div style={{ position: "absolute", top: 0, left: 0, width: "14px", height: "14px", borderTop: "1px solid rgba(201,168,76,0.5)", borderLeft: "1px solid rgba(201,168,76,0.5)" }} />
            <div style={{ position: "absolute", bottom: 0, right: 0, width: "14px", height: "14px", borderBottom: "1px solid rgba(201,168,76,0.5)", borderRight: "1px solid rgba(201,168,76,0.5)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <card.icon size={16} strokeWidth={1.2} style={{ color: "rgba(201,168,76,0.5)" }} />
              <ArrowRight size={14} strokeWidth={1} style={{ color: "rgba(201,168,76,0.35)" }} />
            </div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", fontWeight: 600, fontStyle: "italic", color: "#C9A84C", marginBottom: "8px" }}>{card.label}</p>
            <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "12px", fontWeight: 300, color: "rgba(245,240,232,0.4)", lineHeight: 1.7 }}>{card.desc}</p>
          </Link>
        ))}
      </div>

      {/* Divider */}
      <div className="gold-divider"><span className="gold-divider-diamond">◆</span></div>

      {/* Bottom panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="max-md:!grid-cols-1">

        {/* Recent notes */}
        <div style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.18)", borderRadius: 0 }}>
          <div style={{ background: "#0a0a0a", padding: "14px 20px", borderBottom: "1px solid rgba(201,168,76,0.25)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "15px", letterSpacing: "0.2em", color: "rgba(201,168,76,0.85)", textTransform: "uppercase", fontWeight: 600 }}>Recent Notes</span>
            <Link to="/notes" style={{ fontFamily: "'Raleway', sans-serif", fontSize: "10px", fontWeight: 500, color: "rgba(201,168,76,0.45)", letterSpacing: "0.15em", textTransform: "uppercase" }}>View All →</Link>
          </div>
          <div>
            {recentNotes.length === 0 ? (
              <p style={{ padding: "24px 20px", fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.2)" }}>No notes yet.</p>
            ) : recentNotes.map(note => (
              <div key={note.id} style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "16px", fontWeight: 600, color: "#F5F0E8" }}>{note.client_name}</span>
                  <StatusBadge status={note.priority} />
                </div>
                <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.45)", lineHeight: 1.6, marginBottom: "8px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{note.content}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Clock size={9} style={{ color: "rgba(245,240,232,0.2)" }} />
                  <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: "10px", color: "rgba(245,240,232,0.2)", letterSpacing: "0.08em" }}>{moment(note.created_date).fromNow()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock */}
        <div style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.18)", borderRadius: 0 }}>
          <div style={{ background: "#0a0a0a", padding: "14px 20px", borderBottom: "1px solid rgba(201,168,76,0.25)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "15px", letterSpacing: "0.2em", color: "rgba(201,168,76,0.85)", textTransform: "uppercase", fontWeight: 600 }}>Low Stock Alerts</span>
            <Link to="/inventory" style={{ fontFamily: "'Raleway', sans-serif", fontSize: "10px", fontWeight: 500, color: "rgba(201,168,76,0.45)", letterSpacing: "0.15em", textTransform: "uppercase" }}>View All →</Link>
          </div>
          <div>
            {lowStock.length === 0 ? (
              <p style={{ padding: "24px 20px", fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.2)" }}>All products well stocked.</p>
            ) : lowStock.map(p => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div>
                  <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "13px", fontWeight: 500, color: "#F5F0E8" }}>{p.product_name}</p>
                  <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "11px", color: "rgba(245,240,232,0.3)", marginTop: "2px" }}>{p.category}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: "28px", fontWeight: 600, color: "#C2185B", lineHeight: 1 }}>{p.current_stock}</p>
                  <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "9px", color: "rgba(245,240,232,0.22)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: "2px" }}>units</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}