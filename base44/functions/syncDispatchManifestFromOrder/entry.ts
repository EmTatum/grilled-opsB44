import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const getReportDataFromTags = (tags = []) => {
  const reportTag = (tags || []).find((tag) => String(tag).startsWith('report-data:'));
  if (!reportTag) return {};
  try {
    return JSON.parse(String(reportTag).replace('report-data:', ''));
  } catch {
    return {};
  }
};

const normalizePaymentStatus = (paymentStatus, paymentMethod) => {
  const status = String(paymentStatus || '').toUpperCase();
  const method = String(paymentMethod || '').toUpperCase();
  if (status === 'PAID') return 'PAID';
  if (status === 'CASH' || method === 'CASH') return 'CASH';
  return 'PENDING';
};

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return amount > 0 ? `R${amount.toLocaleString('en-ZA')}` : 'Not confirmed.';
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const eventType = payload?.event?.type;
    const orderId = payload?.data?.id || payload?.event?.entity_id;

    if (!orderId || eventType === 'delete') {
      return Response.json({ success: true, skipped: true });
    }

    const order = payload?.data || await base44.entities.Order.get(orderId);
    if (!order?.source_report_id) {
      return Response.json({ success: true, skipped: true });
    }

    const report = await base44.entities.CustomerNote.get(order.source_report_id);
    const currentData = getReportDataFromTags(report.tags || []);
    const paymentStatus = normalizePaymentStatus(order.payment_status, order.payment_method);

    const nextData = {
      ...currentData,
      client_name: order.client_name || report.client_name || 'Not recorded.',
      cell_number: report.cell_number || currentData.cell_number || 'Not recorded.',
      payment_method: order.payment_method || currentData.payment_method || 'Not recorded.',
      payment_status: paymentStatus,
      delivery_date: report.delivery_date || currentData.delivery_date || 'Not recorded.',
      delivery_address: order.delivery_address || report.delivery_address || currentData.delivery_address || 'Not recorded.',
      order_list: order.order_details || report.order_list || currentData.order_list || 'Not recorded.',
      order_total: formatCurrency(order.order_value),
      sentiment_analysis: currentData.sentiment_analysis || 'Not recorded.',
      red_flags: currentData.red_flags || 'None recorded.',
      green_flags: currentData.green_flags || 'None recorded.',
      next_action: order.special_instructions || report.next_action || currentData.next_action || 'Not recorded.',
    };

    const nextTags = [
      ...(report.tags || []).filter((tag) => !String(tag).startsWith('report-data:') && !String(tag).startsWith('payment-status:')),
      `payment-status:${paymentStatus}`,
      `report-data:${JSON.stringify(nextData)}`,
    ];

    const content = [
      'CLIENT INFORMATION',
      `Client Name: ${nextData.client_name}`,
      `Cell Number: ${nextData.cell_number}`,
      `Payment Method: ${nextData.payment_method}`,
      `Payment Status: ${nextData.payment_status}`,
      '',
      'DELIVERY INFORMATION',
      `Delivery Date: ${nextData.delivery_date}`,
      `Delivery Address: ${nextData.delivery_address}`,
      '',
      'ORDER DETAILS',
      `${nextData.order_list}`,
      `Order Total: ${nextData.order_total}`,
      '',
      'CLIENT SENTIMENT',
      `Sentiment Analysis: ${nextData.sentiment_analysis}`,
      '',
      'FLAGS',
      `Red Flags: ${nextData.red_flags}`,
      `Green Flags: ${nextData.green_flags}`,
      '',
      'NEXT STEPS',
      `Next Action: ${nextData.next_action}`,
    ].join('\n');

    await base44.entities.CustomerNote.update(report.id, {
      client_name: nextData.client_name,
      content,
      tags: nextTags,
      delivery_address: nextData.delivery_address,
      order_list: nextData.order_list,
      next_action: nextData.next_action,
      payment_status: paymentStatus,
      order_total: Number(order.order_value || 0),
      total_spend: Number(order.order_value || 0),
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});