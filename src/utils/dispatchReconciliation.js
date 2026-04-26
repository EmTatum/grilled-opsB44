const normalizeText = (value) => String(value || "").trim().toLowerCase();

export const splitManifestItems = (text) => {
  const seen = new Set();

  return String(text || "")
    .split(/\n|,|•|\|/)
    .map((item) => item.replace(/\s+/g, " ").trim())
    .map((item) => item.replace(/^[-–—•*]+\s*/, ""))
    .filter(Boolean)
    .filter((item) => {
      const normalized = item.toLowerCase();
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
};

export const extractQuantity = (item) => {
  const value = String(item || "").toLowerCase().trim();
  const leadingMatch = value.match(/^(\d+(?:\.\d+)?)\s*[x×-]?\s*/i);
  if (leadingMatch) return Number(leadingMatch[1]);

  const trailingMatch = value.match(/\b(?:x|×)\s*(\d+(?:\.\d+)?)\b/i);
  if (trailingMatch) return Number(trailingMatch[1]);

  const qtyWordMatch = value.match(/\b(\d+(?:\.\d+)?)\s*(pack|packs|bag|bags|unit|units|bottle|bottles|gram|grams|g)\b/i);
  if (qtyWordMatch) return Number(qtyWordMatch[1]);

  return 1;
};

export const matchProductFromItem = (item, products) => {
  const normalizedItem = normalizeText(item)
    .replace(/^(\d+(?:\.\d+)?)\s*[x×-]?\s*/i, "")
    .replace(/\b(pack|packs|bag|bags|unit|units|bottle|bottles|gram|grams|g)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return products.find((product) => {
    const productName = normalizeText(product.product_name);
    if (!productName) return false;
    return normalizedItem.includes(productName) || productName.includes(normalizedItem);
  }) || null;
};

export const buildDispatchDiscrepancies = (orders, products) => {
  return orders.flatMap((order) => {
    const items = splitManifestItems(order.order_list || order.order_details || "");

    return items.map((item) => {
      const matchedProduct = matchProductFromItem(item, products);
      if (!matchedProduct) {
        return {
          id: `${order.id}-${item}`,
          type: "unmatched",
          severity: "warning",
          client_name: order.client_name,
          item,
          message: `No stock match found for \"${item}\".`
        };
      }

      const requiredQuantity = extractQuantity(item);
      const currentStock = Number(matchedProduct.current_stock || 0);
      if (currentStock >= requiredQuantity) return null;

      return {
        id: `${order.id}-${matchedProduct.id}`,
        type: "insufficient_stock",
        severity: "critical",
        client_name: order.client_name,
        item,
        product_name: matchedProduct.product_name,
        required_quantity: requiredQuantity,
        current_stock: currentStock,
        message: `${matchedProduct.product_name} requires ${requiredQuantity}, but only ${currentStock} in stock.`
      };
    }).filter(Boolean);
  });
};