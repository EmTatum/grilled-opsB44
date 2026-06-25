import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const data = payload?.data;

    if (!data) {
      return Response.json({ ok: true, skipped: true, reason: 'No entity data in payload' });
    }

    const slackConn = await base44.asServiceRole.connectors.getConnection('slackbot');
    if (!slackConn?.access_token) {
      return Response.json({ error: 'Slack bot not connected' }, { status: 500 });
    }

    const channelName = Deno.env.get('SLACK_ORDER_CHANNEL') || 'general';

    // Resolve channel name to ID
    let channelId = null;
    let cursor = '';
    outer: while (true) {
      const url = `https://slack.com/api/conversations.list?limit=200${cursor ? `&cursor=${cursor}` : ''}`;
      const listRes = await fetch(url, {
        headers: { Authorization: `Bearer ${slackConn.access_token}` }
      });
      const listJson = await listRes.json();
      if (!listJson.ok) break;

      const found = (listJson.channels || []).find(
        (c) => c.name === channelName.replace(/^#/, '')
      );
      if (found) { channelId = found.id; break outer; }

      cursor = listJson.response_metadata?.next_cursor || '';
      if (!cursor) break;
    }

    if (!channelId) {
      return Response.json({ error: `Channel #${channelName} not found. Invite the bot and ensure the channel name is correct.` }, { status: 404 });
    }

    const clientName = data.client_name || 'Unknown Client';
    const orderTotal = data.order_total ? `R${Number(data.order_total).toLocaleString('en-ZA')}` : 'TBC';
    const deliveryDate = data.delivery_date || 'TBC';
    const paymentStatus = data.payment_status || 'PENDING';
    const orderList = data.order_list || 'Not specified';
    const deliveryAddress = data.delivery_address || 'Not specified';

    const paymentEmoji = paymentStatus === 'PAID' ? '✅' : paymentStatus === 'CASH' ? '💵' : '⏳';

    const message = [
      `🛒 *New Member Order — Grilled Ops*`,
      ``,
      `*Client:* ${clientName}`,
      `*Order Total:* ${orderTotal}`,
      `*Delivery Date:* ${deliveryDate}`,
      `*Delivery Address:* ${deliveryAddress}`,
      `*Items:* ${orderList}`,
      `*Payment Status:* ${paymentEmoji} ${paymentStatus}`,
    ].join('\n');

    const postRes = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${slackConn.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: channelId,
        text: message,
        username: 'Grilled Ops',
        icon_emoji: ':fire:',
      }),
    });

    const postJson = await postRes.json();
    if (!postJson.ok) {
      return Response.json({ error: `Slack API error: ${postJson.error}` }, { status: 500 });
    }

    return Response.json({ ok: true, channel: channelId, client: clientName });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});