import React, { useState, useEffect } from 'react';
import { Archive } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { getArchivedRequests } from '../../../supabase/api';
import { withMinDelay } from '../../../supabase/ux';

const STATUS_COLOR = {
  Approved:  { bg: '#dcfce7', color: '#166534' },
  Pending:   { bg: '#fef3c7', color: '#92400e' },
  Declined:  { bg: '#fee2e2', color: '#b91c1c' },
  Cancelled: { bg: '#f1f5f9', color: '#374151' },
  Completed: { bg: '#ede9fe', color: '#3730a3' },
};

const STYLES = `
@keyframes archShim { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.arch-skel {
  background: linear-gradient(90deg,#eef0f6 25%,#dde1ec 50%,#eef0f6 75%);
  background-size: 200% 100%;
  animation: archShim 1.4s ease-in-out infinite;
  border-radius: 6px;
  display: inline-block;
}
.arch-wrap {
  max-width: 800px;
  margin: 0 auto;
  animation: archFade 0.3s ease;
}
@keyframes archFade { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
.arch-card {
  background: #fff;
  border: 1px solid var(--card-border, #e5e8f0);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
}
.arch-row {
  display: flex; align-items: center; gap: 1rem;
  padding: 0.9rem 1.2rem;
  border-bottom: 1px solid var(--border-color, #e5e8f0);
}
.arch-row:last-child { border-bottom: none; }
.arch-subject { font-size: 0.88rem; font-weight: 700; color: var(--text-primary); }
.arch-meta { font-size: 0.74rem; color: var(--text-muted); margin-top: 2px; }
.arch-badge { font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; white-space: nowrap; flex-shrink: 0; }
.arch-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 0.6rem; padding: 4rem 2rem; text-align: center; color: var(--text-muted);
  background: #fff; border: 1.5px solid var(--card-border, #e5e8f0);
  border-radius: 14px;
}
`;

const ArchiveContent = ({ role }) => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    withMinDelay(getArchivedRequests(user.id, role), 300).then(data => {
      setRecords(data);
      setLoading(false);
    });
  }, [user, role]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="arch-wrap">
      <style>{STYLES}</style>
      <p style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.15rem' }}>Archive</p>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1.3rem' }}>
        Records you've removed from your {role === 'faculty' ? 'requests' : 'appointments'} list.
      </p>

      {loading ? (
        <div className="arch-card">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="arch-row" style={{ opacity: 1 - i * 0.18 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                <span className="arch-skel" style={{ height: 14, width: '45%' }} />
                <span className="arch-skel" style={{ height: 11, width: '65%' }} />
              </div>
              <span className="arch-skel" style={{ height: 20, width: 72, borderRadius: 20 }} />
            </div>
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="arch-empty">
          <Archive size={36} strokeWidth={1.4} style={{ opacity: 0.3 }} />
          <p style={{ fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>No archived records</p>
          <p style={{ fontSize: '0.83rem', margin: 0 }}>Archived items from your {role === 'faculty' ? 'requests' : 'appointments'} will appear here.</p>
        </div>
      ) : (
        <div className="arch-card">
          {records.map(r => {
            const sc = STATUS_COLOR[r.status] || STATUS_COLOR.Cancelled;
            return (
              <div key={r.id} className="arch-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="arch-subject">{r.subject}</div>
                  <div className="arch-meta">{r.otherParty} · {formatDate(r.date)}</div>
                </div>
                <span className="arch-badge" style={{ background: sc.bg, color: sc.color }}>{r.status}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ArchiveContent;
