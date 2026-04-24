import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('slack');
    const payload = await req.json();
    const targetName = String(payload?.channelName || '').replace(/^#/, '').toLowerCase();

    let cursor = '';
    const matches = [];

    do {
      const url = new URL('https://slack.com/api/conversations.list');
      url.searchParams.set('limit', '200');
      url.searchParams.set('types', 'public_channel,private_channel');
      if (cursor) url.searchParams.set('cursor', cursor);

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await response.json();

      if (!data.ok) {
        return Response.json({ error: data.error || 'Failed to fetch Slack channels' }, { status: 500 });
      }

      const found = (data.channels || []).filter((channel) => String(channel.name || '').toLowerCase() === targetName);
      matches.push(...found.map((channel) => ({ id: channel.id, name: channel.name, is_private: channel.is_private })));
      cursor = data.response_metadata?.next_cursor || '';
    } while (cursor);

    return Response.json({ matches });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});