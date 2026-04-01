export default function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5 flex items-start gap-4 hover:border-primary/30 transition-colors duration-300">
      <div className={`p-3 rounded-lg ${accent ? "bg-primary/10" : "bg-secondary"}`}>
        <Icon size={20} className={accent ? "text-primary" : "text-muted-foreground"} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground tracking-wider uppercase font-medium">{label}</p>
        <p className="text-2xl font-heading font-bold text-foreground mt-1">{value}</p>
      </div>
    </div>
  );
}