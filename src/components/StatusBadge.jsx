const styles = {
  Pending:   { border: "1px solid rgba(210,156,108,0.5)",   bg: "rgba(210,156,108,0.1)",   color: "#d29c6c" },
  Confirmed: { border: "1px solid rgba(255,255,255,0.2)",   bg: "rgba(255,255,255,0.05)",  color: "rgba(245,240,232,0.7)" },
  Fulfilled: { border: "1px solid rgba(255,255,255,0.2)",   bg: "rgba(255,255,255,0.05)",  color: "rgba(245,240,232,0.7)" },
  Cancelled: { border: "1px solid rgba(141,32,28,0.45)",    bg: "rgba(141,32,28,0.08)",     color: "#8d201c" },
  Low:       { border: "1px solid rgba(255,255,255,0.2)",   bg: "rgba(255,255,255,0.05)",  color: "rgba(245,240,232,0.7)" },
  Medium:    { border: "1px solid rgba(210,156,108,0.5)",   bg: "rgba(210,156,108,0.1)",   color: "#d29c6c" },
  High:      { border: "1px solid rgba(141,32,28,0.45)",    bg: "rgba(141,32,28,0.08)",     color: "#8d201c" },
};

export default function StatusBadge({ status }) {
  const s = styles[status] || styles.Confirmed;
  return (
    <span style={{
      ...s, borderRadius: "2px",
      background: s.bg,
      fontFamily: "var(--font-body)",
      fontSize: "10px", fontWeight: 500,
      letterSpacing: "0.1em", textTransform: "uppercase",
      padding: "4px 9px",
      display: "inline-flex", alignItems: "center",
    }}>
      {status}
    </span>
  );
}