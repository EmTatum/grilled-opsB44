export default function StatCard({ icon: Icon, label, value }) {
  return (
    <div
      style={{
        background: "#1a1a1a",
        border: "1px solid rgba(201,168,76,0.3)",
        borderRadius: "2px",
        padding: "24px",
        transition: "all 0.25s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(201,168,76,0.6)";
        e.currentTarget.style.boxShadow = "0 0 20px rgba(201,168,76,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ marginBottom: "16px" }}>
        <Icon size={18} strokeWidth={1.2} style={{ color: "rgba(201,168,76,0.6)" }} />
      </div>
      <p style={{
        fontFamily: "var(--font-body)",
        fontSize: "11px",
        fontWeight: 500,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "rgba(201,168,76,0.6)",
        marginBottom: "8px",
      }}>
        {label}
      </p>
      <p style={{
        fontFamily: "var(--font-heading)",
        fontSize: "32px",
        fontWeight: 600,
        color: "#C9A84C",
        lineHeight: 1,
      }}>
        {value}
      </p>
    </div>
  );
}