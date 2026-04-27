export const FULL_REPORT_PROMPT = `You are a senior intelligence analyst for a private members cannabis concierge club. Read this entire WhatsApp conversation and write a detailed operational intelligence report. Write in clear, direct prose — not bullet points, not JSON. Be specific and observational, not vague.

Your report must cover each of the following sections in order. Write 2–5 sentences per section, more if there is enough information in the chat:

ORDER STATUS: What is the current confirmed order? What products, quantities, total amount, delivery address and time? What is the payment arrangement?

ORDER HISTORY & FREQUENCY: How often does this client order? What patterns emerge from the conversation — weekly, monthly, irregular? Any mention of previous orders?

PREFERRED PRODUCTS: Which products does this client gravitate toward consistently? Any specific strains, formats or brands they ask about or always include?

PREFERRED DELIVERY WINDOWS: What time of day or days of the week do they typically request? Any patterns in when they reach out vs when they want delivery?

CLIENT SENTIMENT: What is the overall tone of this client? Are they loyal, price-sensitive, impatient, easy-going, demanding, enthusiastic? Give specific examples from the chat to support this.

GREEN FLAGS: What positive signals stand out — loyalty indicators, referrals made, prompt payment, high order value, pleasant communication?

RED FLAGS: Any concerns — payment delays, complaints, aggressive tone, inconsistent requests, ghosting history, anything unusual? Write 'None noted.' if the chat is clean.

SPECIAL INSTRUCTIONS: Any gate codes, access notes, preferred contact methods, drop-off preferences, allergies or personal details mentioned anywhere in the chat?

OUTSTANDING BALANCE: Any mention of unpaid amounts from previous orders? Write 'None mentioned.' if not.

ANALYST NOTES: Anything else operationally useful — relationship context, upcoming needs they hinted at, upsell opportunities, referrals pending, anything the team should know.

Write the full report now. Be thorough — the more detail you extract, the more useful this is operationally.`;

export const EXTRACTION_PROMPT = `Based on the WhatsApp conversation, extract the following structured data as valid JSON only. No explanation, no prose, just the JSON object.

{
  client_name: string,
  cell_number: string or null,
  delivery_date: string (YYYY-MM-DDTHH:MM if time known, YYYY-MM-DD if date only, null if unknown),
  delivery_address: string or null,
  order_list: string (comma-separated stock items only, no fees or charges),
  order_total: integer (rands, no symbol, 0 if unknown),
  payment_status: 'PAID' | 'CASH' | 'PENDING',
  next_action: string (one sentence — what needs to happen next)
}`;

export const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    client_name: { type: "string" },
    cell_number: { anyOf: [{ type: "string" }, { type: "null" }] },
    delivery_date: { anyOf: [{ type: "string" }, { type: "null" }] },
    delivery_address: { anyOf: [{ type: "string" }, { type: "null" }] },
    order_list: { type: "string" },
    order_total: { type: "number" },
    payment_status: { type: "string", enum: ["PAID", "CASH", "PENDING"] },
    next_action: { type: "string" },
    latest_order_status: { type: "string" },
    order_frequency: { type: "string" },
    preferred_products: { type: "string" },
    preferred_delivery_time: { type: "string" },
    sentiment_analysis: { type: "string" },
    red_flags: { type: "string" },
    green_flags: { type: "string" },
    special_instructions: { type: "string" },
    outstanding_balance: { type: "string" },
    client_notes: { type: "string" }
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
    "latest_order_status",
    "order_frequency",
    "preferred_products",
    "preferred_delivery_time",
    "sentiment_analysis",
    "red_flags",
    "green_flags",
    "special_instructions",
    "outstanding_balance",
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
    accent: "#8d201c",
    badgeBackground: "rgba(141,32,28,0.12)",
    badgeBorder: "rgba(141,32,28,0.45)",
    badgeColor: "#f5b4b0"
  },
  PENDING: {
    accent: "#d97706",
    badgeBackground: "rgba(217,119,6,0.12)",
    badgeBorder: "rgba(217,119,6,0.45)",
    badgeColor: "#fbbf24"
  }
};