const badgeStyles = {
  Pending: { background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.5)", color: "#C9A84C" },
  Confirmed: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(245,240,232,0.7)" },
  Fulfilled: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(245,240,232,0.7)" },
  Cancelled: { background: "rgba(194,24,91,0.08)", border: "1px solid rgba(194,24,91,0.4)", color: "#C2185B" },
  Low: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(245,240,232,0.5)" },
  Medium: { background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.5)", color: "#C9A84C" },
  High: { background: "rgba(194,24,91,0.08)", border: "1px solid rgba(194,24,91,0.4)", color: "#C2185B" },
};

export default function StatusBadge({ status }) {
  const s = badgeStyles[status] || { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(245,240,232,0.5)" };
  return (
    <span style={{
      ...s,
      fontFamily: "var(--font-body)",
      fontSize: "10px",
      fontWeight: 500,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      padding: "4px 10px",
      borderRadius: "2px",
      display: "inline-flex",
      alignItems: "center",
    }}>
      {status}
    </span>
  );
}