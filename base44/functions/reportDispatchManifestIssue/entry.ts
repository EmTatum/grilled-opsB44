import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const issue = String(payload?.issue || '').trim();

    if (!issue) {
      return Response.json({ error: 'Issue details are required' }, { status: 400 });
    }

    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: 'Dispatch Manifest Issue Reported',
      body: `A dispatch manifest issue was reported by ${user.full_name || user.email}.\n\nIssue:\n${issue}`,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});