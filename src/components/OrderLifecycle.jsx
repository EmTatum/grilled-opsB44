import moment from "moment";

const STAGES = [
  { key: "Pending",   label: "Pending",   color: "#E8823A", desc: "Order received, awaiting confirmation." },
  { key: "Confirmed", label: "Confirmed", color: "#2ABFB0", desc: "Confirmed with client. Prep initiated."  },
  { key: "Fulfilled", label: "Dispatched",color: "#C9A84C", desc: "Order fulfilled and dispatched."         },
];

const STATUS_INDEX = { Pending: 0, Confirmed: 1, Fulfilled: 2, Cancelled: -1 };

export default function OrderLifecycle({ order }) {
  const currentIdx = STATUS_INDEX[order.status] ?? 0;
  const isCancelled = order.status === "Cancelled";

  // Build a simulated timestamped log based on what we know
  const log = [];
  if (order.created_date) {
    log.push({ label: "Order Created", time: order.created_date, color: "#E8823A" });
  }
  if (order.status === "Confirmed" || order.status === "Fulfilled") {
    log.push({ label: "Order Confirmed", time: order.updated_date || order.created_date, color: "#2ABFB0" });
  }
  if (order.status === "Fulfilled") {
    log.push({ label: "Dispatched", time: order.updated_date, color: "#C9A84C" });
  }
  if (order.status === "Cancelled") {
    log.push({ label: "Order Cancelled", time: order.updated_date || order.created_date, color: "#C2185B" });
  }

  return (
    <div style={{ background: "#0d0d0d", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr auto", gap: "32px", flexWrap: "wrap" }}>

      {/* ── LIFECYCLE TRACK ── */}
      <div>
        <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "9px", fontWeight: 600, color: "rgba(201,168,76,0.4)", letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: "18px" }}>
          Order Lifecycle
        </p>

        {isCancelled ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", border: "1px solid rgba(194,24,91,0.3)", background: "rgba(194,24,91,0.06)" }}>
            <div style={{ width: "8px", height: "8px", background: "#C2185B", flexShrink: 0 }} />
            <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: "12px", fontWeight: 500, color: "#C2185B", letterSpacing: "0.15em", textTransform: "uppercase" }}>Order Cancelled</span>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0", position: "relative" }}>
            {STAGES.map((stage, idx) => {
              const done    = idx < currentIdx;
              const active  = idx === currentIdx;
              const pending = idx > currentIdx;
              const color   = active ? stage.color : done ? stage.color : "rgba(245,240,232,0.1)";
              const isLast  = idx === STAGES.length - 1;

              return (
                <div key={stage.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: isLast ? "0 0 auto" : 1, minWidth: 0 }}>
                  {/* Node + connector row */}
                  <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                    {/* Node */}
                    <div style={{
                      width: "28px", height: "28px", flexShrink: 0,
                      border: `2px solid ${color}`,
                      background: active ? `${stage.color}22` : done ? `${stage.color}11` : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      position: "relative", zIndex: 1,
                      boxShadow: active ? `0 0 16px ${stage.color}44` : "none",
                      transition: "all 0.3s ease",
                    }}>
                      {done && (
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                          <path d="M1 5L4.5 8.5L11 1.5" stroke={stage.color} strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                      )}
                      {active && (
                        <div style={{ width: "8px", height: "8px", background: stage.color, boxShadow: `0 0 8px ${stage.color}` }} />
                      )}
                    </div>
                    {/* Connector line */}
                    {!isLast && (
                      <div style={{ flex: 1, height: "1px", background: done ? `${STAGES[idx].color}66` : "rgba(255,255,255,0.08)", marginLeft: "0" }} />
                    )}
                  </div>

                  {/* Label */}
                  <div style={{ marginTop: "10px", paddingRight: isLast ? 0 : "12px", width: "100%", minWidth: 0 }}>
                    <p style={{
                      fontFamily: "'Raleway', sans-serif",
                      fontSize: "10px", fontWeight: active ? 600 : 400,
                      color: active ? stage.color : done ? `${stage.color}99` : "rgba(245,240,232,0.2)",
                      letterSpacing: "0.12em", textTransform: "uppercase",
                      margin: "0 0 3px 0", whiteSpace: "nowrap",
                    }}>{stage.label}</p>
                    {active && (
                      <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "10px", color: "rgba(245,240,232,0.3)", margin: 0, lineHeight: 1.5 }}>{stage.desc}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── TIMESTAMP LOG ── */}
      <div style={{ minWidth: "180px" }}>
        <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "9px", fontWeight: 600, color: "rgba(201,168,76,0.4)", letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: "14px" }}>
          Activity Log
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {log.map((entry, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", paddingBottom: "12px", position: "relative" }}>
              {/* Vertical line */}
              {i < log.length - 1 && (
                <div style={{ position: "absolute", left: "5px", top: "12px", bottom: 0, width: "1px", background: "rgba(255,255,255,0.06)" }} />
              )}
              {/* Dot */}
              <div style={{ width: "11px", height: "11px", border: `1px solid ${entry.color}`, background: `${entry.color}22`, flexShrink: 0, marginTop: "2px", position: "relative", zIndex: 1 }} />
              <div>
                <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "11px", fontWeight: 500, color: entry.color, margin: "0 0 2px 0", letterSpacing: "0.06em" }}>{entry.label}</p>
                <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "10px", color: "rgba(245,240,232,0.28)", margin: 0, letterSpacing: "0.04em" }}>
                  {moment(entry.time).format("D MMM YYYY · h:mm A")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}