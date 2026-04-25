import { useState } from 'react';
import { reportDispatchManifestIssue } from '@/functions/reportDispatchManifestIssue';

const discrepancyStyles = {
  critical: {
    border: '1px solid rgba(194,24,91,0.4)',
    background: 'rgba(194,24,91,0.08)',
    color: '#C2185B',
    label: 'Stock Shortage'
  },
  warning: {
    border: '1px solid rgba(201,168,76,0.35)',
    background: 'rgba(201,168,76,0.08)',
    color: '#C9A84C',
    label: 'Item Match Needed'
  }
};

export default function DispatchIssuePanel({ discrepancies = [] }) {
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
    <form onSubmit={handleSubmit} style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.2)', padding: '18px', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <p style={{ margin: 0, fontFamily: "'Cinzel', serif", fontSize: '18px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C9A84C' }}>Dispatch Reconciliation</p>
        <p style={{ margin: '6px 0 0', fontFamily: "'Raleway', sans-serif", fontSize: '12px', color: 'rgba(245,240,232,0.5)' }}>Live manifest-to-stock checks appear here so dispatch can catch shortages immediately.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {discrepancies.length === 0 ? (
          <div style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', padding: '14px' }}>
            <p style={{ margin: 0, fontFamily: "'Raleway', sans-serif", fontSize: '12px', color: 'rgba(245,240,232,0.65)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>No live dispatch discrepancies.</p>
          </div>
        ) : discrepancies.map((discrepancy) => {
          const tone = discrepancyStyles[discrepancy.severity] || discrepancyStyles.warning;
          return (
            <div key={discrepancy.id} style={{ border: tone.border, background: tone.background, padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '10px', fontWeight: 600, color: tone.color, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{tone.label}</span>
                <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '10px', color: 'rgba(245,240,232,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{discrepancy.client_name}</span>
              </div>
              <p style={{ margin: 0, fontFamily: "'Raleway', sans-serif", fontSize: '13px', color: '#F5F0E8', lineHeight: 1.55 }}>{discrepancy.message}</p>
              <p style={{ margin: 0, fontFamily: "'Raleway', sans-serif", fontSize: '11px', color: 'rgba(245,240,232,0.5)' }}>{discrepancy.item}</p>
            </div>
          );
        })}
      </div>

      <div style={{ height: '1px', background: 'rgba(201,168,76,0.18)' }} />

      <div>
        <p style={{ margin: 0, fontFamily: "'Cinzel', serif", fontSize: '18px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C9A84C' }}>Report Manifest Issue</p>
        <p style={{ margin: '6px 0 14px', fontFamily: "'Raleway', sans-serif", fontSize: '12px', color: 'rgba(245,240,232,0.5)' }}>Flag any mismatch so the manifest can be corrected quickly.</p>
      </div>
      <textarea
        value={issue}
        onChange={(e) => setIssue(e.target.value)}
        placeholder="Describe the issue here..."
        style={{ width: '100%', minHeight: '90px', background: '#1a1a1a', border: '1px solid rgba(201,168,76,0.2)', color: '#F5F0E8', padding: '12px', fontFamily: "'Raleway', sans-serif", fontSize: '13px', resize: 'vertical', outline: 'none' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <button type="submit" disabled={sending || !issue.trim()} style={{ background: 'transparent', border: '1px solid #C9A84C', color: '#C9A84C', fontFamily: "'Raleway', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '10px 16px', cursor: 'pointer', opacity: sending || !issue.trim() ? 0.6 : 1 }}>
          {sending ? 'Sending...' : 'Submit Issue'}
        </button>
        {sent && <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: '11px', color: 'rgba(201,168,76,0.75)', letterSpacing: '0.08em' }}>Issue sent.</span>}
      </div>
    </form>
  );
}