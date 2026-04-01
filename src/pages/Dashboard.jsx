import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ShoppingCart, Package, StickyNote, Users, AlertTriangle, Clock, ArrowRight } from "lucide-react";
import StatCard from "../components/StatCard";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import moment from "moment";

const navCards = [
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
    async function load() {
      const [o, p, n] = await Promise.all([
        base44.entities.Order.list("-created_date", 50),
        base44.entities.Product.list("-created_date", 50),
        base44.entities.CustomerNote.list("-created_date", 50),
      ]);
      setOrders(o);
      setProducts(p);
      setNotes(n);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-7 h-7 rounded-full border-2 animate-spin"
          style={{ borderColor: "hsl(40 57% 54% / 0.2)", borderTopColor: "hsl(40 57% 54%)" }}
        />
      </div>
    );
  }

  const upcomingOrders = orders.filter((o) => o.status === "Pending" || o.status === "Confirmed");
  const lowStockProducts = products.filter((p) => p.current_stock < (p.low_stock_threshold || 5));
  const uniqueClients = new Set([
    ...orders.map((o) => o.client_name),
    ...notes.map((n) => n.client_name),
  ]);
  const recentNotes = notes.slice(0, 3);

  return (
    <div>
      <PageHeader title="Operations" subtitle="Grilled.inc — Internal Dashboard" />

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        <StatCard icon={ShoppingCart} label="Upcoming Orders" value={upcomingOrders.length} accent />
        <StatCard icon={AlertTriangle} label="Low Stock Alerts" value={lowStockProducts.length} rose={lowStockProducts.length > 0} accent={lowStockProducts.length === 0} />
        <StatCard icon={Users} label="Active Clients" value={uniqueClients.size} />
        <StatCard icon={StickyNote} label="Client Notes" value={notes.length} />
      </div>

      {/* Navigation cards */}
      <div className="mb-3">
        <p
          className="uppercase tracking-luxury mb-4"
          style={{ fontSize: "9px", color: "hsl(36 10% 40%)", letterSpacing: "0.25em", fontFamily: "Inter, sans-serif" }}
        >
          Quick Access
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {navCards.map((card) => (
          <Link
            key={card.path}
            to={card.path}
            className="group relative rounded-sm overflow-hidden transition-all duration-300 hover:scale-[1.01]"
            style={{
              background: "linear-gradient(160deg, #1c1c1c, #161616)",
              border: "1px solid hsl(40 20% 17%)",
            }}
          >
            {/* Hover gold border */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-sm"
              style={{ border: "1px solid hsl(40 57% 54% / 0.35)" }}
            />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div
                  className="p-2.5 rounded-sm"
                  style={{
                    background: "hsl(40 57% 54% / 0.08)",
                    border: "1px solid hsl(40 57% 54% / 0.18)",
                  }}
                >
                  <card.icon size={17} strokeWidth={1.2} style={{ color: "hsl(40 57% 54%)" }} />
                </div>
                <ArrowRight
                  size={14}
                  strokeWidth={1}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-1 group-hover:translate-x-0"
                  style={{ color: "hsl(40 57% 54%)" }}
                />
              </div>
              <h3
                className="font-heading font-semibold mb-2"
                style={{ fontSize: "20px", color: "hsl(36 40% 92%)" }}
              >
                {card.label}
              </h3>
              <p
                style={{ fontSize: "12px", color: "hsl(36 10% 48%)", lineHeight: 1.6, fontFamily: "Inter, sans-serif" }}
              >
                {card.desc}
              </p>
            </div>
            {/* Bottom accent */}
            <div
              className="h-px w-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "linear-gradient(90deg, hsl(40 57% 54% / 0.5), transparent)" }}
            />
          </Link>
        ))}
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notes */}
        <div
          className="rounded-sm"
          style={{
            background: "linear-gradient(160deg, #1c1c1c, #181818)",
            border: "1px solid hsl(40 20% 17%)",
          }}
        >
          <div
            className="px-6 py-5 flex items-center justify-between"
            style={{ borderBottom: "1px solid hsl(40 20% 13%)" }}
          >
            <h3
              className="font-heading font-semibold"
              style={{ fontSize: "18px", color: "hsl(36 40% 90%)" }}
            >
              Recent Notes
            </h3>
            <Link
              to="/notes"
              className="uppercase tracking-luxury transition-colors hover:opacity-100"
              style={{ fontSize: "9px", color: "hsl(40 57% 54%)", letterSpacing: "0.18em", fontFamily: "Inter, sans-serif", opacity: 0.7 }}
            >
              View All
            </Link>
          </div>
          <div className="p-4 space-y-2">
            {recentNotes.length === 0 ? (
              <p className="px-2 py-4 text-sm" style={{ color: "hsl(36 10% 42%)", fontFamily: "Inter, sans-serif" }}>
                No notes yet.
              </p>
            ) : (
              recentNotes.map((note) => (
                <div
                  key={note.id}
                  className="px-4 py-3 rounded-sm"
                  style={{ background: "hsl(0 0% 9%)", border: "1px solid hsl(40 20% 12%)" }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span style={{ fontSize: "13px", color: "hsl(36 40% 88%)", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
                      {note.client_name}
                    </span>
                    <StatusBadge status={note.priority} />
                  </div>
                  <p
                    className="line-clamp-2 mb-2"
                    style={{ fontSize: "12px", color: "hsl(36 10% 48%)", lineHeight: 1.5, fontFamily: "Inter, sans-serif" }}
                  >
                    {note.content}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Clock size={10} style={{ color: "hsl(36 10% 38%)" }} />
                    <span style={{ fontSize: "10px", color: "hsl(36 10% 38%)", fontFamily: "Inter, sans-serif" }}>
                      {moment(note.created_date).fromNow()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock */}
        <div
          className="rounded-sm"
          style={{
            background: "linear-gradient(160deg, #1c1c1c, #181818)",
            border: "1px solid hsl(40 20% 17%)",
          }}
        >
          <div
            className="px-6 py-5 flex items-center justify-between"
            style={{ borderBottom: "1px solid hsl(40 20% 13%)" }}
          >
            <h3
              className="font-heading font-semibold"
              style={{ fontSize: "18px", color: "hsl(36 40% 90%)" }}
            >
              Low Stock Alerts
            </h3>
            <Link
              to="/inventory"
              className="uppercase tracking-luxury transition-colors hover:opacity-100"
              style={{ fontSize: "9px", color: "hsl(40 57% 54%)", letterSpacing: "0.18em", fontFamily: "Inter, sans-serif", opacity: 0.7 }}
            >
              View All
            </Link>
          </div>
          <div className="p-4 space-y-2">
            {lowStockProducts.length === 0 ? (
              <p className="px-2 py-4 text-sm" style={{ color: "hsl(36 10% 42%)", fontFamily: "Inter, sans-serif" }}>
                All products are well stocked.
              </p>
            ) : (
              lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="px-4 py-3 rounded-sm flex items-center justify-between"
                  style={{ background: "hsl(333 72% 43% / 0.06)", border: "1px solid hsl(333 72% 43% / 0.18)" }}
                >
                  <div>
                    <p style={{ fontSize: "13px", color: "hsl(36 40% 88%)", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
                      {p.product_name}
                    </p>
                    <p style={{ fontSize: "10px", color: "hsl(36 10% 45%)", fontFamily: "Inter, sans-serif", marginTop: "2px" }}>
                      {p.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading font-semibold" style={{ fontSize: "26px", color: "hsl(333 72% 60%)", lineHeight: 1 }}>
                      {p.current_stock}
                    </p>
                    <p style={{ fontSize: "9px", color: "hsl(36 10% 40%)", fontFamily: "Inter, sans-serif", letterSpacing: "0.12em" }}>
                      UNITS
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}