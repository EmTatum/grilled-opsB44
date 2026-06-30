export function parseLineItems(orderList) {
  const raw = String(orderList || "").trim();
  if (!raw) return [];

  let items = raw.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  if (items.length <= 1) {
    items = raw.split(",").map((item) => item.trim()).filter(Boolean);
  }

  return items.filter((item) => !/(delivery|fee|charge|tip)/i.test(item));
}

export function findMatchedProduct(item, products) {
  const normalizedItem = String(item || "").toLowerCase().trim();

  return (products || []).find((product) => {
    const name = String(product.product_name || "").toLowerCase().trim();
    return name && (normalizedItem.includes(name) || name.includes(normalizedItem));
  }) || null;
}

export function extractQuantity(item) {
  const raw = String(item || "").trim();
  if (!raw) return { productName: "", quantity: 1 };

  let quantity = 1;
  let productName = raw;

  const patterns = [
    /^\s*(\d+)\s*x\s+/i,
    /^\s*x\s*(\d+)\s+/i,
    /^\s*(\d+)\s+/i,
    /\((\d+)\)/,
    /\bx\s*(\d+)\b/i,
    /\b(\d+)x\b/i,
  ];

  patterns.some((pattern) => {
    const match = raw.match(pattern);
    if (!match) return false;
    quantity = Number(match[1]) || 1;
    productName = raw.replace(match[0], " ").replace(/\s+/g, " ").trim();
    return true;
  });

  return { productName, quantity: Math.max(1, quantity) };
}
