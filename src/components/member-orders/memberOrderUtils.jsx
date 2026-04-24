import moment from "moment";

export const getDatePart = (value) => String(value || "").trim().split("T")[0] || "";

export const formatDeliveryDateLabel = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "Date TBC";

  const [datePart, timePart] = raw.includes("T") ? raw.split("T") : [raw, null];
  const date = moment(datePart, "YYYY-MM-DD", true);
  if (!date.isValid()) return "Date TBC";

  if (timePart) return `${date.format("D MMMM YYYY")} at ${String(timePart).slice(0, 5)}`;
  return `${date.format("D MMMM YYYY")} — Time TBC`;
};

export const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return amount > 0 ? `R${amount.toLocaleString("en-ZA")}` : "TBC";
};

export const sortByDeliveryDateAscNullsLast = (records) => {
  return [...(records || [])].sort((a, b) => {
    const aDate = String(a.delivery_date || "").trim();
    const bDate = String(b.delivery_date || "").trim();
    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;
    return aDate.localeCompare(bDate);
  });
};

export const getTodayKey = () => moment().format("YYYY-MM-DD");