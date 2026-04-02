import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const event = payload?.event;
    const data = payload?.data;
    const oldData = payload?.old_data;

    if (!event || event.type !== 'update' || !data) {
      return Response.json({ ok: true, skipped: true, reason: 'Not a matching update event' });
    }

    const previousStatus = oldData?.status;
    const currentStatus = data?.status;
    const isRelevantTransition = previousStatus !== currentStatus && (currentStatus === 'Fulfilled' || currentStatus === 'Cancelled');

    if (!isRelevantTransition) {
      return Response.json({ ok: true, skipped: true, reason: 'Status transition not relevant' });
    }

    const allClientOrders = await base44.asServiceRole.entities.Order.filter({ client_name: data.client_name }, '-order_date', 500);
    const lifetimeValue = allClientOrders.reduce((sum, order) => sum + Number(order.order_value || 0), 0);

    const teamEmail = Deno.env.get('TEAM_NOTIFICATION_EMAIL');
    if (!teamEmail) {
      return Response.json({ error: 'TEAM_NOTIFICATION_EMAIL is not set' }, { status: 500 });
    }

    const subject = `Order ${currentStatus}: ${data.client_name}`;
    const body = [
      `Internal order alert for Grilled.inc`,
      ``,
      `Client: ${data.client_name || 'Unknown'}`,
      `Status change: ${previousStatus || 'Unknown'} → ${currentStatus}`,
      `Order date: ${data.order_date || 'Not set'}`,
      `Time slot: ${data.time_slot || 'Not set'}`,
      `Order value: R${Number(data.order_value || 0).toLocaleString()}`,
      `Payment method: ${data.payment_method || 'Not set'}`,
      `Items summary: ${data.order_details || 'Not provided'}`,
      ``,
      `Client lifetime value: R${lifetimeValue.toLocaleString()}`,
      `Total historical orders: ${allClientOrders.length}`,
      ``,
      `Order ID: ${data.id}`,
    ].join('\n');

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: teamEmail,
      subject,
      body,
      from_name: 'Grilled Ops Alerts',
    });

    return Response.json({ ok: true, notified: true, status: currentStatus, lifetimeValue });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});