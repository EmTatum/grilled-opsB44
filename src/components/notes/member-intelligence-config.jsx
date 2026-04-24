export const EXTRACTION_PROMPT = `You are extracting structured operational intelligence from a WhatsApp conversation for a private concierge delivery service. Your output is used by two different views — a full intelligence report and a summary dispatch block. You must extract everything possible.

HARD RULES:
- NEVER write 'pick up', 'pickup', or 'collect'. Always write 'delivery'.
- delivery_date must be in YYYY-MM-DD format. Convert '24 April' → '2026-04-24'. Convert 'tomorrow' using today's date. If unknown, return null.
- delivery_time must be in HH:MM 24-hour format. Extract from context (e.g. '14:30', '2pm' → '14:00'). If unknown, return null.
- payment_status must be exactly: PAID (if already paid/EFT done), CASH (if paying cash on delivery), or PENDING (if not yet confirmed).
- order_total must be a plain integer. Strip R and commas. R17,950 → 17950. If unknown, return 0.
- cell_number must include country code. If not in the conversation, return null.
- delivery_address: full address as stated. If not confirmed, return null.

Return a JSON object with these fields:
{
  client_name: string,
  cell_number: string or null,
  delivery_date: YYYY-MM-DD string or null,
  delivery_time: HH:MM string or null,
  delivery_address: string or null,
  order_list: string (one item per line, include quantities),
  order_total: integer,
  payment_status: PAID | CASH | PENDING,
  next_action: string (most urgent single action needed),
  latest_order_status: string (is the order confirmed, pending items, awaiting payment — based on last messages in the conversation),
  order_frequency: string (any indication of how often client orders — weekly, monthly, first time, etc. Infer from conversation tone and history references),
  sentiment_analysis: string,
  red_flags: string (anything concerning — late payment, aggression, unusual requests),
  green_flags: string (positive signals — prompt payment, referred client, repeat customer),
  client_notes: string (any other useful context about this client)
}`;

export const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    client_name: { type: "string" },
    cell_number: { anyOf: [{ type: "string" }, { type: "null" }] },
    delivery_date: { anyOf: [{ type: "string" }, { type: "null" }] },
    delivery_time: { anyOf: [{ type: "string" }, { type: "null" }] },
    delivery_address: { anyOf: [{ type: "string" }, { type: "null" }] },
    order_list: { type: "string" },
    order_total: { type: "number" },
    payment_status: { type: "string", enum: ["PAID", "CASH", "PENDING"] },
    next_action: { type: "string" },
    latest_order_status: { type: "string" },
    order_frequency: { type: "string" },
    sentiment_analysis: { type: "string" },
    red_flags: { type: "string" },
    green_flags: { type: "string" },
    client_notes: { type: "string" }
  },
  required: [
    "client_name",
    "cell_number",
    "delivery_date",
    "delivery_time",
    "delivery_address",
    "order_list",
    "order_total",
    "payment_status",
    "next_action",
    "latest_order_status",
    "order_frequency",
    "sentiment_analysis",
    "red_flags",
    "green_flags",
    "client_notes"
  ]
};

export const PAYMENT_STYLES = {
  PAID: {
    accent: "#16a34a",
    badgeBackground: "rgba(22,163,74,0.12)",
    badgeBorder: "rgba(22,163,74,0.45)",
    badgeColor: "#86efac"
  },
  CASH: {
    accent: "#d29c6c",
    badgeBackground: "rgba(210,156,108,0.12)",
    badgeBorder: "rgba(210,156,108,0.45)",
    badgeColor: "#d29c6c"
  },
  PENDING: {
    accent: "#d97706",
    badgeBackground: "rgba(217,119,6,0.12)",
    badgeBorder: "rgba(217,119,6,0.45)",
    badgeColor: "#fbbf24"
  }
};