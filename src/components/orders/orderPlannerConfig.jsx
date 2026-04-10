export const ORDER_STATUSES = ["Pending", "Processing", "Dispatched", "Complete"];

export const statusToLegacyStatus = {
  Pending: "Pending",
  Processing: "Confirmed",
  Dispatched: "Fulfilled",
  Complete: "Fulfilled",
};

export const getPlannerStatus = (order) => {
  if (order.status === "Pending") return "Pending";
  if (order.status === "Confirmed") return "Processing";
  if (order.status === "Fulfilled") return "Dispatched";
  if (order.status === "Complete") return "Complete";
  return "Pending";
};

export const getPriorityTone = (priority) => {
  if (priority === "High") return { border: "rgba(194,24,91,0.5)", bg: "rgba(194,24,91,0.08)", color: "#C2185B" };
  if (priority === "Medium") return { border: "rgba(201,168,76,0.45)", bg: "rgba(201,168,76,0.08)", color: "#C9A84C" };
  return { border: "rgba(245,240,232,0.18)", bg: "rgba(255,255,255,0.04)", color: "rgba(245,240,232,0.7)" };
};