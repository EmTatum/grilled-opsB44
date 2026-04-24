import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { formatRand } from "./memberIntelligenceUtils";

const statusStyle = {
  Fulfilled: { border: "1px solid rgba(255,255,255,0.2)", color: "rgba(245,240,232,0.7)", background: "rgba(255,255,255,0.05)" },
  Cancelled: { border: "1px solid rgba(194,24,91,0.4)", color: "#C2185B", background: "rgba(194,24,91,0.08)" }
};

export default function MemberHistorySection({ orders }) {
  return (
    <Collapsible>
      <div style={{ background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.18)", padding: "20px" }}>
        <CollapsibleTrigger asChild>
          <button style={{ width: "100%", textAlign: "left", background: "transparent", border: "none", padding: 0, cursor: "pointer" }}>
            <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", color: "#C9A84C", letterSpacing: "0.08em", textTransform: "uppercase" }}>Fulfilled / Cancelled History</p>
            <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.45)" }}>{orders.length} archived member orders</p>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div style={{ display: "grid", gap: "10px", marginTop: "18px" }}>
            {orders.map((order) => (
              <div key={order.id} style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(120px, 1fr) minmax(120px, 1fr) auto", gap: "12px", alignItems: "center", padding: "14px", background: "#111111", border: "1px solid rgba(201,168,76,0.12)" }}>
                <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "14px", color: "#F5F0E8" }}>{order.client_name || "Unknown Client"}</p>
                <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.6)" }}>{order.delivery_date || "No date set"}</p>
                <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "#d29c6c" }}>{formatRand(order.order_total)}</p>
                <span style={{ display: "inline-flex", alignItems: "center", padding: "6px 10px", ...statusStyle[order.fulfilment_status], fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  {order.fulfilment_status}
                </span>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}