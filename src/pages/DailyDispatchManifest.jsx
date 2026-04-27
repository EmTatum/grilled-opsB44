import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import PageHeader from "../components/PageHeader";

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <div style={{ width: "24px", height: "24px", border: "1px solid rgba(201,168,76,0.2)", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

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

const paymentStyles = {
  PAID: { background: "rgba(57,255,20,0.14)", border: "1px solid rgba(57,255,20,0.65)", color: "#39ff14" },
  CASH: { background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.45)", color: "#C9A84C" },
  PENDING: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(245,240,232,0.7)" }
};

const fulfilmentStyles = {
  Fulfilled: { background: "rgba(57,255,20,0.14)", border: "1px solid rgba(57,255,20,0.65)", color: "#39ff14" },
  Cancelled: { background: "rgba(194,24,91,0.08)", border: "1px solid rgba(194,24,91,0.4)", color: "#C2185B" },
  Active: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(245,240,232,0.7)" }
};

function getDatePart(value) {
  return String(value || "").trim().split("T")[0] || "";
}

function getTimePart(value) {
  const raw = String(value || "").trim();
  if (!raw.includes("T")) return "Time TBC";
  const [, timePart = ""] = raw.split("T");
  return timePart ? timePart.slice(0, 5) : "Time TBC";
}

function formatOtherDate(value) {
  const datePart = getDatePart(value);
  if (!datePart) return "Date TBC";
  const timePart = getTimePart(value);
  const date = new Date(`${datePart}T00:00:00`);
  const dateLabel = date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  return timePart === "Time TBC" ? `${dateLabel} — Time TBC` : `${dateLabel} at ${timePart}`;
}

function formatCurrency(value) {
  return `R${Number(value || 0).toLocaleString("en-ZA")}`;
}

function parseLineItems(orderList) {
  const raw = String(orderList || "").trim();
  if (!raw) return [];

  let items = raw.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  if (items.length <= 1) {
    items = raw.split(",").map((item) => item.trim()).filter(Boolean);
  }

  return items.filter((item) => !/(delivery|fee|charge|tip)/i.test(item));
}

function findMatchedProduct(item, products) {
  const normalizedItem = String(item || "").toLowerCase().trim();

  return (products || []).find((product) => {
    const name = String(product.product_name || "").toLowerCase().trim();
    return name && (normalizedItem.includes(name) || name.includes(normalizedItem));
  }) || null;
}

function extractQuantityAndProductName(item) {
  const raw = String(item || "").trim();
  if (!raw) return { productName: "", quantity: 1 };

  let quantity = 1;
  let productName = raw;

  const patterns = [
    /^\s*(\d+)\s*x\s+/i,
    /^\s*x\s*(\d+)\s+/i,
    /^\s*(\d+)\s+/i,
    /\((\d+)\)/,
    /\bx\s*(\d+)\b/i,
    /\b(\d+)x\b/i
  ];

  patterns.some((pattern) => {
    const match = raw.match(pattern);
    if (!match) return false;
    quantity = Number(match[1]) || 1;
    productName = raw.replace(match[0], " ").replace(/\s+/g, " ").trim();
    return true;
  });

  return { productName, quantity: Math.max(1, quantity) };
}

function PaymentPill({ value }) {
  const style = paymentStyles[value] || paymentStyles.PENDING;
  return (
    <span style={{ ...style, display: "inline-flex", alignItems: "center", padding: "6px 10px", fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "2px" }}>
      {value || "PENDING"}
    </span>
  );
}

function FulfilmentPill({ value }) {
  const style = fulfilmentStyles[value] || fulfilmentStyles.Active;
  return (
    <span style={{ ...style, display: "inline-flex", alignItems: "center", padding: "6px 10px", fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "2px" }}>
      {value || "Active"}
    </span>
  );
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

  return (
    <div style={{ background: allPacked ? "rgba(57,255,20,0.08)" : "#1a1a1a", border: `1px solid ${allPacked ? "rgba(57,255,20,0.25)" : "rgba(201,168,76,0.18)"}`, borderLeft: accentBorderColor ? `4px solid ${accentBorderColor}` : undefined, padding: "18px", display: "grid", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ display: "grid", gap: "6px", flex: 1 }}>
          <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 700, color: "#F5F0E8" }}>{order.client_name || "Unknown Client"}</p>
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.52)" }}>{order.delivery_address || "Address TBC"}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center" }}>
            {allPacked && <span style={{ color: "#39ff14", fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>✓ Packed</span>}
            <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: 700, color: "#F5F0E8" }}>{getTimePart(order.delivery_date)}</p>
            <PaymentPill value={order.payment_status} />
          </div>
        </div>
      </div>

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

      <div style={{ display: "flex", justifyContent: "space-between", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
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
  );
}

export default function DailyDispatchManifest() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    const load = async () => {
      const [memberOrders, productRecords] = await Promise.all([
        base44.entities.MemberOrder.list("delivery_date", 1000),
        base44.entities.Product.list("product_name", 1000)
      ]);

      setOrders((memberOrders || []).sort((a, b) => String(a.delivery_date || "").localeCompare(String(b.delivery_date || ""))));
      setProducts(productRecords || []);
      setLoading(false);
    };

    load();

    const unsubscribeOrders = base44.entities.MemberOrder.subscribe(() => {
      load();
    });

    const unsubscribeProducts = base44.entities.Product.subscribe(() => {
      load();
    });

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
    };
  }, []);

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayLabel = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const todaysOrders = useMemo(() => {
    return orders
      .filter((order) => String(order.delivery_date || "").startsWith(todayKey))
      .sort((a, b) => getTimePart(a.delivery_date).localeCompare(getTimePart(b.delivery_date)));
  }, [orders, todayKey]);

  const upcomingOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const datePart = getDatePart(order.delivery_date);
        return datePart && datePart > todayKey;
      })
      .sort((a, b) => String(a.delivery_date || "").localeCompare(String(b.delivery_date || "")));
  }, [orders, todayKey]);

  const pastOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const datePart = getDatePart(order.delivery_date);
        return datePart && datePart < todayKey;
      })
      .sort((a, b) => String(b.delivery_date || "").localeCompare(String(a.delivery_date || "")));
  }, [orders, todayKey]);

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
    const targetOrder = orders.find((order) => order.id === orderId);
    await base44.entities.MemberOrder.update(orderId, { fulfilment_status: newValue });
    setOrders((current) => current.map((order) => order.id === orderId ? { ...order, fulfilment_status: newValue } : order));

    if (newValue !== "Fulfilled" || !targetOrder) {
      return;
    }

    const items = parseLineItems(targetOrder.order_list);

    for (const item of items) {
      const { productName, quantity } = extractQuantityAndProductName(item);
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

  if (loading) return <Spinner />;

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
                <div key={order.id} style={{ display: "grid", gap: "10px", background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.18)", borderLeft: `4px solid ${accentColor}`, padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ display: "grid", gap: "4px" }}>
                      <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", color: "#F5F0E8" }}>{order.client_name || "Unknown Client"}</p>
                      <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.52)" }}>{formatOtherDate(order.delivery_date)}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <PaymentPill value={order.payment_status} />
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
                  <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", color: "#F5F0E8" }}>{order.client_name || "Unknown Client"}</p>
                  <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.52)" }}>{formatOtherDate(order.delivery_date)}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <FulfilmentPill value={order.fulfilment_status} />
                  <PaymentPill value={order.payment_status} />
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