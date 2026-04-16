import { useState } from 'react';
import { reportDispatchManifestIssue } from '@/functions/reportDispatchManifestIssue';

export default function DispatchIssuePanel() {
  const [issue, setIssue] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!issue.trim() || sending) return;

    setSending(true);
    await reportDispatchManifestIssue({ issue });
    setSending(false);
    setSent(true);
    setIssue('');
    window.setTimeout(() => setSent(false), 2500);
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.2)', padding: '18px', marginTop: '24px' }}>
      <p style={{ margin: 0, fontFamily: "'Cinzel', serif", fontSize: '18px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C9A84C' }}>Report Manifest Issue</p>
      <p style={{ margin: '6px 0 14px', fontFamily: "'Raleway', sans-serif", fontSize: '12px', color: 'rgba(245,240,232,0.5)' }}>Flag any mismatch so the manifest can be corrected quickly.</p>
      <textarea
        value={issue}
        onChange={(e) => setIssue(e.target.value)}
        placeholder="Describe the issue here..."
        style={{ width: '100%', minHeight: '90px', background: '#1a1a1a', border: '1px solid rgba(201,168,76,0.2)', color: '#F5F0E8', padding: '12px', fontFamily: "'Raleway', sans-serif", fontSize: '13px', resize: 'vertical', outline: 'none' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
        <button type="submit" disabled={sending || !issue.trim()} style={{ background: 'transparent', border: '1px solid #C9A84C', color: '#C9A84C', fontFamily: "'Raleway', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '10px 16px', cursor: 'pointer', opacity: sending || !issue.trim() ? 0.6 : 1 }}>
          {sending ? 'Sending...' : 'Submit Issue'}
        </button>
        {sent && <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '11px', color: 'rgba(201,168,76,0.75)', letterSpacing: '0.08em' }}>Issue sent.</span>}
      </div>
    </form>
  );
}