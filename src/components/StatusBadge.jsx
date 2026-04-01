const styles = {
  Pending:   { border: "1px solid rgba(201,168,76,0.4)",   bg: "rgba(201,168,76,0.07)",   color: "#C9A84C" },
  Confirmed: { border: "1px solid rgba(245,240,232,0.15)", bg: "rgba(245,240,232,0.04)",  color: "rgba(245,240,232,0.5)" },
  Fulfilled: { border: "1px solid rgba(245,240,232,0.15)", bg: "rgba(245,240,232,0.04)",  color: "rgba(245,240,232,0.5)" },
  Cancelled: { border: "1px solid rgba(194,24,91,0.5)",    bg: "rgba(194,24,91,0.1)",     color: "#C2185B" },
  Low:       { border: "1px solid rgba(245,240,232,0.15)", bg: "rgba(245,240,232,0.04)",  color: "rgba(245,240,232,0.5)" },
  Medium:    { border: "1px solid rgba(201,168,76,0.45)",  bg: "rgba(201,168,76,0.08)",   color: "#C9A84C" },
  High:      { border: "1px solid rgba(194,24,91,0.5)",    bg: "rgba(194,24,91,0.1)",     color: "#C2185B" },
};

export default function StatusBadge({ status }) {
  const s = styles[status] || styles.Confirmed;
  return (
    <span style={{
      ...s, borderRadius: "2px",
      background: s.bg,
      fontFamily: "'Raleway', sans-serif",
      fontSize: "9px", fontWeight: 500,
      letterSpacing: "0.18em", textTransform: "uppercase",
      padding: "4px 9px",
      display: "inline-flex", alignItems: "center",
    }}>
      {status}
    </span>
  );
}