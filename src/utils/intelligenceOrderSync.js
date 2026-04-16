import { base44 } from "@/api/base44Client";
import { normalizePaymentStatus } from "./customerNotes";

const parseOrderValue = (value) => Number(String(value || "").replace(/[^\d.]/g, "")) || 0;

export const buildOrderFromReport = (reportData, sourceReportId) => {
  const paymentStatus = normalizePaymentStatus(reportData.payment_status, reportData.payment_method);
  const hasDeliveryDate = Boolean(reportData.delivery_date && reportData.delivery_date !== "Not recorded.");

  return {
    client_name: reportData.client_name || "Not recorded.",
    order_details: reportData.order_list || "Not recorded.",
    delivery_address: reportData.delivery_address || "Not recorded.",
    payment_method: reportData.payment_method || "Other",
    payment_status: paymentStatus,
    order_value: parseOrderValue(reportData.order_total),
    order_date: hasDeliveryDate ? new Date(reportData.delivery_date).toISOString() : new Date().toISOString(),
    status: paymentStatus === "PAID" || paymentStatus === "CASH" ? "Confirmed" : "Pending",
    planner_status: paymentStatus === "PAID" || paymentStatus === "CASH" ? "Processing" : "Pending",
    source_report_id: sourceReportId,
    time_slot: reportData.delivery_date || "",
    special_instructions: reportData.next_action || "",
    priority_level: "Medium",
  };
};

export const syncOrderFromReport = async (reportData, sourceReportId) => {
  const payload = buildOrderFromReport(reportData, sourceReportId);
  const existingOrders = await base44.entities.Order.filter({ source_report_id: sourceReportId }, "-created_date", 1);

  if (existingOrders.length > 0) {
    return base44.entities.Order.update(existingOrders[0].id, payload);
  }

  return base44.entities.Order.create(payload);
};

export const syncReportFromOrder = async (order) => {
  if (!order.source_report_id) return null;

  const report = await base44.entities.CustomerNote.get(order.source_report_id);
  const currentTags = report.tags || [];
  const currentReportTag = currentTags.find((tag) => String(tag).startsWith("report-data:"));
  const currentData = currentReportTag ? JSON.parse(currentReportTag.replace("report-data:", "")) : {};

  const nextData = {
    ...currentData,
    client_name: order.client_name || "Not recorded.",
    cell_number: currentData.cell_number || "Not recorded.",
    payment_method: order.payment_method || "Not recorded.",
    payment_status: order.payment_status || normalizePaymentStatus(order.payment_status, order.payment_method),
    delivery_date: order.time_slot || currentData.delivery_date || "Not recorded.",
    delivery_address: order.delivery_address || "Not recorded.",
    order_list: order.order_details || "Not recorded.",
    order_total: order.order_value ? `R${Number(order.order_value).toLocaleString()}` : "Not confirmed.",
    sentiment_analysis: currentData.sentiment_analysis || "Not recorded.",
    red_flags: currentData.red_flags || "None recorded.",
    green_flags: currentData.green_flags || "None recorded.",
    next_action: order.special_instructions || currentData.next_action || "Not recorded.",
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

  return base44.entities.CustomerNote.update(order.source_report_id, {
    client_name: nextData.client_name,
    content,
    tags: nextTags,
    total_spend: parseOrderValue(nextData.order_total),
  });
};