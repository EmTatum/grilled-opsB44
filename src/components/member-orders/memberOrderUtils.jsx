import { getDatePart as _getDatePart, formatDeliveryDate, getTodayKey as _getTodayKey } from "../../utils/formatting";

export const getDatePart = _getDatePart;

export const formatDeliveryDateLabel = formatDeliveryDate;

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

export const getTodayKey = _getTodayKey;