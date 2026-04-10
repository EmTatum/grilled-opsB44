export function PlannerSectionTitle({ title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
      <div style={{ height: "1px", flex: 1, background: "rgba(201,168,76,0.15)" }} />
      <span style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.3em", color: "rgba(201,168,76,0.45)", textTransform: "uppercase" }}>{title}</span>
      <div style={{ height: "1px", flex: 1, background: "rgba(201,168,76,0.15)" }} />
    </div>
  );
}