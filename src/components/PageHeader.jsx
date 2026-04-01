export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          {/* Decorative line */}
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8" style={{ background: "hsl(40 57% 54% / 0.6)" }} />
            <div className="h-px w-2" style={{ background: "hsl(40 57% 54% / 0.3)" }} />
          </div>
          <h1
            className="font-heading font-semibold"
            style={{ fontSize: "36px", color: "hsl(36 40% 94%)", lineHeight: 1.15, letterSpacing: "0.02em" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="mt-2 uppercase tracking-luxury"
              style={{ fontSize: "10px", color: "hsl(36 10% 45%)", letterSpacing: "0.22em", fontFamily: "Inter, sans-serif" }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {children && <div className="flex items-center gap-3">{children}</div>}
      </div>
      {/* Full-width divider */}
      <div className="mt-6 h-px" style={{ background: "linear-gradient(90deg, hsl(40 57% 54% / 0.25), transparent)" }} />
    </div>
  );
}