import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const buildManifestSummary = (orders) => {
  const totalOrders = orders.length;
  const totalValue = orders.reduce((sum, order) => sum + (Number(order.order_value || 0) || 0), 0);
  const cashCount = orders.filter((order) => String(order.payment_method || '').toLowerCase() === 'cash').length;
  const confirmedCount = orders.filter((order) => ['confirmed', 'fulfilled'].includes(String(order.status || '').toLowerCase())).length;

  return { totalOrders, totalValue, cashCount, confirmedCount };
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('slack');
    const payload = await req.json();
    const channelId = payload?.channelId;

    if (!channelId) {
      return Response.json({ error: 'channelId is required' }, { status: 400 });
    }

    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59));

    const orders = await base44.asServiceRole.entities.Order.list('order_date', 300);
    const manifestOrders = (orders || []).filter((order) => {
      if (String(order.status || '').toLowerCase() === 'cancelled') return false;
      const orderDate = new Date(order.order_date);
      if (Number.isNaN(orderDate.getTime())) return false;
      return orderDate >= start && orderDate <= end;
    });

    const summary = buildManifestSummary(manifestOrders);
    const lines = manifestOrders.slice(0, 15).map((order) => {
      const slot = order.time_slot || new Date(order.order_date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
      return `• ${slot} — ${order.client_name || 'Client'} — ${order.order_details || 'Order details pending'}`;
    });

    const text = [
      '*Dispatch Manifest Ready*',
      `Date: ${start.toISOString().slice(0, 10)}`,
      `Orders: ${summary.totalOrders}`,
      `Confirmed: ${summary.confirmedCount}`,
      `Cash: ${summary.cashCount}`,
      `Value: R${summary.totalValue.toLocaleString('en-ZA')}`,
      '',
      lines.length ? '*Today\'s manifest*' : '*No active dispatches scheduled for today.*',
      ...lines,
    ].join('\n');

    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ channel: channelId, text }),
    });

    const data = await response.json();
    if (!data.ok) {
      return Response.json({ error: data.error || 'Failed to send Slack alert' }, { status: 500 });
    }

    return Response.json({ success: true, sent: true, totalOrders: summary.totalOrders });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});