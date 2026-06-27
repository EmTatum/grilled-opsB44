import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const PRODUCT_NAME_MAP = {
  Changaland: 'Changa', Changa: 'Changa', Cola: 'Cola', Dougies: 'Dougies',
  'Love MD': 'MD', MD: 'MD', MDMA: 'MD', 'Mary Jane': 'Bud', Bud: 'Bud',
  'Mushie Nuggets': 'Mushrooms', Mushrooms: 'Mushrooms',
  'Special K': 'Ketamine', 'Special k': 'Ketamine', Ketamine: 'Ketamine',
  Sweets: 'Ecstasy', 'Sweets (CBD Edibles)': 'Ecstasy', Ecstasy: 'Ecstasy',
  'Zol-Pies': 'Zolpidiem', Zolpediem: 'Zolpidiem', Zolpidiem: 'Zolpidiem',
  Acid: 'Acid', 'Xannie pots': 'Xannie Pots', 'Xannnie pots': 'Xannie Pots', 'Xannie Pots': 'Xannie Pots'
};

function normalizeProductName(name) {
  return PRODUCT_NAME_MAP[String(name || '').trim()] || String(name || '').trim();
}

function parseLineItems(orderList) {
  const raw = String(orderList || '').trim();
  if (!raw) return [];
  let items = raw.split(/\r?\n/).map(i => i.trim()).filter(Boolean);
  if (items.length <= 1) items = raw.split(',').map(i => i.trim()).filter(Boolean);
  return items.filter(i => !/(delivery|fee|charge|tip)/i.test(i));
}

function extractQuantityAndProductName(item) {
  const raw = String(item || '').trim();
  if (!raw) return { productName: '', quantity: 1 };
  let quantity = 1;
  let productName = raw;
  const patterns = [/^\s*(\d+)\s*x\s+/i, /^\s*x\s*(\d+)\s+/i, /^\s*(\d+)\s+/i, /\((\d+)\)/, /\bx\s*(\d+)\b/i, /\b(\d+)x\b/i];
  patterns.some(pattern => {
    const match = raw.match(pattern);
    if (!match) return false;
    quantity = Number(match[1]) || 1;
    productName = raw.replace(match[0], ' ').replace(/\s+/g, ' ').trim();
    return true;
  });
  return { productName, quantity: Math.max(1, quantity) };
}

function findMatchedProduct(productName, products) {
  const normalizedTarget = normalizeProductName(productName).toLowerCase();
  return (products || []).find(product => {
    const normalizedProduct = normalizeProductName(product.product_name).toLowerCase();
    return normalizedProduct && (normalizedTarget.includes(normalizedProduct) || normalizedProduct.includes(normalizedTarget));
  }) || null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [products, orders] = await Promise.all([
      base44.asServiceRole.entities.Product.list('product_name', 500),
      base44.asServiceRole.entities.Order.list('-updated_date', 1000)
    ]);

    const usageByProductId = new Map();

    (orders || [])
      .filter(order => order.fulfilment_status === 'Fulfilled')
      .forEach(order => {
        parseLineItems(order.order_list).forEach(item => {
          const { productName, quantity } = extractQuantityAndProductName(item);
          const matchedProduct = findMatchedProduct(productName, products);
          if (!matchedProduct) return;
          usageByProductId.set(matchedProduct.id, (usageByProductId.get(matchedProduct.id) || 0) + quantity);
        });
      });

    const updates = (products || []).map(product => {
      const latestCount = Number(product.latest_stock_count ?? product.current_stock ?? product.last_stock_count ?? 0);
      const deducted = Number(usageByProductId.get(product.id) || 0);
      const nextCurrentStock = Math.max(0, latestCount - deducted);
      return { product, latestCount, nextCurrentStock };
    });

    await Promise.all(
      updates.map(({ product, latestCount, nextCurrentStock }) =>
        base44.asServiceRole.entities.Product.update(product.id, {
          last_stock_count: Number(product.last_stock_count ?? latestCount),
          latest_stock_count: latestCount,
          current_stock: nextCurrentStock,
          new_stock_arrived: 0
        })
      )
    );

    return Response.json({ success: true, updated_products: updates.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});