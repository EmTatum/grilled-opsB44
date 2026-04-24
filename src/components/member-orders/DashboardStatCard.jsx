export default function DashboardStatCard({ label, value, accent = "#C9A84C" }) {
  return (
    <div style={{ background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.3)", padding: "20px", transition: "all 0.25s ease" }}>
      <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(201,168,76,0.6)" }}>{label}</p>
      <p style={{ margin: "10px 0 0", fontFamily: "var(--font-heading)", fontSize: "32px", fontWeight: 600, color: accent }}>{value}</p>
    </div>
  );
}