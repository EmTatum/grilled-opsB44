import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import OrderFormDialog from "../components/OrderFormDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import moment from "moment";

const GoldButton = ({ onClick, children, small }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 uppercase tracking-luxury transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
    style={{
      background: "linear-gradient(135deg, hsl(40 57% 54%), hsl(40 40% 40%))",
      color: "#0a0a0a",
      fontFamily: "Inter, sans-serif",
      fontSize: small ? "10px" : "11px",
      fontWeight: 600,
      letterSpacing: "0.18em",
      padding: small ? "6px 14px" : "10px 22px",
      border: "none",
      borderRadius: "2px",
    }}
  >
    {children}
  </button>
);

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const loadOrders = async () => {
    const data = await base44.entities.Order.list("-order_date", 100);
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => { loadOrders(); }, []);

  const handleSave = async (data) => {
    if (editOrder) {
      await base44.entities.Order.update(editOrder.id, data);
    } else {
      await base44.entities.Order.create(data);
    }
    setEditOrder(null);
    loadOrders();
  };

  const handleDelete = async () => {
    await base44.entities.Order.delete(deleteId);
    setDeleteId(null);
    loadOrders();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 rounded-full border-2 animate-spin"
          style={{ borderColor: "hsl(40 57% 54% / 0.2)", borderTopColor: "hsl(40 57% 54%)" }} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Upcoming Orders" subtitle="Manage and track all client orders">
        <GoldButton onClick={() => { setEditOrder(null); setFormOpen(true); }}>
          <Plus size={12} strokeWidth={2} /> New Order
        </GoldButton>
      </PageHeader>

      {orders.length === 0 ? (
        <div
          className="text-center py-20 rounded-sm"
          style={{ border: "1px dashed hsl(40 20% 18%)" }}
        >
          <p className="font-heading" style={{ fontSize: "22px", color: "hsl(36 40% 60%)" }}>No orders yet</p>
          <p style={{ fontSize: "12px", color: "hsl(36 10% 40%)", marginTop: "8px", fontFamily: "Inter, sans-serif" }}>
            Add your first order to get started.
          </p>
        </div>
      ) : (
        <div className="rounded-sm overflow-hidden" style={{ border: "1px solid hsl(40 20% 15%)" }}>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "#111111", borderBottom: "1px solid hsl(40 20% 14%)" }}>
                  {["Client", "Details", "Date & Time", "Status", ""].map((h, i) => (
                    <th
                      key={i}
                      className={`px-6 py-4 ${i === 4 ? "text-right" : "text-left"}`}
                      style={{
                        fontSize: "9px",
                        color: "hsl(36 10% 42%)",
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ background: "#141414" }}>
                {orders.map((order, idx) => (
                  <tr
                    key={order.id}
                    className="transition-colors"
                    style={{
                      borderBottom: idx < orders.length - 1 ? "1px solid hsl(40 20% 11%)" : "none",
                      background: "transparent",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "hsl(40 57% 54% / 0.04)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td className="px-6 py-4" style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "hsl(36 40% 88%)", fontWeight: 500 }}>
                      {order.client_name}
                    </td>
                    <td className="px-6 py-4 max-w-xs" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "hsl(36 10% 50%)" }}>
                      <span className="line-clamp-1">{order.order_details}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "hsl(36 10% 48%)" }}>
                      {moment(order.order_date).format("MMM D, YYYY · h:mm A")}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditOrder(order); setFormOpen(true); }}
                          className="p-2 rounded-sm transition-colors"
                          style={{ color: "hsl(36 10% 45%)" }}
                          onMouseEnter={(e) => e.currentTarget.style.color = "hsl(40 57% 54%)"}
                          onMouseLeave={(e) => e.currentTarget.style.color = "hsl(36 10% 45%)"}
                        >
                          <Pencil size={13} strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => setDeleteId(order.id)}
                          className="p-2 rounded-sm transition-colors"
                          style={{ color: "hsl(36 10% 45%)" }}
                          onMouseEnter={(e) => e.currentTarget.style.color = "hsl(0 65% 55%)"}
                          onMouseLeave={(e) => e.currentTarget.style.color = "hsl(36 10% 45%)"}
                        >
                          <Trash2 size={13} strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden" style={{ background: "#141414" }}>
            {orders.map((order, idx) => (
              <div
                key={order.id}
                className="p-5"
                style={{ borderBottom: idx < orders.length - 1 ? "1px solid hsl(40 20% 11%)" : "none" }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "hsl(36 40% 88%)", fontWeight: 500 }}>
                      {order.client_name}
                    </p>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "hsl(36 10% 45%)", marginTop: "2px" }}>
                      {moment(order.order_date).format("MMM D, YYYY · h:mm A")}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "hsl(36 10% 50%)", marginBottom: "12px" }}>
                  {order.order_details}
                </p>
                <div className="flex gap-4">
                  <button onClick={() => { setEditOrder(order); setFormOpen(true); }}
                    style={{ fontSize: "11px", color: "hsl(40 57% 54%)", fontFamily: "Inter, sans-serif", letterSpacing: "0.1em" }}>
                    EDIT
                  </button>
                  <button onClick={() => setDeleteId(order.id)}
                    style={{ fontSize: "11px", color: "hsl(0 65% 55%)", fontFamily: "Inter, sans-serif", letterSpacing: "0.1em" }}>
                    DELETE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <OrderFormDialog open={formOpen} onOpenChange={setFormOpen} order={editOrder} onSave={handleSave} />
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete Order" description="This order will be permanently removed." onConfirm={handleDelete} />
    </div>
  );
}