export const FULL_REPORT_PROMPT = `You are a senior intelligence analyst for a private members cannabis concierge club. Read this entire WhatsApp conversation and write a detailed operational intelligence report. Write in clear, direct prose — not bullet points, not JSON. Be specific and observational, not vague.

Write 2–5 sentences per section, more if enough information exists:

**ORDER STATUS:** What is the current confirmed order? Products, quantities, total, delivery address and time, payment arrangement?

**ORDER HISTORY & FREQUENCY:** How often does this client order? What patterns emerge?

**PREFERRED PRODUCTS:** Which products does this client consistently favour?

**PREFERRED DELIVERY WINDOWS:** What time of day or days of the week do they typically request?

**CLIENT SENTIMENT:** Overall tone — loyal, price-sensitive, impatient, easy-going? Give specific examples.

**GREEN FLAGS:** Loyalty, referrals, prompt payment, high order value, pleasant communication?

**RED FLAGS:** Payment delays, complaints, aggressive tone, inconsistent requests, ghosting? Write 'None noted.' if clean.

**SPECIAL INSTRUCTIONS:** Gate codes, access notes, preferred contact methods, drop-off preferences, personal details?

**OUTSTANDING BALANCE:** Any unpaid amounts from previous orders? Write 'None mentioned.' if not.

**ANALYST NOTES:** Anything else operationally useful — relationship context, upcoming needs, upsell opportunities, referrals pending.

Be thorough. The more detail extracted, the more operationally useful this report is.`;

export const EXTRACTION_PROMPT = `CRITICAL ORDER EXTRACTION RULE:
WhatsApp exports are chronological — oldest messages at the top, newest at the bottom. This chat may contain multiple orders across different dates.

You MUST extract the MOST RECENT ORDER ONLY — the last order discussed or confirmed, closest to the bottom of the conversation. Ignore all earlier orders entirely.

To identify the most recent order: scan from the BOTTOM upward. Find the last mention of products being ordered, quantities confirmed, a price agreed, or a delivery arrangement made. That is the only order to extract. If recent messages are small talk after an order was confirmed, work backward to find that last confirmed order.

Do NOT combine old and new orders. Do NOT use the first order you see. Most recent confirmed order only.

Extract and return ONLY valid JSON, no explanation:
{
  client_name: string (strip anything in parentheses, after a dash or pipe — clean name only, e.g. 'Jon' not 'Jon (hate Kate Bro)'),
  cell_number: string or null,
  delivery_date: 'YYYY-MM-DDTHH:MM' if time known | 'YYYY-MM-DD' if date only | null if unknown,
  delivery_address: string or null,
  order_list: string (comma-separated stock items only — NO delivery fees, NO charges, NO tips. Consolidate duplicates: if same item appears N times write 'Nx Item' e.g. '3x Medalonian 1g'),
  order_total: integer in rands, no R symbol, no commas. 0 if unknown,
  payment_status: 'PAID' | 'CASH' | 'PENDING',
  next_action: one sentence — what needs to happen next
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
    next_action: { type: "string" }
  },
  required: [
    "client_name",
    "cell_number",
    "delivery_date",
    "delivery_address",
    "order_list",
    "order_total",
    "payment_status",
    "next_action"
  ]
};

export const PAYMENT_STYLES = {
  PAID: {
    badgeBackground: "rgba(22,163,74,0.12)",
    badgeBorder: "rgba(22,163,74,0.45)",
    badgeColor: "#86efac"
  },
  CASH: {
    badgeBackground: "rgba(217,119,6,0.12)",
    badgeBorder: "rgba(217,119,6,0.45)",
    badgeColor: "#fbbf24"
  },
  PENDING: {
    badgeBackground: "rgba(255,255,255,0.05)",
    badgeBorder: "rgba(255,255,255,0.18)",
    badgeColor: "rgba(245,240,232,0.7)"
  }
};