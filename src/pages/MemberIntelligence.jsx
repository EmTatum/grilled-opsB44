import React, { useState, useEffect } from 'react';
import { User, Coffee, Palette, AlertCircle, CreditCard, MessageSquare, Zap, TrendingUp, TrendingDown, Minus, Brain, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';

const cardStyle = {
  background: '#1a1a1a',
  border: '1px solid rgba(201,168,76,0.25)',
  borderRadius: '2px',
  padding: '20px',
};

const labelStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: '11px',
  fontWeight: 500,
  color: 'rgba(201,168,76,0.6)',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  marginBottom: '6px',
  margin: 0,
};

const valueStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: '#F5F0E8',
  lineHeight: 1.6,
  margin: '4px 0 0',
};

const tabBtnStyle = (active) => ({
  padding: '12px 20px',
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  fontWeight: 500,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  background: 'transparent',
  border: 'none',
  borderBottom: active ? '2px solid #C9A84C' : '2px solid transparent',
  color: active ? '#C9A84C' : 'rgba(245,240,232,0.5)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
});

const actionBtnStyle = {
  background: 'transparent',
  border: '1px solid #C9A84C',
  color: '#C9A84C',
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  fontWeight: 500,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  padding: '10px 24px',
  borderRadius: '2px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const SentimentTrend = ({ value }) => {
  if (value === 'High') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ade80', fontSize: '13px', fontFamily: 'var(--font-body)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
      <TrendingUp size={16} /> High
    </div>
  );
  if (value === 'Low') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#C2185B', fontSize: '13px', fontFamily: 'var(--font-body)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
      <TrendingDown size={16} /> Low
    </div>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(201,168,76,0.8)', fontSize: '13px', fontFamily: 'var(--font-body)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
      <Minus size={16} /> Medium
    </div>
  );
};

const BadgeTag = ({ label }) => (
  <span style={{
    border: '1px solid rgba(201,168,76,0.4)',
    color: '#C9A84C',
    background: 'rgba(201,168,76,0.08)',
    fontFamily: 'var(--font-body)',
    fontSize: '10px',
    fontWeight: 500,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '3px 8px',
    borderRadius: '2px',
  }}>
    {label}
  </span>
);

const Spinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
    <div style={{ width: '24px', height: '24px', border: '1px solid rgba(201,168,76,0.2)', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const FieldRow = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <p style={labelStyle}>{label}</p>
    <p style={valueStyle}>{value || '—'}</p>
  </div>
);

export default function MemberIntelligence() {
  const [records, setRecords] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState('matter');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);
  const [draft, setDraft] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadRecords = async (keepSelectedId) => {
    const res = await base44.entities.MemberIntelligence.list('-updated_date', 200);
    setRecords(res || []);
    return res;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    base44.entities.MemberIntelligence.list('-updated_date', 200).then((res) => {
      setRecords(res || []);
      if (idParam) {
        setSelectedId(idParam);
      } else if (res && res.length > 0) {
        setSelectedId(res[0].id);
      }
      setLoading(false);
    });
  }, []);

  const selected = records.find((r) => r.id === selectedId) || null;

  useEffect(() => {
    setDraft(selected ? { ...selected } : null);
    setActiveTab('matter');
  }, [selectedId]);

  const handleSave = async () => {
    if (!draft || !draft.id) return;
    setSaving(true);
    try {
      const updated = await base44.entities.MemberIntelligence.update(draft.id, {
        ...draft,
        last_updated: new Date().toISOString(),
      });
      setRecords((prev) => prev.map((r) => r.id === updated.id ? updated : r));
      showToast('Intelligence record updated.');
    } catch (e) {
      showToast('Save failed. Please try again.', 'error');
    }
    setSaving(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const res = await loadRecords();
    if (selectedId && res) {
      const refreshed = res.find((r) => r.id === selectedId);
      if (refreshed) setDraft({ ...refreshed });
    }
    setRefreshing(false);
    showToast('Intelligence refreshed.');
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Member Intelligence"
        subtitle="Neurological profiles, behavioral patterns, and strategic intelligence for key members."
      />

      <div style={{ display: 'flex', gap: '0', minHeight: '70vh' }}>
        {/* Left: vertical client selector */}
        <div style={{
          width: '220px',
          flexShrink: 0,
          background: '#111111',
          border: '1px solid rgba(201,168,76,0.18)',
          borderRadius: '2px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
            <p style={{ ...labelStyle, marginBottom: 0 }}>Clients</p>
          </div>
          {records.length === 0 ? (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(245,240,232,0.35)', padding: '16px', margin: 0 }}>
              No records yet.
            </p>
          ) : (
            records.map((r) => {
              const isActive = r.id === selectedId;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  style={{
                    background: isActive ? 'rgba(201,168,76,0.08)' : 'transparent',
                    border: 'none',
                    borderLeft: isActive ? '2px solid #C9A84C' : '2px solid transparent',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    color: isActive ? '#C9A84C' : 'rgba(245,240,232,0.65)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    width: '100%',
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(201,168,76,0.04)'; e.currentTarget.style.color = '#F5F0E8'; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(245,240,232,0.65)'; } }}
                >
                  {r.client_name}
                </button>
              );
            })
          )}
        </div>

        {/* Right: profile panel */}
        <div style={{ flex: 1, paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!draft ? (
            <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
              <div style={{ textAlign: 'center' }}>
                <Brain size={32} color="rgba(201,168,76,0.3)" style={{ marginBottom: '12px' }} />
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(245,240,232,0.35)', letterSpacing: '0.08em' }}>
                  Select a client to view their intelligence profile.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', color: '#C9A84C', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
                    {draft.client_name}
                  </h2>
                  <div style={{ height: '2px', width: '48px', background: '#C9A84C', margin: '8px 0' }} />
                  {draft.status && (
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(245,240,232,0.55)', margin: '0 0 8px' }}>{draft.status}</p>
                  )}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {(draft.badges || []).map((b, i) => <BadgeTag key={i} label={b} />)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={labelStyle}>Sentiment Trend</p>
                  <div style={{ marginTop: '8px' }}>
                    <SentimentTrend value={draft.sentiment_trend} />
                  </div>
                  {draft.sentiment && (
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(245,240,232,0.5)', marginTop: '6px' }}>{draft.sentiment}</p>
                  )}
                </div>
              </div>

              {/* Top 3 accent cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                {/* Resilience Protocol */}
                <div style={{ ...cardStyle, borderLeft: '3px solid #C2185B' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <AlertCircle size={15} color="#C2185B" />
                    <span style={labelStyle}>Resilience Protocol</span>
                  </div>
                  <p style={valueStyle}>{draft.neurological_protocol || 'Not recorded.'}</p>
                </div>

                {/* Coffee Rush */}
                <div style={{ ...cardStyle, borderLeft: '3px solid #C9A84C' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <Coffee size={15} color="#C9A84C" />
                    <span style={labelStyle}>Coffee Rush</span>
                  </div>
                  {draft.coffee_rush ? (
                    <>
                      <p style={{ ...valueStyle, fontWeight: 600, fontSize: '15px' }}>{draft.coffee_rush.usual || '—'}</p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(245,240,232,0.5)', marginTop: '4px' }}>
                        {[draft.coffee_rush.temp, draft.coffee_rush.frequency].filter(Boolean).join(' · ')}
                      </p>
                    </>
                  ) : <p style={valueStyle}>Not recorded.</p>}
                </div>

                {/* Vegans Designs */}
                <div style={{ ...cardStyle, borderLeft: '3px solid rgba(160,100,200,0.7)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <Palette size={15} color="rgba(160,100,200,0.9)" />
                    <span style={labelStyle}>Vegans Designs</span>
                  </div>
                  {draft.vegans_designs ? (
                    <>
                      <p style={{ ...valueStyle, fontWeight: 600 }}>{draft.vegans_designs.aesthetic || '—'}</p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(245,240,232,0.5)', marginTop: '4px' }}>
                        Feedback: {draft.vegans_designs.feedback_style || '—'}
                      </p>
                    </>
                  ) : <p style={valueStyle}>Not recorded.</p>}
                </div>
              </div>

              {/* Tab panel */}
              <div style={{ ...cardStyle, padding: 0 }}>
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
                  <button style={tabBtnStyle(activeTab === 'matter')} onClick={() => setActiveTab('matter')}>Matter Intelligence</button>
                  <button style={tabBtnStyle(activeTab === 'financial')} onClick={() => setActiveTab('financial')}>Financial DNA</button>
                  <button style={tabBtnStyle(activeTab === 'log')} onClick={() => setActiveTab('log')}>Interaction Log</button>
                </div>

                <div style={{ padding: '24px' }}>
                  {activeTab === 'matter' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <p style={labelStyle}>Behavioral Patterns</p>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <MessageSquare size={17} color="rgba(245,240,232,0.3)" style={{ marginTop: '2px', flexShrink: 0 }} />
                          <div>
                            <p style={{ ...valueStyle, fontWeight: 600, marginBottom: '4px', marginTop: 0 }}>Communication Preference</p>
                            <p style={{ ...valueStyle, color: 'rgba(245,240,232,0.6)', fontSize: '13px' }}>{draft.behavioral?.communication_preference || 'Not recorded.'}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <Zap size={17} color="rgba(245,240,232,0.3)" style={{ marginTop: '2px', flexShrink: 0 }} />
                          <div>
                            <p style={{ ...valueStyle, fontWeight: 600, marginBottom: '4px', marginTop: 0 }}>Decision Speed</p>
                            <p style={{ ...valueStyle, color: 'rgba(245,240,232,0.6)', fontSize: '13px' }}>{draft.behavioral?.decision_speed || 'Not recorded.'}</p>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <p style={labelStyle}>Next Strategic Move</p>
                        <div style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.18)', padding: '16px', borderRadius: '2px' }}>
                          <p style={{ ...valueStyle, fontSize: '13px', margin: 0 }}>{draft.next_strategic_move || 'Not recorded.'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'financial' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
                      {draft.financials ? (
                        <>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            <FieldRow label="Preference" value={draft.financials.preference} />
                            <FieldRow label="Terms" value={draft.financials.terms} />
                            <FieldRow label="Sensitivity" value={draft.financials.sensitivity} />
                          </div>
                          <div>
                            <p style={labelStyle}>Payment Reliability</p>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: '10px' }}>
                              <CreditCard size={17} color="#C9A84C" style={{ flexShrink: 0 }} />
                              <p style={{ ...valueStyle, margin: 0 }}>{draft.financials.payment_reliability || 'Not recorded.'}</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p style={{ ...valueStyle, color: 'rgba(245,240,232,0.4)' }}>No financial data recorded.</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'log' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                      {(draft.interaction_log || []).length === 0 ? (
                        <p style={{ ...valueStyle, color: 'rgba(245,240,232,0.35)' }}>No interaction log entries yet.</p>
                      ) : (
                        [...(draft.interaction_log || [])].sort((a, b) => new Date(b.date) - new Date(a.date)).map((entry, i) => (
                          <div key={i} style={{ display: 'flex', gap: '20px', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ minWidth: '100px', flexShrink: 0 }}>
                              <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(201,168,76,0.65)', margin: 0 }}>
                                {entry.date ? new Date(entry.date).toLocaleDateString('en-GB') : '—'}
                              </p>
                              {entry.channel && (
                                <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'rgba(245,240,232,0.35)', marginTop: '3px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{entry.channel}</p>
                              )}
                            </div>
                            <p style={{ ...valueStyle, margin: 0 }}>{entry.summary}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingBottom: '24px' }}>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  style={{ ...actionBtnStyle, borderColor: 'rgba(201,168,76,0.35)', color: 'rgba(245,240,232,0.55)', display: 'flex', alignItems: 'center', gap: '8px', opacity: refreshing ? 0.6 : 1 }}
                >
                  <RefreshCw size={13} />
                  {refreshing ? 'Refreshing...' : 'Refresh Intelligence'}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{ ...actionBtnStyle, opacity: saving ? 0.6 : 1, cursor: saving ? 'default' : 'pointer' }}
                >
                  {saving ? 'Saving...' : 'Update Intelligence'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '12px 20px',
          background: toast.type === 'error' ? '#7f1d1d' : '#111111',
          border: `1px solid ${toast.type === 'error' ? 'rgba(194,24,91,0.5)' : 'rgba(201,168,76,0.4)'}`,
          color: toast.type === 'error' ? '#fca5a5' : '#C9A84C',
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          letterSpacing: '0.06em',
          zIndex: 9999,
          borderRadius: '2px',
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}