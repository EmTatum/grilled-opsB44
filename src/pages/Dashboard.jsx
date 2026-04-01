import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ShoppingCart, Package, StickyNote, Users, AlertTriangle, Clock } from "lucide-react";
import StatCard from "../components/StatCard";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import moment from "moment";

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
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
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

  const navCards = [
    { path: "/orders", label: "Upcoming Orders", desc: "Manage & track orders", icon: ShoppingCart },
    { path: "/inventory", label: "Inventory", desc: "Stock levels & products", icon: Package },
    { path: "/notes", label: "Customer Notes", desc: "Client CRM & notes", icon: StickyNote },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Grilled.inc operations overview" />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={ShoppingCart} label="Upcoming Orders" value={upcomingOrders.length} accent />
        <StatCard icon={AlertTriangle} label="Low Stock Alerts" value={lowStockProducts.length} accent={lowStockProducts.length > 0} />
        <StatCard icon={Users} label="Active Clients" value={uniqueClients.size} />
        <StatCard icon={StickyNote} label="Total Notes" value={notes.length} />
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {navCards.map((card) => (
          <Link
            key={card.path}
            to={card.path}
            className="group bg-card border border-border rounded-lg p-6 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <card.icon size={20} className="text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">{card.label}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{card.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent Notes & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notes */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-semibold text-foreground">Recent Notes</h3>
            <Link to="/notes" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {recentNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notes yet.</p>
          ) : (
            <div className="space-y-3">
              {recentNotes.map((note) => (
                <div key={note.id} className="p-3 bg-secondary/50 rounded-lg border border-border/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{note.client_name}</span>
                    <StatusBadge status={note.priority} />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{note.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock size={12} className="text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{moment(note.created_date).fromNow()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-semibold text-foreground">Low Stock Alerts</h3>
            <Link to="/inventory" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">All products are well stocked.</p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.product_name}</p>
                    <p className="text-xs text-muted-foreground">{p.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-heading font-bold text-red-400">{p.current_stock}</p>
                    <p className="text-[10px] text-muted-foreground">units</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}