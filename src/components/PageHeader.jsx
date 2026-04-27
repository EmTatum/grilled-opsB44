export default function PageHeader({ title, subtitle, children }) {
  return (
    <div style={{ paddingBottom: "20px", borderBottom: "1px solid rgba(210,156,108,0.25)", marginBottom: "24px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "14px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {subtitle && (
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "12px", fontWeight: 300,
              color: "var(--color-text-muted)",
              letterSpacing: "0.035em",
              margin: 0,
            }}>
              {subtitle}
            </p>
          )}
          <h1 style={{
            fontFamily: "var(--font-heading)",
            fontSize: "30px", fontWeight: 600,
            color: "var(--color-gold)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            margin: 0, lineHeight: 1.05,
          }}>
            {title}
          </h1>
          <div style={{ height: "2px", width: "60px", background: "var(--color-gold)" }} />
        </div>
        {children && <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>{children}</div>}
      </div>
    </div>
  );
}