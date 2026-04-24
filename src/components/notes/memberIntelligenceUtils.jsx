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
  "CLIENT INFORMATION",
  `Client Name: ${report.client_name || "Not recorded."}`,
  `Cell Number: ${report.cell_number || "Not recorded."}`,
  `Payment Status: ${report.payment_status || "PENDING"}`,
  "",
  "DELIVERY INFORMATION",
  `Delivery Date: ${report.delivery_date || "Not recorded."}`,
  `Delivery Address: ${report.delivery_address || "Not recorded."}`,
  "",
  "ORDER DETAILS",
  `${report.order_list || "Not recorded."}`,
  `Order Total: ${Number(report.order_total || 0) > 0 ? `R${Number(report.order_total).toLocaleString("en-ZA")}` : "TBC"}`,
  "",
  "CLIENT SENTIMENT",
  `Sentiment Analysis: ${report.sentiment_analysis || "Not recorded."}`,
  "",
  "FLAGS",
  `Red Flags: ${report.red_flags || "None recorded."}`,
  `Green Flags: ${report.green_flags || "None recorded."}`,
  "",
  "NEXT STEPS",
  `Next Action: ${report.next_action || "Not recorded."}`,
].join("\n");