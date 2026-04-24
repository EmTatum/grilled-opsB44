import { base44 } from "@/api/base44Client";
import { normalizePaymentStatus } from "./customerNotes";

const parseOrderValue = (value) => Number(String(value || "").replace(/[^\d.]/g, "")) || 0;

export const buildOrderFromReport = (reportData, sourceReportId) => ({
  client_name: reportData.client_name || "Not recorded.",
  cell_number: reportData.cell_number || "",
  delivery_date: reportData.delivery_date && reportData.delivery_date !== "Not recorded." ? reportData.delivery_date : "",
  delivery_address: reportData.delivery_address || "",
  order_list: reportData.order_list || "",
  order_total: parseOrderValue(reportData.order_total),
  payment_status: normalizePaymentStatus(reportData.payment_status, reportData.payment_method),
  next_action: reportData.next_action || "",
  fulfilment_status: reportData.fulfilment_status || "Active",
  intelligence_report_id: sourceReportId,
});

export const syncOrderFromReport = async (reportData, sourceReportId) => {
  const payload = buildOrderFromReport(reportData, sourceReportId);
  const existingOrders = await base44.entities.MemberOrder.filter({ intelligence_report_id: sourceReportId }, "-created_date", 1);

  if (existingOrders.length > 0) {
    return base44.entities.MemberOrder.update(existingOrders[0].id, payload);
  }

  return base44.entities.MemberOrder.create(payload);
};

export const syncReportFromOrder = async (order) => {
  if (!order.intelligence_report_id) return null;

  const report = await base44.entities.CustomerNote.get(order.intelligence_report_id);
  const currentTags = report.tags || [];
  const currentReportTag = currentTags.find((tag) => String(tag).startsWith("report-data:"));
  const currentData = currentReportTag ? JSON.parse(currentReportTag.replace("report-data:", "")) : {};

  const nextData = {
    ...currentData,
    client_name: order.client_name || "Not recorded.",
    cell_number: order.cell_number || currentData.cell_number || "Not recorded.",
    payment_method: currentData.payment_method || "Not recorded.",
    payment_status: order.payment_status || normalizePaymentStatus(order.payment_status, currentData.payment_method),
    delivery_date: order.delivery_date || currentData.delivery_date || "Not recorded.",
    delivery_address: order.delivery_address || "Not recorded.",
    order_list: order.order_list || "Not recorded.",
    order_total: order.order_total ? `R${Number(order.order_total).toLocaleString()}` : "Not confirmed.",
    sentiment_analysis: currentData.sentiment_analysis || "Not recorded.",
    red_flags: currentData.red_flags || "None recorded.",
    green_flags: currentData.green_flags || "None recorded.",
    next_action: order.next_action || currentData.next_action || "Not recorded.",
  };

  const nextTags = [
    ...currentTags.filter((tag) => !String(tag).startsWith("report-data:") && !String(tag).startsWith("payment-status:")),
    `payment-status:${nextData.payment_status}`,
    `report-data:${JSON.stringify(nextData)}`,
  ];

  const content = [
    "CLIENT INFORMATION",
    `Client Name: ${nextData.client_name}`,
    `Cell Number: ${nextData.cell_number}`,
    `Payment Method: ${nextData.payment_method}`,
    `Payment Status: ${nextData.payment_status}`,
    "",
    "DELIVERY INFORMATION",
    `Delivery Date: ${nextData.delivery_date}`,
    `Delivery Address: ${nextData.delivery_address}`,
    "",
    "ORDER DETAILS",
    `${nextData.order_list}`,
    `Order Total: ${nextData.order_total}`,
    "",
    "CLIENT SENTIMENT",
    `Sentiment Analysis: ${nextData.sentiment_analysis}`,
    "",
    "FLAGS",
    `Red Flags: ${nextData.red_flags}`,
    `Green Flags: ${nextData.green_flags}`,
    "",
    "NEXT STEPS",
    `Next Action: ${nextData.next_action}`,
  ].join("\n");

  return base44.entities.CustomerNote.update(order.intelligence_report_id, {
    client_name: nextData.client_name,
    content,
    tags: nextTags,
    delivery_date: order.delivery_date || "",
    cell_number: order.cell_number || "",
    payment_status: nextData.payment_status,
    order_total: parseOrderValue(nextData.order_total),
    delivery_address: order.delivery_address || "",
    order_list: order.order_list || "",
    next_action: order.next_action || "",
    fulfilment_status: order.fulfilment_status || "Active",
    total_spend: parseOrderValue(nextData.order_total),
  });
};