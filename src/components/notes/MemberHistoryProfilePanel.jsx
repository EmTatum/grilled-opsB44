import React, { useMemo } from "react";
import { cleanClientName, consolidateOrderList, formatCurrency, formatDeliveryDate, normalizeClientName } from "./memberIntelligenceUtils";

const panelStyle = {
  background: "var(--color-bg-secondary)",
  border: "1px solid var(--color-border-gold)",
  padding: "24px",
  display: "grid",
  gap: "18px",
  borderRadius: "6px",
  boxShadow: "0 2px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(201,168,76,0.06)"
};

const metricCardStyle = {
  background: "#111111",
  border: "1px solid rgba(201,168,76,0.16)",
  padding: "16px",
  display: "grid",
  gap: "6px"
};

function extractProducts(orderList) {
  return String(orderList || "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => !/(delivery|fee|charge|tip)/i.test(item))
    .map((item) => item.replace(/^\s*\d+\s*x\s*/i, "").replace(/^\s*x\s*\d+\s*/i, "").replace(/^\s*\d+\s+/i, "").trim())
    .filter(Boolean);
}

export default function MemberHistoryProfilePanel({ selectedOrder, orders }) {
  const history = useMemo(() => {
    if (!selectedOrder) return [];

    return [...orders]
      .filter((order) => normalizeClientName(order.client_name) === normalizeClientName(selectedOrder.client_name))
      .sort((a, b) => String(b.delivery_date || b.created_date || "").localeCompare(String(a.delivery_date || a.created_date || "")));
  }, [orders, selectedOrder]);

  const lifetimeSpend = useMemo(() => {
    return history.reduce((sum, order) => sum + Number(order.order_total || 0), 0);
  }, [history]);

  const purchasedProducts = useMemo(() => {
    const unique = new Map();
    history.forEach((order) => {
      extractProducts(order.order_list).forEach((product) => {
        const key = product.toLowerCase();
        if (!unique.has(key)) unique.set(key, product);
      });
    });
    return Array.from(unique.values()).sort((a, b) => a.localeCompare(b));
  }, [history]);

  if (!selectedOrder) {
    return (
      <section style={panelStyle}>
        <div>
          <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", color: "#C9A84C", letterSpacing: "0.08em", textTransform: "uppercase" }}>Member History</p>
          <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.5)" }}>Select a live MemberOrder card to view the client profile and historical purchases.</p>
        </div>
      </section>
    );
  }

  return (
    <section style={panelStyle}>
      <div>
        <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", color: "#C9A84C", letterSpacing: "0.08em", textTransform: "uppercase" }}>Member History</p>
        <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.5)" }}>{cleanClientName(selectedOrder.client_name)}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
        <div style={metricCardStyle}>
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "11px", color: "rgba(201,168,76,0.65)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Lifetime Spend</p>
          <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "30px", color: "#C9A84C" }}>{formatCurrency(lifetimeSpend)}</p>
        </div>
        <div style={metricCardStyle}>
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "11px", color: "rgba(201,168,76,0.65)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Total Orders</p>
          <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "30px", color: "#C9A84C" }}>{history.length}</p>
        </div>
      </div>

      <div style={{ display: "grid", gap: "10px" }}>
        <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "20px", color: "#C9A84C", letterSpacing: "0.08em", textTransform: "uppercase" }}>Previously Purchased Products</p>
        {purchasedProducts.length === 0 ? (
          <div style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.16)", padding: "14px" }}>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.55)" }}>No previous products recorded yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {purchasedProducts.map((product) => (
              <span key={product} style={{ display: "inline-flex", alignItems: "center", padding: "6px 10px", border: "1px solid rgba(201,168,76,0.45)", background: "rgba(201,168,76,0.1)", color: "#C9A84C", fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {product}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gap: "10px" }}>
        <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "20px", color: "#C9A84C", letterSpacing: "0.08em", textTransform: "uppercase" }}>Historical Orders</p>
        {history.map((order) => (
          <div key={order.id} style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.16)", padding: "14px", display: "grid", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600, color: "#F5F0E8" }}>{formatDeliveryDate(order.delivery_date)}</p>
              <span style={{ display: "inline-flex", alignItems: "center", padding: "6px 10px", border: order.fulfilment_status === "Cancelled" ? "1px solid rgba(194,24,91,0.4)" : order.fulfilment_status === "Fulfilled" ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(201,168,76,0.45)", background: order.fulfilment_status === "Cancelled" ? "rgba(194,24,91,0.08)" : order.fulfilment_status === "Fulfilled" ? "rgba(255,255,255,0.05)" : "rgba(201,168,76,0.1)", color: order.fulfilment_status === "Cancelled" ? "#C2185B" : order.fulfilment_status === "Fulfilled" ? "rgba(245,240,232,0.7)" : "#C9A84C", fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {order.fulfilment_status || "Active"}
              </span>
            </div>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "#d29c6c" }}>{formatCurrency(order.order_total || 0)}</p>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.7)", whiteSpace: "pre-wrap" }}>{consolidateOrderList(order.order_list || "") || "No order list recorded"}</p>
          </div>
        ))}
      </div>
    </section>
  );
}