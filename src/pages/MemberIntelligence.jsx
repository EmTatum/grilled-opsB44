import React, { useState, useEffect } from 'react';
import { User, Coffee, Palette, AlertCircle, CreditCard, MessageSquare, Zap, TrendingUp, TrendingDown, Minus, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
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
};

const valueStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: '#F5F0E8',
  lineHeight: 1.6,
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ade80', fontWeight: 700, fontSize: '20px' }}>
      <TrendingUp size={20} /> High
    </div>
  );
  if (value === 'Low') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#C2185B', fontWeight: 700, fontSize: '20px' }}>
      <TrendingDown size={20} /> Low
    </div>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(201,168,76,0.8)', fontWeight: 700, fontSize: '20px' }}>
      <Minus size={20} /> Medium
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

export default function MemberIntelligence() {
  const [records, setRecords] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState('matter');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(null);

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
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader title="Member Intelligence" subtitle="Neurological profiles, behavioral patterns, and strategic intelligence for key members." />

      {/* Client selector */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {records.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedId(r.id)}
            style={{
              ...actionBtnStyle,
              borderColor: r.id === selectedId ? '#C9A84C' : 'rgba(201,168,76,0.25)',
              color: r.id === selectedId ? '#C9A84C' : 'rgba(245,240,232,0.6)',
              background: r.id === selectedId ? 'rgba(201,168,76,0.08)' : 'transparent',
            }}
          >
            {r.client_name}
          </button>
        ))}
        {records.length === 0 && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'rgba(245,240,232,0.45)' }}>
            No intelligence records yet. Create one via the dashboard.
          </p>
        )}
      </div>

      {draft && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', color: '#C9A84C', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
                {draft.client_name}
              </h2>
              {draft.status && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(245,240,232,0.55)', marginTop: '6px' }}>{draft.status}</p>
              )}
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                {(draft.badges || []).map((b, i) => <BadgeTag key={i} label={b} />)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.6)', margin: '0 0 6px' }}>Sentiment Trend</p>
              <SentimentTrend value={draft.sentiment_trend} />
              {draft.sentiment && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(245,240,232,0.5)', marginTop: '4px' }}>{draft.sentiment}</p>
              )}
            </div>
          </div>

          {/* Top 3 cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* Resilience Protocol */}
            <div style={{ ...cardStyle, borderLeft: '3px solid #C2185B' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <AlertCircle size={16} color="#C2185B" />
                <span style={labelStyle}>Resilience Protocol</span>
              </div>
              <p style={valueStyle}>{draft.neurological_protocol || 'Not recorded.'}</p>
            </div>

            {/* Coffee Rush */}
            <div style={{ ...cardStyle, borderLeft: '3px solid #C9A84C' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Coffee size={16} color="#C9A84C" />
                <span style={labelStyle}>Coffee Rush</span>
              </div>
              {draft.coffee_rush ? (
                <>
                  <p style={{ ...valueStyle, fontWeight: 600, fontSize: '16px' }}>{draft.coffee_rush.usual || '—'}</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(245,240,232,0.5)', marginTop: '4px' }}>
                    {[draft.coffee_rush.temp, draft.coffee_rush.frequency].filter(Boolean).join(' · ')}
                  </p>
                </>
              ) : <p style={valueStyle}>Not recorded.</p>}
            </div>

            {/* Vegans Designs */}
            <div style={{ ...cardStyle, borderLeft: '3px solid rgba(201,168,76,0.5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Palette size={16} color="#C9A84C" />
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <p style={labelStyle}>Behavioral Patterns</p>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <MessageSquare size={18} color="rgba(245,240,232,0.35)" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <p style={{ ...valueStyle, fontWeight: 600, marginBottom: '4px' }}>Communication Preference</p>
                        <p style={{ ...valueStyle, color: 'rgba(245,240,232,0.6)', fontSize: '13px' }}>{draft.behavioral?.communication_preference || 'Not recorded.'}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <Zap size={18} color="rgba(245,240,232,0.35)" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <p style={{ ...valueStyle, fontWeight: 600, marginBottom: '4px' }}>Decision Speed</p>
                        <p style={{ ...valueStyle, color: 'rgba(245,240,232,0.6)', fontSize: '13px' }}>{draft.behavioral?.decision_speed || 'Not recorded.'}</p>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <p style={labelStyle}>Next Strategic Move</p>
                    <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', padding: '14px', borderRadius: '2px' }}>
                      <p style={{ ...valueStyle, fontSize: '13px' }}>{draft.next_strategic_move || 'Not recorded.'}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'financial' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
                  {draft.financials ? (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {[
                          ['Preference', draft.financials.preference],
                          ['Terms', draft.financials.terms],
                          ['Sensitivity', draft.financials.sensitivity],
                        ].map(([k, v]) => (
                          <div key={k}>
                            <p style={labelStyle}>{k}</p>
                            <p style={valueStyle}>{v || '—'}</p>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p style={labelStyle}>Payment Reliability</p>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: '8px' }}>
                          <CreditCard size={18} color="#C9A84C" style={{ flexShrink: 0 }} />
                          <p style={valueStyle}>{draft.financials.payment_reliability || 'Not recorded.'}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p style={valueStyle}>No financial data recorded.</p>
                  )}
                </div>
              )}

              {activeTab === 'log' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(draft.interaction_log || []).length === 0 ? (
                    <p style={{ ...valueStyle, color: 'rgba(245,240,232,0.4)' }}>No interaction log entries yet.</p>
                  ) : (
                    [...(draft.interaction_log || [])].sort((a, b) => new Date(b.date) - new Date(a.date)).map((entry, i) => (
                      <div key={i} style={{ display: 'flex', gap: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ minWidth: '110px' }}>
                          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(201,168,76,0.6)' }}>
                            {entry.date ? new Date(entry.date).toLocaleDateString('en-GB') : '—'}
                          </p>
                          {entry.channel && (
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(245,240,232,0.4)', marginTop: '2px' }}>{entry.channel}</p>
                          )}
                        </div>
                        <p style={valueStyle}>{entry.summary}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button style={{ ...actionBtnStyle, borderColor: 'rgba(201,168,76,0.3)', color: 'rgba(245,240,232,0.5)' }}>
              Export
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ ...actionBtnStyle, opacity: saving ? 0.6 : 1, cursor: saving ? 'default' : 'pointer' }}
            >
              {saving ? 'Saving...' : 'Update Intelligence'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}