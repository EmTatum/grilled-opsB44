import moment from "moment";

export function formatCurrency(value) {
  return `R${Number(value || 0).toLocaleString("en-ZA")}`;
}

export function getDatePart(value) {
  return String(value || "").trim().split("T")[0] || "";
}

export function getTimePart(value) {
  const raw = String(value || "").trim();
  if (!raw.includes("T")) return "Time TBC";
  const [, timePart = ""] = raw.split("T");
  return timePart ? timePart.slice(0, 5) : "Time TBC";
}

export function formatDeliveryDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return "Date TBC";

  const [datePart, timePart] = raw.includes("T") ? raw.split("T") : [raw, ""];
  const date = moment(datePart, "YYYY-MM-DD", true);
  if (!date.isValid()) return "Date TBC";

  if (timePart) return `${date.format("D MMMM YYYY")} at ${timePart.slice(0, 5)}`;
  return `${date.format("D MMMM YYYY")} — Time TBC`;
}

export function getTodayKey() {
  return moment().format("YYYY-MM-DD");
}
