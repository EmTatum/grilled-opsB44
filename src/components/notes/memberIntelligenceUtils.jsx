export const sortByDeliveryDate = (orders) => [...orders].sort((a, b) => {
  if (!a.delivery_date && !b.delivery_date) return 0;
  if (!a.delivery_date) return 1;
  if (!b.delivery_date) return -1;
  return String(a.delivery_date).localeCompare(String(b.delivery_date));
});

export const formatDeliveryDateTime = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "📅 Date TBC";

  const [datePart, timePart] = raw.includes("T") ? raw.split("T") : [raw, null];
  const parsed = new Date(`${datePart}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "📅 Date TBC";

  const formattedDate = parsed.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  if (timePart) return `📅 ${formattedDate} at ${String(timePart).slice(0, 5)}`;
  return `📅 ${formattedDate} — Time TBC`;
};

export const formatRand = (value) => {
  const amount = Number(value || 0);
  return amount > 0 ? `R${amount.toLocaleString("en-ZA")}` : "TBC";
};

export const buildCustomerNoteContent = (report) => {
  const richReport = String(report.latest_order_status || "").trim();
  if (richReport) return richReport;

  return [
    "SECTION A — CLIENT DETAILS",
    `Name: ${report.client_name || "Not recorded."}`,
    `Cell Number: ${report.cell_number || "Not recorded."}`,
    `Delivery Address: ${report.delivery_address || "Not recorded."}`,
    `Delivery Date: ${report.delivery_date || "Not recorded."}`,
    "",
    "SECTION B — LATEST ORDER STATUS",
    `Latest Order Status: ${report.latest_order_status || "Not recorded."}`,
    `Next Action: ${report.next_action || "Not recorded."}`,
    "Order List:",
    `${report.order_list || "Not recorded."}`,
    `Order Total: ${Number(report.order_total || 0) > 0 ? `R${Number(report.order_total).toLocaleString("en-ZA")}` : "TBC"}`,
  ].join("\n");
};