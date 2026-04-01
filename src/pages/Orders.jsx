import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import OrderFormDialog from "../components/OrderFormDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import moment from "moment";

const GoldBtn = ({ onClick, children }) => (
  <button onClick={onClick} style={{
    background: "transparent", border: "1px solid #C9A84C", color: "#C9A84C",
    fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 500,
    letterSpacing: "0.12em", textTransform: "uppercase", padding: "10px 24px",
    borderRadius: "2px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
    transition: "all 0.2s ease",
  }}
    onMouseEnter={e => { e.currentTarget.style.background = "#C9A84C"; e.currentTarget.style.color = "#0a0a0a"; }}
    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#C9A84C"; }}
  >{children}</button>
);

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => { setOrders(await base44.entities.Order.list("-order_date", 100)); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    if (editOrder) await base44.entities.Order.update(editOrder.id, data);
    else await base44.entities.Order.create(data);
    setEditOrder(null); load();
  };
  const handleDelete = async () => { await base44.entities.Order.delete(deleteId); setDeleteId(null); load(); };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ width: "28px", height: "28px", borderRadius: "50%", border: "2px solid rgba(201,168,76,0.2)", borderTopColor: "#C9A84C", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div>
      <PageHeader title="Upcoming Orders" subtitle="Manage and track all client orders">
        <GoldBtn onClick={() => { setEditOrder(null); setFormOpen(true); }}><Plus size={13} /> New Order</GoldBtn>
      </PageHeader>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", border: "1px dashed rgba(201,168,76,0.2)", borderRadius: "2px" }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "22px", color: "rgba(201,168,76,0.5)" }}>No orders yet</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.3)", marginTop: "8px" }}>Add your first order to get started.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block" style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "2px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#0a0a0a", borderBottom: "1px solid rgba(201,168,76,0.3)" }}>
                  {["Client", "Details", "Date & Time", "Status", ""].map((h, i) => (
                    <th key={i} style={{ padding: "14px 20px", textAlign: i === 4 ? "right" : "left", fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 500, color: "rgba(201,168,76,0.7)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s ease" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.05)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "16px 20px", fontFamily: "var(--font-body)", fontSize: "14px", color: "#F5F0E8", fontWeight: 500 }}>{order.client_name}</td>
                    <td style={{ padding: "16px 20px", fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(245,240,232,0.6)", maxWidth: "280px" }}>
                      <span style={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>{order.order_details}</span>
                    </td>
                    <td style={{ padding: "16px 20px", fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.55)", whiteSpace: "nowrap" }}>{moment(order.order_date).format("MMM D, YYYY · h:mm A")}</td>
                    <td style={{ padding: "16px 20px" }}><StatusBadge status={order.status} /></td>
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "4px" }}>
                        <button onClick={() => { setEditOrder(order); setFormOpen(true); }} style={{ padding: "6px", background: "none", border: "none", cursor: "pointer", color: "rgba(245,240,232,0.35)", transition: "color 0.15s" }}
                          onMouseEnter={e => e.currentTarget.style.color = "#C9A84C"} onMouseLeave={e => e.currentTarget.style.color = "rgba(245,240,232,0.35)"}>
                          <Pencil size={14} strokeWidth={1.5} />
                        </button>
                        <button onClick={() => setDeleteId(order.id)} style={{ padding: "6px", background: "none", border: "none", cursor: "pointer", color: "rgba(245,240,232,0.35)", transition: "color 0.15s" }}
                          onMouseEnter={e => e.currentTarget.style.color = "#C2185B"} onMouseLeave={e => e.currentTarget.style.color = "rgba(245,240,232,0.35)"}>
                          <Trash2 size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {orders.map(order => (
              <div key={order.id} style={{ background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "2px", padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "15px", color: "#F5F0E8", fontWeight: 500 }}>{order.client_name}</p>
                  <StatusBadge status={order.status} />
                </div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.5)", marginBottom: "6px" }}>{moment(order.order_date).format("MMM D, YYYY · h:mm A")}</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.55)", marginBottom: "14px" }}>{order.order_details}</p>
                <div style={{ display: "flex", gap: "16px" }}>
                  <button onClick={() => { setEditOrder(order); setFormOpen(true); }} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "12px", color: "#C9A84C", letterSpacing: "0.1em", textTransform: "uppercase", padding: 0 }}>Edit</button>
                  <button onClick={() => setDeleteId(order.id)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "12px", color: "#C2185B", letterSpacing: "0.1em", textTransform: "uppercase", padding: 0 }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <OrderFormDialog open={formOpen} onOpenChange={setFormOpen} order={editOrder} onSave={handleSave} />
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete Order" description="This order will be permanently removed." onConfirm={handleDelete} />
    </div>
  );
}