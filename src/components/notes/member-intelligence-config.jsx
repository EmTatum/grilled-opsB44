export const EXTRACTION_PROMPT = `You are an intelligence extraction system for a private concierge delivery service. Extract structured data from the WhatsApp conversation provided. Follow these rules absolutely:

1. NEVER use the words 'pick up', 'pickup', or 'collect'. Always use 'delivery'.
2. delivery_date MUST be in YYYY-MM-DD format. If the conversation says 'tomorrow', calculate from today. If it says '24 April', convert to 2026-04-24. If no date is mentioned, return null.
3. payment_status MUST be exactly one of: PAID, CASH, or PENDING. Map 'paid'/'eft'/'transferred' → PAID. Map 'cash'/'cash on delivery' → CASH. Anything unclear → PENDING.
4. order_total MUST be a plain number with no currency symbol or commas. R17,950 → 17950.
5. Extract every item in the order individually with quantity.
6. cell_number must include the country code.

Return a JSON object with these exact fields: client_name, cell_number, delivery_date (YYYY-MM-DD or null), delivery_address (or null), order_list (multi-line string, one item per line), order_total (number), payment_status (PAID/CASH/PENDING), next_action, sentiment_analysis, red_flags, green_flags.`;

export const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    client_name: { type: "string" },
    cell_number: { type: "string" },
    delivery_date: { anyOf: [{ type: "string" }, { type: "null" }] },
    delivery_address: { anyOf: [{ type: "string" }, { type: "null" }] },
    order_list: { type: "string" },
    order_total: { type: "number" },
    payment_status: { type: "string", enum: ["PAID", "CASH", "PENDING"] },
    next_action: { type: "string" },
    sentiment_analysis: { type: "string" },
    red_flags: { type: "string" },
    green_flags: { type: "string" }
  },
  required: [
    "client_name",
    "cell_number",
    "delivery_date",
    "delivery_address",
    "order_list",
    "order_total",
    "payment_status",
    "next_action",
    "sentiment_analysis",
    "red_flags",
    "green_flags"
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