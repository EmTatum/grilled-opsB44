import { useState, useEffect, Fragment, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, ChevronDown, CalendarDays } from "lucide-react";
import OrderLifecycle from "../components/OrderLifecycle";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import OrderFormDialog from "../components/OrderFormDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import BulkActionsBar from "../components/orders/BulkActionsBar";
import { exportOrdersPdf } from "../utils/exportOrdersPdf";
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
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [archivedFulfilled, setArchivedFulfilled] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [pendingBulkStatus, setPendingBulkStatus] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const toggleExpanded = (id) => setExpandedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  const load = async () => {
    const me = await base44.auth.me();
    setCurrentUser(me);
    const all = await base44.entities.Order.list("-order_date", 200);
    // Auto-remove cancelled orders
    const cancelled = all.filter(o => o.status === "Cancelled");
    await Promise.all(cancelled.map(o => base44.entities.Order.delete(o.id)));
    // Auto-remove fulfilled orders whose date has passed
    const pastFulfilled = all.filter(o => o.status === "Fulfilled" && moment(o.order_date).isBefore(moment(), "day"));
    await Promise.all(pastFulfilled.map(o => base44.entities.Order.delete(o.id)));
    const active = all.filter(o => o.status !== "Cancelled" && !(o.status === "Fulfilled" && moment(o.order_date).isBefore(moment(), "day")));
    setOrders(active);
    setSelectedIds((prev) => new Set([...prev].filter((id) => active.some((order) => order.id === id))));
    // Keep past fulfilled as archive cards
    setArchivedFulfilled(pastFulfilled);
    setLoading(false);
  };

  const isUrgent = (order) => {
    if (order.status !== "Pending") return false;
    const slot = order.time_slot;
    // Try to parse time_slot as a datetime-aware moment using order_date as base date
    const base = moment(order.order_date);
    let slotMoment = null;
    if (slot) {
      // e.g. "3:00 PM" — attach to the order date
      const parsed = moment(`${base.format("YYYY-MM-DD")} ${slot}`, "YYYY-MM-DD h:mm A", true);
      if (parsed.isValid()) slotMoment = parsed;
    }
    const reference = slotMoment || base;
    return reference.diff(moment(), "hours") <= 24 && reference.isAfter(moment());
  };

  const pendingCount = useMemo(() => orders.filter(o => o.status === "Pending").length, [orders]);
  const urgentCount = useMemo(() => orders.filter(o => isUrgent(o)).length, [orders]);

  // Chronological calendar data — sorted ascending by date, grouped by day
  const calendarGroups = useMemo(() => {
    const sorted = [...orders].sort((a, b) => moment(a.order_date).diff(moment(b.order_date)));
    const total = sorted.length;
    // Intense gradient: vivid red → vivid yellow → vivid green
    const interpolate = (idx) => {
      const t = total <= 1 ? 0.5 : idx / (total - 1);
      let r, g, b;
      if (t < 0.5) {
        const s = t / 0.5;
        // Vivid red (#FF1744) → vivid yellow (#FFD600)
        r = 255;
        g = Math.round(23 + (214 - 23) * s);
        b = Math.round(68 + (0 - 68) * s);
      } else {
        const s = (t - 0.5) / 0.5;
        // Vivid yellow (#FFD600) → vivid green (#00E676)
        r = Math.round(255 + (0 - 255) * s);
        g = Math.round(214 + (230 - 214) * s);
        b = Math.round(0 + (118 - 0) * s);
      }
      return `rgb(${r},${g},${b})`;
    };
    const groups = {};
    sorted.forEach((order, idx) => {
      const day = moment(order.order_date).format("YYYY-MM-DD");
      if (!groups[day]) groups[day] = [];
      groups[day].push({ order, color: interpolate(idx) });
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [orders]);
  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    if (editOrder) await base44.entities.Order.update(editOrder.id, data);
    else await base44.entities.Order.create(data);
    setEditOrder(null); load();
  };
  const handleDelete = async () => { await base44.entities.Order.delete(deleteId); setDeleteId(null); load(); };
  const toggleSelected = (id) => setSelectedIds((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const toggleSelectAll = () => {
    if (selectedIds.size === orders.length) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(orders.map((order) => order.id)));
  };
  const selectedOrders = orders.filter((order) => selectedIds.has(order.id));
  const handleBulkUpdate = async () => {
    await Promise.all(selectedOrders.map((order) => base44.entities.Order.update(order.id, { status: pendingBulkStatus })));
    setPendingBulkStatus(null);
    setSelectedIds(new Set());
    load();
  };
  const handleExportSelected = () => exportOrdersPdf(selectedOrders);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Order Log" subtitle="Manage and track all client orders">
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ padding: "6px 14px", border: "1px solid rgba(201,168,76,0.35)", background: "rgba(201,168,76,0.07)" }}>
              <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: "9px", fontWeight: 600, color: "rgba(201,168,76,0.6)", letterSpacing: "0.18em", textTransform: "uppercase", display: "block", marginBottom: "2px" }}>Pending</span>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "20px", fontWeight: 600, color: "#C9A84C", lineHeight: 1 }}>{pendingCount}</span>
            </div>
            {urgentCount > 0 && (
              <div style={{ padding: "6px 14px", border: "1px solid rgba(194,24,91,0.5)", background: "rgba(194,24,91,0.08)" }}>
                <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: "9px", fontWeight: 600, color: "rgba(194,24,91,0.7)", letterSpacing: "0.18em", textTransform: "uppercase", display: "block", marginBottom: "2px" }}>Urgent</span>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: "20px", fontWeight: 600, color: "#C2185B", lineHeight: 1 }}>{urgentCount}</span>
              </div>
            )}
          </div>
          <Link to="/orders-planner" style={{ background: "transparent", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C", fontFamily: "'Raleway', sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", padding: "10px 18px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <CalendarDays size={12} /> Calendar View
          </Link>
          <Link to="/daily-dispatch-manifest" style={{ background: "transparent", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C", fontFamily: "'Raleway', sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", padding: "10px 18px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <CalendarDays size={12} /> Dispatch Sheet
          </Link>
          <GoldBtn onClick={() => { setEditOrder(null); setFormOpen(true); }}><Plus size={12} /> New Order</GoldBtn>
        </div>
      </PageHeader>

      {/* ── Calendar View ── */}
      {calendarGroups.length > 0 && (
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ height: "1px", flex: 1, background: "rgba(201,168,76,0.15)" }} />
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.3em", color: "rgba(201,168,76,0.45)", textTransform: "uppercase" }}>Schedule</span>
            <div style={{ height: "1px", flex: 1, background: "rgba(201,168,76,0.15)" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {calendarGroups.map(([day, entries]) => (
              <div key={day}>
                {/* Date header */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                  <div style={{ minWidth: "80px" }}>
                    <p style={{ fontFamily: "'Cinzel', serif", fontSize: "22px", fontWeight: 600, color: "#C9A84C", lineHeight: 1, margin: 0 }}>{moment(day).format("D")}</p>
                    <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "10px", fontWeight: 600, color: "#C9A84C", letterSpacing: "0.15em", textTransform: "uppercase", margin: "1px 0 0" }}>{moment(day).format("ddd")}</p>
                    <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "9px", fontWeight: 400, color: "rgba(201,168,76,0.45)", letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>{moment(day).format("MMM YYYY")}</p>
                  </div>
                  <div style={{ flex: 1, height: "1px", background: "rgba(201,168,76,0.12)" }} />
                  <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: "9px", color: "rgba(245,240,232,0.2)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                    {moment(day).isSame(moment(), "day") ? "Today" : moment(day).isSame(moment().add(1, "day"), "day") ? "Tomorrow" : moment(day).fromNow()}
                  </span>
                </div>
                {/* Order cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px", paddingLeft: "92px" }}>
                  {entries.map(({ order, color }) => (
                    <div key={order.id}
                      onClick={() => { setEditOrder(order); setFormOpen(true); }}
                      style={{
                        background: `linear-gradient(135deg, ${color}30 0%, rgba(14,14,14,1) 65%)`,
                        border: `1px solid ${color}70`,
                        borderLeft: `4px solid ${color}`,
                        boxShadow: `0 0 18px ${color}22, inset 0 0 40px ${color}08`,
                        padding: "12px 14px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        position: "relative",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${color}45 0%, rgba(14,14,14,1) 65%)`; e.currentTarget.style.boxShadow = `0 0 30px ${color}44`; e.currentTarget.style.borderColor = `${color}99`; }}
                      onMouseLeave={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${color}30 0%, rgba(14,14,14,1) 65%)`; e.currentTarget.style.boxShadow = `0 0 18px ${color}22, inset 0 0 40px ${color}08`; e.currentTarget.style.borderColor = `${color}70`; }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                        <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "12px", fontWeight: 600, color: "#F5F0E8", margin: 0 }}>{order.client_name}</p>
                        <StatusBadge status={order.status} />
                      </div>
                      {order.time_slot && (
                        <p style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", color, margin: "0 0 4px", letterSpacing: "0.05em" }}>{order.time_slot}</p>
                      )}
                      {order.order_value > 0 && (
                        <p style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", color: "rgba(201,168,76,0.7)", margin: "0 0 4px" }}>R{Number(order.order_value).toLocaleString()}</p>
                      )}
                      {order.order_details && (
                        <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "10px", color: "rgba(245,240,232,0.35)", margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>{order.order_details}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
            {currentUser?.role === "admin" && (
              <BulkActionsBar
                selectedCount={selectedIds.size}
                onMarkFulfilled={() => setPendingBulkStatus("Fulfilled")}
                onMarkCancelled={() => setPendingBulkStatus("Cancelled")}
                onExport={handleExportSelected}
              />
            )}

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#0d0d0d", borderBottom: "1px solid rgba(201,168,76,0.3)" }}>
                    {currentUser?.role === "admin" && (
                      <th style={{ padding: "14px 16px", width: "44px", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={orders.length > 0 && selectedIds.size === orders.length}
                          onChange={toggleSelectAll}
                          style={{ accentColor: "#C9A84C", cursor: "pointer" }}
                        />
                      </th>
                    )}
                    {["Client Name", "Order Value", "Items Summary", "Time Slot", "Payment Method", "Status", ""].map((h, i) => (
                    <th key={i} style={{ padding: "14px 16px", textAlign: i === 6 ? "right" : "left", fontFamily: "'Raleway', sans-serif", fontSize: "10px", fontWeight: 600, color: "rgba(201,168,76,0.55)", letterSpacing: "0.18em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => {
                    const urgent = isUrgent(order);
                    return (
                    <Fragment key={order.id}>
                    <tr
                      style={{ borderBottom: expandedIds.has(order.id) ? "none" : "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s", cursor: "pointer", background: urgent ? "rgba(194,24,91,0.06)" : "transparent", borderLeft: urgent ? "2px solid rgba(194,24,91,0.6)" : "2px solid transparent" }}
                      onMouseEnter={e => e.currentTarget.style.background = urgent ? "rgba(194,24,91,0.1)" : "rgba(201,168,76,0.04)"}
                      onMouseLeave={e => e.currentTarget.style.background = urgent ? "rgba(194,24,91,0.06)" : (expandedIds.has(order.id) ? "rgba(201,168,76,0.04)" : "transparent")}
                      onClick={() => toggleExpanded(order.id)}
                    >
                      {currentUser?.role === "admin" && (
                        <td style={{ padding: "14px 16px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(order.id)}
                            onChange={() => toggleSelected(order.id)}
                            style={{ accentColor: "#C9A84C", cursor: "pointer" }}
                          />
                        </td>
                      )}
                      <td style={{ padding: "14px 16px", fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "#F5F0E8", fontWeight: 500, whiteSpace: "nowrap" }}>{order.client_name}</td>
                      <td style={{ padding: "14px 16px", fontFamily: "'Cinzel', serif", fontSize: "14px", color: "#C9A84C", whiteSpace: "nowrap" }}>{order.order_value ? `R${Number(order.order_value).toLocaleString()}` : "—"}</td>
                      <td style={{ padding: "14px 16px", fontFamily: "'Raleway', sans-serif", fontSize: "12px", color: "rgba(245,240,232,0.55)", maxWidth: "220px" }}>
                        <span style={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>{order.order_details}</span>
                      </td>
                      <td style={{ padding: "14px 16px", fontFamily: "'Raleway', sans-serif", fontSize: "12px", color: "rgba(245,240,232,0.45)", whiteSpace: "nowrap" }}>{order.time_slot || moment(order.order_date).format("h:mm A")}</td>
                      <td style={{ padding: "14px 16px", fontFamily: "'Raleway', sans-serif", fontSize: "11px", color: "rgba(245,240,232,0.4)", whiteSpace: "nowrap", letterSpacing: "0.05em" }}>{order.payment_method || "—"}</td>
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
                          <ChevronDown size={13} strokeWidth={1.5} style={{ color: "rgba(245,240,232,0.2)", transition: "transform 0.2s", transform: expandedIds.has(order.id) ? "rotate(180deg)" : "rotate(0deg)", marginLeft: "4px" }} />
                        </div>
                      </td>
                    </tr>
                    {expandedIds.has(order.id) && (
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td colSpan={currentUser?.role === "admin" ? 8 : 7} style={{ padding: 0 }}>
                          <OrderLifecycle order={order} />
                        </td>
                      </tr>
                    )}
                    </Fragment>
                  );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden">
              {orders.map((order, idx) => {
                const urgent = isUrgent(order);
                return (
                 <div key={order.id} style={{ padding: "18px 20px", borderBottom: idx < orders.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", background: urgent ? "rgba(194,24,91,0.06)" : "transparent", borderLeft: urgent ? "3px solid rgba(194,24,91,0.6)" : "3px solid transparent" }}>
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
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── Archived Fulfilled Orders ── */}
      {archivedFulfilled.length > 0 && (
        <div style={{ marginTop: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ height: "1px", flex: 1, background: "rgba(245,240,232,0.06)" }} />
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "10px", letterSpacing: "0.3em", color: "rgba(245,240,232,0.2)", textTransform: "uppercase" }}>Fulfilled · Archived</span>
            <div style={{ height: "1px", flex: 1, background: "rgba(245,240,232,0.06)" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px" }}>
            {archivedFulfilled.map(order => (
              <div key={order.id} style={{ padding: "10px 14px", border: "1px solid rgba(245,240,232,0.06)", borderLeft: "3px solid rgba(245,240,232,0.1)", background: "rgba(255,255,255,0.02)", opacity: 0.55 }}>
                <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "11px", fontWeight: 600, color: "rgba(245,240,232,0.5)", margin: "0 0 3px" }}>{order.client_name}</p>
                <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "9px", color: "rgba(245,240,232,0.25)", margin: "0 0 3px", letterSpacing: "0.1em", textTransform: "uppercase" }}>{moment(order.order_date).format("ddd D MMM YYYY")}</p>
                {order.order_value > 0 && <p style={{ fontFamily: "'Cinzel', serif", fontSize: "12px", color: "rgba(201,168,76,0.35)", margin: 0 }}>R{Number(order.order_value).toLocaleString()}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <OrderFormDialog open={formOpen} onOpenChange={setFormOpen} order={editOrder} onSave={handleSave} />
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete Order" description="This order will be permanently removed from the log." onConfirm={handleDelete} />
      <ConfirmDialog
        open={!!pendingBulkStatus}
        onOpenChange={() => setPendingBulkStatus(null)}
        title="Update Selected Orders"
        description={`This will mark ${selectedIds.size} selected order${selectedIds.size === 1 ? "" : "s"} as ${pendingBulkStatus}.`}
        onConfirm={handleBulkUpdate}
        confirmLabel="Confirm"
      />
    </div>
  );
}