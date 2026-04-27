export const EXTRACTION_PROMPT = `You are an intelligence extraction engine for a private cannabis concierge club. Analyse the entire WhatsApp conversation and extract ALL of the following. Return ONLY valid JSON, no explanation.

EXTRACTION RULES:
- Extract the FINAL confirmed order only (not earlier drafts or mentions)
- delivery_date: format as YYYY-MM-DDTHH:MM if time is known, YYYY-MM-DD if date only, null if not discussed
- payment_status: PAID, CASH, or PENDING only
- order_total: integer (rands, no R symbol, no commas). 0 if not mentioned
- Never use 'pick up' — always 'delivery'
- order_list: list only stock items as a clean comma-separated string. Exclude delivery fees, tips, or charges
- cell_number: extract from chat metadata or any number mentioned in conversation. null if not found

FULL REPORT fields (prose, 1–3 sentences each):
- latest_order_status: current status of this order in plain English
- order_frequency: how often does this client order? Daily, weekly, monthly, irregular? Note any patterns
- preferred_products: which products does this client consistently order or ask about across the chat history
- preferred_delivery_time: what time of day or days of week do they typically request delivery
- sentiment_analysis: overall tone — are they happy, impatient, loyal, price-sensitive, demanding? Be specific
- red_flags: anything concerning — payment issues, repeated complaints, aggressive tone, ghost history, suspicious requests. 'None' if clean
- green_flags: positive signals — loyalty, referrals given, easy to deal with, prompt payment history, high value
- special_instructions: any recurring delivery notes, access codes, gate instructions, preferred contact method, or personal preferences mentioned
- outstanding_balance: any unpaid amounts from previous orders mentioned in the chat. 'None' if not mentioned
- client_notes: anything else operationally useful that doesn't fit above — relationship context, inside references, upcoming needs they mentioned

SUMMARY BLOCK fields (structured data only):
- client_name: full name as used in conversation
- cell_number: string or null
- delivery_date: string or null
- delivery_address: full address as stated, or null
- order_list: comma-separated stock items only, no fees
- order_total: integer or 0
- payment_status: PAID | CASH | PENDING
- next_action: one short sentence — what needs to happen next for this order to be fulfilled

Return JSON with ALL fields above. Never omit a field — use null or 'None' for unknowns.`;

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