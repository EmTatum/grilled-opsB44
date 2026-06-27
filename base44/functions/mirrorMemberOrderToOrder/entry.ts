import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { event, data } = body;

    if (!data || !data.client_name) {
      return Response.json({ skipped: true, reason: 'no client_name' });
    }

    // Map MemberOrder fields to Order fields
    const orderPayload = {
      client_name: data.client_name || "",
      cell_number: data.cell_number || "",
      delivery_address: data.delivery_address || "",
      delivery_date: data.delivery_date || undefined,
      time_slot: data.time_slot || "",
      order_list: data.order_list || "",
      order_details: data.order_list || "",
      order_total: Number(data.order_total || 0),
      order_value: Number(data.order_total || 0),
      payment_status: data.payment_status || "PENDING",
      payment_method: data.payment_method || "Other",
      fulfilment_status: data.fulfilment_status || "Active",
      status: data.fulfilment_status === "Fulfilled" ? "Fulfilled" : data.fulfilment_status === "Cancelled" ? "Cancelled" : "Pending",
      order_date: data.created_date || new Date().toISOString(),
      next_action: data.next_action || "",
      intelligence_report_id: data.intelligence_report_id || "",
    };

    // Look for existing Order linked to this MemberOrder by client_name + order_date proximity
    const existing = await base44.asServiceRole.entities.Order.filter(
      { client_name: data.client_name },
      "-created_date",
      5
    );

    // Try to find one created within 60 seconds of this MemberOrder record
    const memberOrderCreated = new Date(data.created_date || 0).getTime();
    const linked = existing.find(o => {
      const orderCreated = new Date(o.order_date || o.created_date || 0).getTime();
      return Math.abs(orderCreated - memberOrderCreated) < 60000;
    });

    let result;
    if (linked) {
      result = await base44.asServiceRole.entities.Order.update(linked.id, orderPayload);
    } else if (event?.type === 'create') {
      result = await base44.asServiceRole.entities.Order.create(orderPayload);
    } else {
      // update — find most recent order for this client
      const recent = existing[0];
      if (recent) {
        result = await base44.asServiceRole.entities.Order.update(recent.id, orderPayload);
      } else {
        result = await base44.asServiceRole.entities.Order.create(orderPayload);
      }
    }

    return Response.json({ success: true, order_id: result.id, action: linked ? 'updated' : 'created' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});