import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const normalizePaymentStatus = (paymentStatus, paymentMethod) => {
  const status = String(paymentStatus || '').toUpperCase();
  const method = String(paymentMethod || '').toUpperCase();
  if (status === 'PAID') return 'PAID';
  if (status === 'CASH' || method === 'CASH') return 'CASH';
  return 'PENDING';
};

const getReportDataFromTags = (tags = []) => {
  const reportTag = tags.find((tag) => String(tag).startsWith('report-data:'));
  if (!reportTag) return {};
  return JSON.parse(String(reportTag).replace('report-data:', ''));
};

const buildOrderFromReport = (reportData, sourceReportId) => ({
  client_name: reportData.client_name || 'Not recorded.',
  order_details: reportData.order_list || 'Not recorded.',
  delivery_address: reportData.delivery_address || 'Not recorded.',
  payment_method: reportData.payment_method || 'Other',
  payment_status: normalizePaymentStatus(reportData.payment_status, reportData.payment_method),
  order_value: Number(String(reportData.order_total || '').replace(/[^\d.]/g, '')) || 0,
  order_date: reportData.delivery_date ? new Date(reportData.delivery_date).toISOString() : new Date().toISOString(),
  status: normalizePaymentStatus(reportData.payment_status, reportData.payment_method) === 'PENDING' ? 'Pending' : 'Confirmed',
  planner_status: normalizePaymentStatus(reportData.payment_status, reportData.payment_method) === 'PENDING' ? 'Pending' : 'Processing',
  source_report_id: sourceReportId,
  time_slot: reportData.delivery_date || '',
  special_instructions: reportData.next_action || '',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const noteId = payload?.noteId;
    const eventType = payload?.event?.type;
    const deletedId = payload?.event?.entity_id;

    if (eventType === 'delete' && deletedId) {
      const existingOrders = await base44.entities.Order.filter({ source_report_id: deletedId }, '-created_date', 10);
      await Promise.all(existingOrders.map((order) => base44.entities.Order.delete(order.id)));
      return Response.json({ success: true, deleted: existingOrders.length });
    }

    if (!noteId && !payload?.data?.id) {
      return Response.json({ error: 'noteId is required' }, { status: 400 });
    }

    const resolvedNoteId = noteId || payload.data.id;
    const note = await base44.entities.CustomerNote.get(resolvedNoteId);
    const reportData = getReportDataFromTags(note.tags || []);
    const orderPayload = buildOrderFromReport(reportData, note.id);
    const existingOrders = await base44.entities.Order.filter({ source_report_id: note.id }, '-created_date', 1);

    const order = existingOrders.length > 0
      ? await base44.entities.Order.update(existingOrders[0].id, orderPayload)
      : await base44.entities.Order.create(orderPayload);

    return Response.json({ success: true, order });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});