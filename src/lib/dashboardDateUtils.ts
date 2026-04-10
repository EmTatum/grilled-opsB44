import moment from "moment";

export function toDayKey(dateLike) {
  const d = new Date(dateLike);
  const yyyy = d.getFullYear();
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function getTodayKey() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return toDayKey(now);
}

export function getRollingDays(baseDate = new Date()) {
  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);

  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function getOrdersByDay(orders, dayKey) {
  return orders.filter((order) => toDayKey(order.scheduledFor || order.order_date) === dayKey);
}

export function getNotesByClientId(notes, clientId) {
  if (!clientId) return [];
  return notes.filter((note) => note.clientId === clientId);
}

export function getClientById(clients, clientId) {
  if (!clientId) return null;
  return clients.find((c) => c.id === clientId) ?? null;
}

export function formatTime(dateLike) {
  return new Date(dateLike).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateLabel(dayKey) {
  const d = new Date(dayKey);
  return d.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatWeekday(date) {
  return date.toLocaleDateString([], { weekday: "short" }).toUpperCase();
}

export function formatMonth(date) {
  return date.toLocaleDateString([], { month: "short" }).toUpperCase();
}

export function getStatusLabel(status) {
  switch (status) {
    case "pending":
      return "Pending";
    case "processing":
      return "Processing";
    case "scheduled":
      return "Scheduled";
    case "completed":
      return "Completed";
    case "overdue":
      return "Overdue";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

export function getStatusTone(status) {
  if (status === "overdue" || status === "cancelled") return "alert";
  if (status === "pending") return "warning";
  if (status === "processing" || status === "scheduled") return "info";
  return "success";
}

export const isSameDay = (a, b) => moment(a).isSame(moment(b), "day");