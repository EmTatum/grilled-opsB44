export default function PageHeader({ title, subtitle, children }) {
  return (
    <div style={{ paddingBottom: "24px", borderBottom: "1px solid var(--color-border-gold)", marginBottom: "28px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "14px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {subtitle &&
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            fontWeight: 300,
            color: "var(--color-text-muted)",
            letterSpacing: "0.04em",
            margin: 0,
            lineHeight: 1.6
          }}>
              {subtitle}
            </p>
          }
          <h1 style={{
            fontFamily: "var(--font-heading)",
            fontSize: "34px",
            fontWeight: 700,
            color: "var(--color-gold)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            margin: 0, lineHeight: 1.05
          }} className="bg-[hsl(var(--background))] text-[hsl(var(--primary))]">
            {title}
          </h1>
          <div style={{ height: "2px", width: "60px", background: "var(--color-gold)" }} />
        </div>
        {children && <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>{children}</div>}
      </div>
    </div>);

}