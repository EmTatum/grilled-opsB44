export const normalizeClientName = (value) => String(value || "").trim().toLowerCase();

export const cleanClientName = (value) => {
  if (!value) return "Unknown Client";
  return String(value)
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s*[-|\/].*$/, "")
    .trim() || "Unknown Client";
};

export const isValidClientName = (value) => {
  const cleaned = cleanClientName(value);
  if (!cleaned) return false;
  const normalized = cleaned.toLowerCase();
  return normalized !== "unknown" && normalized !== "unknown client" && normalized !== "unnamed client";
};

export const isVisibleOrderRecord = (record) => {
  if (!record) return false;
  if (record.fulfilment_status === "Cancelled") return false;
  return isValidClientName(record.client_name);
};

export const consolidateOrderList = (value) => {
  const items = String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => !/(delivery fee|delivery|fee|charge|charges|tip|tips)/i.test(item));

  const counts = new Map();
  const labels = new Map();

  items.forEach((item) => {
    const key = item.toLowerCase();
    counts.set(key, (counts.get(key) || 0) + 1);
    if (!labels.has(key)) labels.set(key, item);
  });

  return Array.from(counts.entries()).map(([key, count]) => (
    count > 1 ? `${count}x ${labels.get(key)}` : labels.get(key)
  )).join(", ");
};

export const formatCurrency = (value) => `R${Number(value || 0).toLocaleString("en-ZA")}`;

export const formatDeliveryDate = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "Date TBC";

  const [datePart, timePart] = raw.includes("T") ? raw.split("T") : [raw, ""];
  const date = new Date(`${datePart}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Date TBC";

  const formatted = date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return timePart ? `${formatted} at ${timePart.slice(0, 5)}` : `${formatted} — Time TBC`;
};

export const normalizeDeliveryDate = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.includes("T")) return raw;
  const dateMatch = raw.match(/\d{4}-\d{2}-\d{2}/);
  return dateMatch ? dateMatch[0] : raw;
};