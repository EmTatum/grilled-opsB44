export const sortByDeliveryDate = (orders) => [...orders].sort((a, b) => {
  if (!a.delivery_date && !b.delivery_date) return 0;
  if (!a.delivery_date) return 1;
  if (!b.delivery_date) return -1;
  return String(a.delivery_date).localeCompare(String(b.delivery_date));
});

export const formatRand = (value) => {
  const amount = Number(value || 0);
  return amount > 0 ? `R${amount.toLocaleString("en-ZA")}` : "TBC";
};

export const buildCustomerNoteContent = (report) => [
  "SECTION A — CLIENT DETAILS",
  `Name: ${report.client_name || "Not recorded."}`,
  `Cell Number: ${report.cell_number || "Not recorded."}`,
  `Delivery Address: ${report.delivery_address || "Not recorded."}`,
  `Delivery Date: ${report.delivery_date || "Not recorded."}`,
  `Delivery Time: ${report.delivery_time || "Not recorded."}`,
  "",
  "SECTION B — LATEST ORDER STATUS",
  `Latest Order Status: ${report.latest_order_status || "Not recorded."}`,
  `Next Action: ${report.next_action || "Not recorded."}`,
  "Order List:",
  `${report.order_list || "Not recorded."}`,
  `Order Total: ${Number(report.order_total || 0) > 0 ? `R${Number(report.order_total).toLocaleString("en-ZA")}` : "TBC"}`,
  "",
  "SECTION C — CLIENT PROFILE",
  `Order Frequency: ${report.order_frequency || "Not recorded."}`,
  `Sentiment Analysis: ${report.sentiment_analysis || "Not recorded."}`,
  `Green Flags: ${report.green_flags || "None recorded."}`,
  `Red Flags: ${report.red_flags || "None recorded."}`,
  `Client Notes: ${report.client_notes || "Not recorded."}`,
].join("\n");