import { useState, useEffect, Fragment } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, ChevronDown } from "lucide-react";
import OrderLifecycle from "../components/OrderLifecycle";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import OrderFormDialog from "../components/OrderFormDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import moment from "moment";

const GoldBtn = ({ onClick, children }) => (
  <button onClick={onClick} style={{
    background: "transparent", border: "1px solid #C9A84C", color: "#C9A84C",
    fontFamily: "'Raleway', sans-serif", fontSize: "11px", fontWeight: 600,
    letterSpacing: "0.2em", textTransform: "uppercase", padding: "10px 28px",
    borderRadius: "0", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s ease",
  }}
    onMouseEnter={e => { e.currentTarget.style.background = "#C9A84C"; e.currentTarget.style.color = "#0a0a0a"; e.currentTarget.style.boxShadow = "0 0 20px rgba(201,168,76,0.3)"; }}
    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#C9A84C"; e.currentTarget.style.boxShadow = "none"; }}
  >{children}</button>
);

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <div style={{ width: "24px", height: "24px", border: "1px solid rgba(201,168,76,0.2)", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const load = async () => { setOrders(await base44.entities.Order.list("-order_date", 100)); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    if (editOrder) await base44.entities.Order.update(editOrder.id, data);
    else await base44.entities.Order.create(data);
    setEditOrder(null); load();
  };
  const handleDelete = async () => { await base44.entities.Order.delete(deleteId); setDeleteId(null); load(); };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Order Log" subtitle="Manage and track all client orders">
        <GoldBtn onClick={() => { setEditOrder(null); setFormOpen(true); }}><Plus size={12} /> New Order</GoldBtn>
      </PageHeader>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", border: "1px dashed rgba(201,168,76,0.15)" }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: "18px", color: "rgba(201,168,76,0.4)", letterSpacing: "0.15em" }}>No Orders Recorded</p>
          <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.25)", marginTop: "8px" }}>Add your first order to get started.</p>
        </div>
      ) : (
        <>
          {/* Table wrapper */}
          <div style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 0, overflow: "hidden" }}>
            {/* Decorative header bar */}
            <div style={{ background: "#0a0a0a", borderBottom: "1px solid rgba(201,168,76,0.25)", padding: "14px 20px" }}>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", letterSpacing: "0.25em", color: "rgba(201,168,76,0.7)", textTransform: "uppercase" }}>Order Log</span>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#0d0d0d", borderBottom: "1px solid rgba(201,168,76,0.3)" }}>
                    {["Client", "Details", "Date & Time", "Status", ""].map((h, i) => (
                      <th key={i} style={{ padding: "14px 16px", textAlign: i === 4 ? "right" : "left", fontFamily: "'Raleway', sans-serif", fontSize: "10px", fontWeight: 600, color: "rgba(201,168,76,0.55)", letterSpacing: "0.18em", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <Fragment key={order.id}>
                    <tr
                      style={{ borderBottom: expandedId === order.id ? "none" : "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s", cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.04)"}
                      onMouseLeave={e => e.currentTarget.style.background = expandedId === order.id ? "rgba(201,168,76,0.04)" : "transparent"}
                      onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                    >
                      <td style={{ padding: "14px 16px", fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "#F5F0E8", fontWeight: 500 }}>{order.client_name}</td>
                      <td style={{ padding: "14px 16px", fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.55)", maxWidth: "260px" }}>
                        <span style={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>{order.order_details}</span>
                      </td>
                      <td style={{ padding: "14px 16px", fontFamily: "'Raleway', sans-serif", fontSize: "12px", color: "rgba(245,240,232,0.45)", whiteSpace: "nowrap" }}>{moment(order.order_date).format("MMM D, YYYY · h:mm A")}</td>
                      <td style={{ padding: "14px 16px" }}><StatusBadge status={order.status} /></td>
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "4px" }}>
                          <button onClick={(e) => { e.stopPropagation(); setEditOrder(order); setFormOpen(true); }} style={{ padding: "6px", background: "none", border: "none", cursor: "pointer", color: "rgba(245,240,232,0.28)", transition: "color 0.15s" }}
                            onMouseEnter={e => e.currentTarget.style.color = "#C9A84C"} onMouseLeave={e => e.currentTarget.style.color = "rgba(245,240,232,0.28)"} >
                            <Pencil size={13} strokeWidth={1.5} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setDeleteId(order.id); }} style={{ padding: "6px", background: "none", border: "none", cursor: "pointer", color: "rgba(245,240,232,0.28)", transition: "color 0.15s" }}
                            onMouseEnter={e => e.currentTarget.style.color = "#C2185B"} onMouseLeave={e => e.currentTarget.style.color = "rgba(245,240,232,0.28)"} >
                            <Trash2 size={13} strokeWidth={1.5} />
                          </button>
                          <ChevronDown size={13} strokeWidth={1.5} style={{ color: "rgba(245,240,232,0.2)", transition: "transform 0.2s", transform: expandedId === order.id ? "rotate(180deg)" : "rotate(0deg)", marginLeft: "4px" }} />
                        </div>
                      </td>
                    </tr>
                    {expandedId === order.id && (
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td colSpan={5} style={{ padding: 0 }}>
                          <OrderLifecycle order={order} />
                        </td>
                      </tr>
                    )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden">
              {orders.map((order, idx) => (
                <div key={order.id} style={{ padding: "18px 20px", borderBottom: idx < orders.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                    <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "14px", color: "#F5F0E8", fontWeight: 500 }}>{order.client_name}</p>
                    <StatusBadge status={order.status} />
                  </div>
                  <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "12px", color: "rgba(245,240,232,0.4)", marginBottom: "4px" }}>{moment(order.order_date).format("MMM D, YYYY · h:mm A")}</p>
                  <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.5)", marginBottom: "12px" }}>{order.order_details}</p>
                  <div style={{ display: "flex", gap: "16px" }}>
                    <button onClick={() => { setEditOrder(order); setFormOpen(true); }} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Raleway', sans-serif", fontSize: "11px", color: "#C9A84C", letterSpacing: "0.15em", textTransform: "uppercase", padding: 0 }}>Edit</button>
                    <button onClick={() => setDeleteId(order.id)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Raleway', sans-serif", fontSize: "11px", color: "#C2185B", letterSpacing: "0.15em", textTransform: "uppercase", padding: 0 }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <OrderFormDialog open={formOpen} onOpenChange={setFormOpen} order={editOrder} onSave={handleSave} />
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete Order" description="This order will be permanently removed from the log." onConfirm={handleDelete} />
    </div>
  );
}