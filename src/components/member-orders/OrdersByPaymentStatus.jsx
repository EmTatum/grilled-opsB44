import StatusBadge from "../StatusBadge";

export default function OrdersByPaymentStatus({ counts }) {
  const rows = [
    { label: "PAID", value: counts.PAID || 0 },
    { label: "CASH", value: counts.CASH || 0 },
    { label: "PENDING", value: counts.PENDING || 0 },
  ];

  return (
    <div style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.2)" }}>
      <div style={{ background: "#0a0a0a", borderBottom: "1px solid rgba(201,168,76,0.3)", padding: "14px 18px" }}>
        <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(201,168,76,0.7)" }}>Orders by Payment Status</p>
      </div>
      <div style={{ padding: "8px 18px 14px", display: "grid", gap: "10px" }}>
        {rows.map((row) => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "10px 0" }}>
            <StatusBadge status={row.label} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#F5F0E8" }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}