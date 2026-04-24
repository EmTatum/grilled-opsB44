import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { formatDeliveryDateTime, formatRand } from "./memberIntelligenceUtils";

const statusStyle = {
  Fulfilled: { border: "1px solid rgba(255,255,255,0.2)", color: "rgba(245,240,232,0.7)", background: "rgba(255,255,255,0.05)" },
  Cancelled: { border: "1px solid rgba(194,24,91,0.4)", color: "#C2185B", background: "rgba(194,24,91,0.08)" }
};

export default function MemberHistorySection({ orders, notesById, onViewReport }) {
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
          <div style={{ display: "grid", gap: "12px", marginTop: "18px" }}>
            {orders.map((order) => {
              const linkedNote = notesById[order.intelligence_report_id] || Object.values(notesById).find((note) => String(note.client_name || "").trim().toLowerCase() === String(order.client_name || "").trim().toLowerCase()) || null;

              return (
                <div key={order.id} style={{ padding: "16px", background: "#111111", border: "1px solid rgba(201,168,76,0.12)", display: "grid", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start", flexWrap: "wrap" }}>
                    <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "22px", color: "#F5F0E8" }}>{order.client_name || "Unknown Client"}</p>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", padding: "6px 10px", ...statusStyle[order.fulfilment_status], fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                        {order.fulfilment_status}
                      </span>
                      <button onClick={() => onViewReport(order)} style={{ background: "transparent", border: "1px solid #C9A84C", color: "#C9A84C", fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "8px 12px", cursor: "pointer", opacity: 1 }}>
                        📋 Full Report
                      </button>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.6)" }}>{formatDeliveryDateTime(order.delivery_date)}</p>
                  <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: order.delivery_address ? "#F5F0E8" : "rgba(245,240,232,0.45)", fontStyle: order.delivery_address ? "normal" : "italic", whiteSpace: "pre-wrap" }}>📍 {order.delivery_address || "Address TBC"}</p>
                  <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "#d29c6c" }}>💰 {formatRand(order.order_total)}</p>
                  <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.7)", whiteSpace: "pre-wrap" }}>🧾 {order.order_list || "No order list recorded"}</p>
                  <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.7)" }}>💳 {order.payment_status || "PENDING"}</p>
                  <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.58)", fontStyle: "italic", whiteSpace: "pre-wrap" }}>⚡ {order.next_action || "No next action set"}</p>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}