const cardStyle = {
  background: "#1a1a1a",
  border: "1px solid rgba(201,168,76,0.25)",
  padding: "18px",
};

export default function MemberOrderStatusCards({ counts }) {
  const items = [
    { key: "active", label: "Active", value: counts.active, color: "#C9A84C" },
    { key: "fulfilled", label: "Fulfilled", value: counts.fulfilled, color: "rgba(245,240,232,0.8)" },
    { key: "cancelled", label: "Cancelled", value: counts.cancelled, color: "#C2185B" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "30px" }}>
      {items.map((item) => (
        <div key={item.key} style={cardStyle}>
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(201,168,76,0.6)" }}>{item.label}</p>
          <p style={{ margin: "10px 0 0", fontFamily: "var(--font-heading)", fontSize: "34px", color: item.color }}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}