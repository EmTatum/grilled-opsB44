import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import OrderFormDialog from "../components/OrderFormDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import moment from "moment";

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
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Upcoming Orders" subtitle="Manage and track all orders">
        <Button
          onClick={() => { setEditOrder(null); setFormOpen(true); }}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={16} className="mr-2" /> New Order
        </Button>
      </PageHeader>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-heading">No orders yet</p>
          <p className="text-sm mt-1">Add your first order to get started.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium tracking-wider uppercase">Client</th>
                  <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium tracking-wider uppercase">Details</th>
                  <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium tracking-wider uppercase">Date</th>
                  <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium tracking-wider uppercase">Status</th>
                  <th className="text-right px-5 py-3 text-xs text-muted-foreground font-medium tracking-wider uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-4 font-medium text-foreground">{order.client_name}</td>
                    <td className="px-5 py-4 text-muted-foreground max-w-xs truncate">{order.order_details}</td>
                    <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                      {moment(order.order_date).format("MMM D, YYYY · h:mm A")}
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditOrder(order); setFormOpen(true); }}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-secondary"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(order.id)}
                          className="p-2 text-muted-foreground hover:text-red-400 transition-colors rounded-md hover:bg-secondary"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-border">
            {orders.map((order) => (
              <div key={order.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground">{order.client_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {moment(order.order_date).format("MMM D, YYYY · h:mm A")}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-sm text-muted-foreground">{order.order_details}</p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => { setEditOrder(order); setFormOpen(true); }}
                    className="text-xs text-primary hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(order.id)}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <OrderFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        order={editOrder}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Order"
        description="This order will be permanently removed."
        onConfirm={handleDelete}
      />
    </div>
  );
}