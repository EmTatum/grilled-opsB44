export default function DuplicateNotesBanner({ duplicateCount, onMerge, merging }) {
  if (!duplicateCount) return null;

  return (
    <div style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.25)", padding: "16px 18px", marginBottom: "20px", display: "flex", justifyContent: "space-between", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
      <div>
        <p style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", color: "#C9A84C", letterSpacing: "0.08em", textTransform: "uppercase" }}>Duplicate Notes Found</p>
        <p style={{ margin: "6px 0 0", fontFamily: "'Raleway', sans-serif", fontSize: "12px", color: "rgba(245,240,232,0.5)" }}>{duplicateCount} duplicate note{duplicateCount === 1 ? "" : "s"} hidden from the list. You can remove the extras in one click.</p>
      </div>
      <button onClick={onMerge} disabled={merging} style={{ background: "transparent", border: "1px solid #C9A84C", color: "#C9A84C", fontFamily: "'Raleway', sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", padding: "10px 16px", borderRadius: "2px", cursor: merging ? "default" : "pointer", opacity: merging ? 0.6 : 1 }}>
        {merging ? "Merging..." : "Merge Duplicates"}
      </button>
    </div>
  );
}