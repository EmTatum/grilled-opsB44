const statusStyles = {
  Pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Fulfilled: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  Low: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  High: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function StatusBadge({ status }) {
  const style = statusStyles[status] || "bg-muted text-muted-foreground border-border";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {status}
    </span>
  );
}