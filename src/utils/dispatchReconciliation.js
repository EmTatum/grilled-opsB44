const normalizeText = (value) => String(value || "").trim().toLowerCase();

export const splitManifestItems = (text) =>
  String(text || "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

export const extractQuantity = (item) => {
  const match = String(item || "").match(/^(\d+(?:\.\d+)?)\s*[x×-]?\s*/i);
  return match ? Number(match[1]) : 1;
};

export const matchProductFromItem = (item, products) => {
  const normalizedItem = normalizeText(item).replace(/^(\d+(?:\.\d+)?)\s*[x×-]?\s*/i, "");
  return products.find((product) => {
    const productName = normalizeText(product.product_name);
    return productName && normalizedItem.includes(productName);
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