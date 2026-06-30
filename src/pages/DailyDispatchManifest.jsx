import { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useEntityList } from "@/hooks/useEntityList";
import PageHeader from "../components/PageHeader";
import Spinner from "../components/Spinner";
import StatusPill, { PAYMENT_BADGE_STYLES, FULFILMENT_BADGE_STYLES } from "../components/StatusPill";
import { cleanClientName, isVisibleOrderRecord } from "../components/notes/memberIntelligenceUtils";
import { formatCurrency, getDatePart, getTimePart } from "../utils/formatting";
import { parseLineItems, findMatchedProduct, extractQuantity } from "../utils/productMatching";

const sectionStyle = {
  background: "#111111",
  border: "1px solid rgba(201,168,76,0.2)",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "16px"
};

const buttonStyle = {
  background: "transparent",
  border: "1px solid #C9A84C",
  color: "#C9A84C",
  fontFamily: "var(--font-body)",
  fontSize: "12px",
  fontWeight: 500,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  padding: "10px 16px",
  borderRadius: "2px",
  cursor: "pointer"
};

function formatOtherDate(value) {
  const datePart = getDatePart(value);
  if (!datePart) return "Date TBC";
  const timePart = getTimePart(value);
  const date = new Date(`${datePart}T00:00:00`);
  const dateLabel = date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  return timePart === "Time TBC" ? `${dateLabel} — Time TBC` : `${dateLabel} at ${timePart}`;
}

function StockBadge({ product }) {
  if (!product) return null;

  const isLow = Number(product.current_stock || 0) <= Number(product.low_stock_threshold || 0);

  return (
    <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: isLow ? "#C2185B" : "rgba(245,240,232,0.55)", letterSpacing: "0.04em" }}>
      Stock: {Number(product.current_stock || 0)}
    </span>
  );
}

function ChecklistRow({ orderId, item, products, checked, onToggle }) {
  const product = findMatchedProduct(item, products);

  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
      <input type="checkbox" checked={checked} onChange={() => onToggle(orderId, item)} style={{ marginTop: "3px", accentColor: "#C9A84C" }} />
      <span style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center", color: "#F5F0E8", fontFamily: "var(--font-body)", fontSize: "13px", lineHeight: 1.5 }}>
        <span>{item}</span>
        <StockBadge product={product} />
      </span>
    </label>
  );
}

function OrderDetailCard({ order, products, checkedItems, onToggleItem, onStatusChange, readOnly = false, accentBorderColor }) {
  const items = parseLineItems(order.order_list);
  const checkedMap = checkedItems[order.id] || {};
  const allPacked = items.length > 0 && items.every((item) => checkedMap[item]);
  const isFulfilled = order.fulfilment_status === "Fulfilled";

  return (
    <div style={{ background: isFulfilled ? "rgba(22, 101, 52, 0.3)" : allPacked ? "rgba(57,255,20,0.08)" : "#1a1a1a", border: `1px solid ${isFulfilled ? "rgba(22,163,74,0.35)" : allPacked ? "rgba(57,255,20,0.25)" : "rgba(201,168,76,0.18)"}`, borderLeft: `4px solid ${isFulfilled ? "#16a34a" : accentBorderColor || "rgba(201,168,76,0.18)"}`, padding: "18px", display: "grid", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ display: "grid", gap: "6px", flex: 1 }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 700, color: "#F5F0E8" }}>{cleanClientName(order.client_name)}</p>
            {isFulfilled && <span style={{ display: "inline-flex", alignItems: "center", padding: "6px 10px", border: "1px solid rgba(22,163,74,0.55)", background: "rgba(22,163,74,0.16)", color: "#86efac", fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "2px" }}>✓ Fulfilled</span>}
          </div>
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.52)" }}>{order.delivery_address || "Address TBC"}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center" }}>
            {allPacked && <span style={{ color: "#39ff14", fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>✓ Packed</span>}
            <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: 700, color: "#F5F0E8" }}>{getTimePart(order.delivery_date)}</p>
            <StatusPill value={order.payment_status} styleMap={PAYMENT_BADGE_STYLES} />
          </div>
        </div>
      </div>

      <div style={{ opacity: isFulfilled ? 0.6 : 1, display: "grid", gap: "16px" }}>
        <div style={{ display: "grid", gap: "10px", padding: "14px", background: "#111111", border: "1px solid rgba(201,168,76,0.14)" }}>
          {items.length === 0 ? (
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.45)" }}>No stock items listed.</p>
          ) : items.map((item) => (
            readOnly ? (
              <div key={`${order.id}-${item}`} style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center", color: "#F5F0E8", fontFamily: "var(--font-body)", fontSize: "13px", lineHeight: 1.5 }}>
                <span>{item}</span>
                <StockBadge product={findMatchedProduct(item, products)} />
              </div>
            ) : (
              <ChecklistRow key={`${order.id}-${item}`} orderId={order.id} item={item} products={products} checked={!!checkedMap[item]} onToggle={onToggleItem} />
            )
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", flexWrap: "wrap", alignItems: "center", paddingTop: "4px" }}>
          <div>
            {order.payment_status === "CASH" ? (
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "#C9A84C" }}>{formatCurrency(order.order_total)} — Collect cash on delivery</p>
            ) : <div />}
          </div>
          {!readOnly && (
            <select
              value={order.fulfilment_status || "Active"}
              onChange={(e) => onStatusChange(order.id, e.target.value)}
              style={{ background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.2)", color: "#F5F0E8", padding: "10px 12px", fontFamily: "var(--font-body)", fontSize: "13px", minWidth: "180px", outline: "none" }}
            >
              <option value="Active">Active</option>
              <option value="Fulfilled">Fulfilled</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DailyDispatchManifest() {
  const { data: memberOrders, loading: loadingOrders } = useEntityList("MemberOrder", "delivery_date", 1000);
  const { data: products, loading: loadingProducts } = useEntityList("Product", "product_name", 1000);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [checkedItems, setCheckedItems] = useState({});

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayLabel = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const todaysOrders = useMemo(() => {
    return (memberOrders || [])
      .filter(isVisibleOrderRecord)
      .filter((order) => order.delivery_date && order.delivery_date.startsWith(todayStr))
      .filter((order) => order.fulfilment_status === "Active" || order.fulfilment_status === "Fulfilled")
      .filter((order) => order.fulfilment_status !== "Cancelled")
      .sort((a, b) => {
        if (a.fulfilment_status === "Fulfilled" && b.fulfilment_status !== "Fulfilled") return 1;
        if (a.fulfilment_status !== "Fulfilled" && b.fulfilment_status === "Fulfilled") return -1;
        return (a.delivery_date || "").localeCompare(b.delivery_date || "");
      });
  }, [memberOrders, todayStr]);

  const upcomingOrders = useMemo(() => {
    return (memberOrders || [])
      .filter(isVisibleOrderRecord)
      .filter((order) => order.fulfilment_status !== "Cancelled")
      .filter((order) => {
        const datePart = getDatePart(order.delivery_date);
        return datePart && datePart > todayStr;
      })
      .sort((a, b) => String(a.delivery_date || "").localeCompare(String(b.delivery_date || "")));
  }, [memberOrders, todayStr]);

  const pastOrders = useMemo(() => {
    return (memberOrders || [])
      .filter(isVisibleOrderRecord)
      .filter((order) => order.fulfilment_status !== "Cancelled")
      .filter((order) => {
        const datePart = getDatePart(order.delivery_date);
        return datePart && datePart < todayStr;
      })
      .sort((a, b) => String(b.delivery_date || "").localeCompare(String(a.delivery_date || "")));
  }, [memberOrders, todayStr]);

  const toggleExpanded = (orderId) => {
    setExpandedOrders((current) => ({ ...current, [orderId]: !current[orderId] }));
  };

  const toggleChecklistItem = (orderId, item) => {
    setCheckedItems((current) => ({
      ...current,
      [orderId]: {
        ...(current[orderId] || {}),
        [item]: !(current[orderId] || {})[item]
      }
    }));
  };

  const handleStatusChange = async (orderId, newValue) => {
    const targetOrder = (memberOrders || []).find((order) => order.id === orderId);
    await base44.entities.MemberOrder.update(orderId, { fulfilment_status: newValue });

    if (newValue !== "Fulfilled" || !targetOrder) {
      return;
    }

    const items = parseLineItems(targetOrder.order_list);

    for (const item of items) {
      const { productName, quantity } = extractQuantity(item);
      const matchedProduct = findMatchedProduct(productName, products);

      if (!matchedProduct) {
        continue;
      }

      const nextStock = Math.max(0, Number(matchedProduct.current_stock || 0) - quantity);

      try {
        await base44.entities.Product.update(matchedProduct.id, {
          current_stock: nextStock
        });
      } catch {
        toast.error(`Stock update failed for ${matchedProduct.product_name || productName} — please adjust manually in Catalogue`);
      }
    }

    toast.success("Order fulfilled — stock levels updated");
  };

  if (loadingOrders || loadingProducts) return <Spinner />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      <PageHeader title="Dispatch Manifest" subtitle="Live packing checklist with fulfilment updates and stock visibility." />

      <section style={sectionStyle}>
        <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "34px", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.04em" }}>Dispatch — {todayLabel}</p>
        {todaysOrders.length === 0 ? (
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(245,240,232,0.6)" }}>No deliveries scheduled for today.</p>
        ) : (
          <div style={{ display: "grid", gap: "14px" }}>
            {todaysOrders.map((order) => (
              <OrderDetailCard key={order.id} order={order} products={products} checkedItems={checkedItems} onToggleItem={toggleChecklistItem} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </section>

      <section style={sectionStyle}>
        <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "26px", fontWeight: 600, color: "#C9A84C", letterSpacing: "0.04em" }}>Upcoming Orders</p>
        {upcomingOrders.length === 0 ? (
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(245,240,232,0.6)" }}>No upcoming orders scheduled.</p>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {upcomingOrders.map((order) => {
              const isExpanded = !!expandedOrders[order.id];
              const accentColor = order.payment_status === "PENDING" || order.payment_status === "CASH" ? "#C9A84C" : "#39ff14";
              return (
                <div key={order.id} style={{ display: "grid", gap: "14px", background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.18)", borderLeft: `4px solid ${accentColor}`, padding: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ display: "grid", gap: "4px" }}>
                      <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", color: "#F5F0E8" }}>{cleanClientName(order.client_name)}</p>
                      <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.52)" }}>{formatOtherDate(order.delivery_date)}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <StatusPill value={order.payment_status} styleMap={PAYMENT_BADGE_STYLES} />
                      <button onClick={() => toggleExpanded(order.id)} style={buttonStyle}>{isExpanded ? "Close ▴" : "View Order ▾"}</button>
                    </div>
                  </div>
                  {isExpanded && (
                    <OrderDetailCard order={order} products={products} checkedItems={checkedItems} onToggleItem={toggleChecklistItem} onStatusChange={handleStatusChange} accentBorderColor={accentColor} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section style={sectionStyle}>
        <div style={{ display: "grid", gap: "4px" }}>
          <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "26px", fontWeight: 600, color: "#C9A84C", letterSpacing: "0.04em" }}>Past Orders</p>
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.5)" }}>Completed deliveries — used for reporting</p>
        </div>
        {pastOrders.length === 0 ? (
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(245,240,232,0.6)" }}>No past orders on record yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            {pastOrders.map((order) => (
              <div key={order.id} style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "center", background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.18)", padding: "16px" }}>
                <div style={{ display: "grid", gap: "4px" }}>
                  <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", color: "#F5F0E8" }}>{cleanClientName(order.client_name)}</p>
                  <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.52)" }}>{formatOtherDate(order.delivery_date)}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <StatusPill value={order.fulfilment_status} styleMap={FULFILMENT_BADGE_STYLES} fallbackKey="Active" />
                  <StatusPill value={order.payment_status} styleMap={PAYMENT_BADGE_STYLES} />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#F5F0E8" }}>{formatCurrency(order.order_total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}