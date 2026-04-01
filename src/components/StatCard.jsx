export default function StatCard({ icon: Icon, label, value, accent, rose }) {
  return (
    <div
      className="relative rounded-sm overflow-hidden transition-all duration-300 hover:scale-[1.01]"
      style={{
        background: "linear-gradient(160deg, #1c1c1c, #161616)",
        border: "1px solid hsl(40 20% 18%)",
      }}
    >
      {/* Top accent stripe */}
      <div
        className="h-px w-full"
        style={{
          background: accent
            ? "linear-gradient(90deg, hsl(40 57% 54% / 0.8), transparent)"
            : rose
            ? "linear-gradient(90deg, hsl(333 72% 43% / 0.6), transparent)"
            : "hsl(40 20% 16%)",
        }}
      />
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className="p-2.5 rounded-sm"
            style={{
              background: accent
                ? "hsl(40 57% 54% / 0.1)"
                : rose
                ? "hsl(333 72% 43% / 0.1)"
                : "hsl(0 0% 16%)",
              border: accent
                ? "1px solid hsl(40 57% 54% / 0.2)"
                : rose
                ? "1px solid hsl(333 72% 43% / 0.2)"
                : "1px solid hsl(0 0% 20%)",
            }}
          >
            <Icon
              size={18}
              strokeWidth={1.2}
              style={{
                color: accent
                  ? "hsl(40 57% 54%)"
                  : rose
                  ? "hsl(333 72% 43%)"
                  : "hsl(36 10% 50%)",
              }}
            />
          </div>
        </div>
        <p
          className="uppercase tracking-luxury mb-1"
          style={{ fontSize: "9px", color: "hsl(36 10% 45%)", letterSpacing: "0.2em", fontFamily: "Inter, sans-serif" }}
        >
          {label}
        </p>
        <p
          className="font-heading font-semibold"
          style={{
            fontSize: "32px",
            color: accent ? "hsl(40 57% 54%)" : rose ? "hsl(333 72% 43%)" : "hsl(36 40% 90%)",
            lineHeight: 1.1,
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}