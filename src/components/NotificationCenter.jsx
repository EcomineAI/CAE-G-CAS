import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Calendar, AlertTriangle } from 'lucide-react';
import { supabase } from '../supabase/supabase';
import { formatTimeAgo } from '../utils/dateUtils';

const TYPE_META = {
  approved:    { label: 'Request approved',    icon: <Check  size={14} color="#fff" />, iconBg: '#22c55e' },
  declined:    { label: 'Request declined',    icon: <X      size={14} color="#fff" />, iconBg: '#ef4444' },
  cancelled:   { label: 'Appointment cancelled', icon: <X   size={14} color="#fff" />, iconBg: '#ef4444' },
  new_request: { label: 'New consultation request', icon: <Calendar size={14} color="#fff" />, iconBg: '#2e4a87' },
  completed:   { label: 'Consultation completed',   icon: <Check    size={14} color="#fff" />, iconBg: '#22c55e' },
};

const getTypeMeta = (type) =>
  TYPE_META[type] || { label: 'Notification', icon: <AlertTriangle size={14} color="#fff" />, iconBg: '#ffab00' };

// Extract the person's name from the notification message
// e.g. "Your consultation request with Dr. Riya Labitan has been approved!" → "Dr. Riya Labitan"
// e.g. "John Doe requested a consultation on Monday at 8:00" → "John Doe"
const extractNameFromMessage = (msg = '') => {
  let m = msg.match(/with\s+([A-Za-z][A-Za-z.\s]+?)\s+(has been|was declined|has been marked)/);
  if (m) return m[1].trim();
  m = msg.match(/^([A-Za-z][A-Za-z.\s]+?)\s+requested/);
  if (m) return m[1].trim();
  m = msg.match(/^([A-Za-z][A-Za-z.\s]+?)\s+cancelled/);
  if (m) return m[1].trim();
  return null;
};

const AVATAR_COLORS = ['#5bc8c8','#2e4a87','#7c3aed','#0891b2','#0d9488','#1a2d5a'];
const nameToColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const requestPushPermission = () => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
};

const showOsNotification = (notif) => {
  if (!('serviceWorker' in navigator) || Notification.permission !== 'granted') return;
  navigator.serviceWorker.ready.then(reg => {
    reg.showNotification(getTypeMeta(notif.type).label, {
      body: notif.message,
      icon: '/logo.png',
      badge: '/logo.png',
    });
  }).catch(() => {});
};

const NotificationCenter = ({ userId, isOpen, onClose, role = 'Student' }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState('All');

  useEffect(() => {
    if (!userId) return;
    requestPushPermission();
    const pushChannel = supabase
      .channel(`push-notif-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        async (payload) => {
          showOsNotification(payload.new);
          let senderProfile = null;
          if (payload.new.sender_id) {
            const { data } = await supabase.from('profiles').select('id, avatar_url, full_name').eq('id', payload.new.sender_id).single();
            senderProfile = data || null;
          }
          setNotifications(prev => [{ ...payload.new, senderProfile }, ...prev]);
        })
      .subscribe();
    return () => { supabase.removeChannel(pushChannel); };
  }, [userId]);

  useEffect(() => {
    if (!isOpen || !userId) return;
    const fetch = async () => {
      const { data, error } = await supabase
        .from('notifications').select('*').eq('user_id', userId)
        .order('created_at', { ascending: false }).limit(20);
      if (!error && data) {
        const senderIds = [...new Set(data.map(n => n.sender_id).filter(Boolean))];
        let profileMap = {};
        if (senderIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles').select('id, avatar_url, full_name').in('id', senderIds);
          (profiles || []).forEach(p => { profileMap[p.id] = p; });
        }
        setNotifications(data.map(n => ({ ...n, senderProfile: profileMap[n.sender_id] || null })));
      }
      setLoading(false);
    };
    fetch();
  }, [isOpen, userId]);

  const markAsRead = async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllAsRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const displayed   = filter === 'Unread' ? notifications.filter(n => !n.is_read) : notifications;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'transparent', zIndex: 1500 }} onClick={onClose}>
      <style>{`
        .nc-panel {
          position: fixed;
          top: 72px;
          right: 22px;
          width: 380px;
          max-height: 560px;
          background: var(--card-bg, #fff);
          border: 1px solid var(--border-color, #e5e8f0);
          border-radius: 18px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.18);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: ncSlideIn 0.2s ease;
          font-family: 'Outfit', sans-serif;
        }
        @keyframes ncSlideIn {
          from { transform: translateY(-8px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }

        /* Header */
        .nc-header {
          padding: 1.1rem 1.2rem 0 1.2rem;
          background: var(--card-bg, #fff);
        }
        .nc-title {
          font-size: 1.15rem; font-weight: 800;
          color: var(--text-primary, #1a2d5a);
          margin: 0 0 0.8rem 0;
        }
        .nc-tabs {
          display: flex; gap: 0.5rem;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid var(--border-color, #e5e8f0);
        }
        .nc-tab {
          padding: 0.3rem 1.1rem; border-radius: 20px;
          font-size: 0.82rem; font-weight: 700;
          cursor: pointer; border: 1.5px solid transparent;
          font-family: inherit; transition: all 0.15s;
        }
        .nc-tab.active {
          background: #1a2d5a; color: #fff; border-color: #1a2d5a;
        }
        .nc-tab.inactive {
          background: transparent; color: var(--text-primary, #1a2d5a);
          border-color: var(--border-color, #d1d5db);
        }
        .nc-tab.inactive:hover { border-color: #1a2d5a; }

        /* List */
        .nc-list { flex: 1; overflow-y: auto; scrollbar-width: none; }
        .nc-list::-webkit-scrollbar { display: none; }

        .nc-item {
          display: flex; align-items: flex-start; gap: 0.85rem;
          padding: 0.9rem 1.2rem;
          border-bottom: 1px solid var(--border-color, #e5e8f0);
          cursor: pointer; transition: background 0.15s;
          position: relative;
          background: var(--card-bg, #fff);
        }
        .nc-item:last-child { border-bottom: none; }
        .nc-item:hover { background: var(--bg-primary, #f0f2f8); }
        .nc-item.unread { background: #eef3fb; }
        .dark .nc-item.unread { background: rgba(91,128,196,0.12); }

        /* Avatar */
        .nc-avatar {
          width: 46px; height: 46px; border-radius: 50%;
          background: #b2e0e0;
          flex-shrink: 0; position: relative;
          display: flex; align-items: center; justify-content: center;
        }
        .nc-avatar-icon {
          width: 20px; height: 20px; border-radius: 50%;
          position: absolute; bottom: 0; right: 0;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid var(--card-bg, #fff);
        }

        /* Content */
        .nc-body { flex: 1; min-width: 0; }
        .nc-label {
          font-size: 0.88rem; font-weight: 700;
          color: var(--text-primary, #1a2d5a);
          margin: 0 0 0.2rem 0;
        }
        .nc-msg {
          font-size: 0.78rem; color: var(--text-secondary, #4b5563);
          line-height: 1.45; margin: 0 0 0.25rem 0;
        }
        .nc-time {
          font-size: 0.7rem; color: var(--text-muted, #9ca3af); margin: 0;
        }

        /* Unread dot */
        .nc-dot {
          width: 10px; height: 10px; border-radius: 50%;
          background: #1a2d5a; flex-shrink: 0; margin-top: 4px;
        }
        .dark .nc-dot { background: #7ba4e0; }

        /* Footer */
        .nc-footer {
          padding: 0.9rem;
          border-top: 1px solid var(--border-color, #e5e8f0);
          background: var(--card-bg, #fff);
          display: flex; align-items: center; justify-content: center;
          gap: 1rem;
        }
        .nc-view-all {
          font-size: 0.9rem; font-weight: 700;
          color: #1a2d5a; background: none; border: none;
          cursor: pointer; font-family: inherit;
          text-decoration: none;
        }
        .dark .nc-view-all { color: #7ba4e0; }
        .nc-view-all:hover { text-decoration: underline; }
        .nc-mark-all {
          font-size: 0.78rem; font-weight: 600;
          color: var(--text-muted, #9ca3af); background: none; border: none;
          cursor: pointer; font-family: inherit;
        }
        .nc-mark-all:hover { color: var(--text-primary, #1a2d5a); }

        .nc-empty {
          padding: 3rem 1rem; text-align: center;
          color: var(--text-muted, #9ca3af); font-size: 0.85rem;
        }
      `}</style>

      <div className="nc-panel" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="nc-header">
          <p className="nc-title">{role} Notifications</p>
          <div className="nc-tabs">
            <button className={`nc-tab ${filter === 'All' ? 'active' : 'inactive'}`} onClick={() => setFilter('All')}>All</button>
            <button className={`nc-tab ${filter === 'Unread' ? 'active' : 'inactive'}`} onClick={() => setFilter('Unread')}>
              Unread{unreadCount > 0 ? ` (${unreadCount})` : ''}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="nc-list">
          {loading ? (
            <div className="nc-empty">Loading…</div>
          ) : displayed.length === 0 ? (
            <div className="nc-empty">
              <Bell size={36} style={{ opacity: 0.2, marginBottom: '0.75rem', display: 'block', margin: '0 auto 0.75rem' }} />
              {filter === 'Unread' ? 'No unread notifications' : 'No notifications yet'}
            </div>
          ) : (
            displayed.map(notif => {
              const meta = getTypeMeta(notif.type);
              return (
                <div
                  key={notif.id}
                  className={`nc-item${!notif.is_read ? ' unread' : ''}`}
                  onClick={() => markAsRead(notif.id)}
                >
                  {(() => {
                    const senderName = notif.senderProfile?.full_name || extractNameFromMessage(notif.message);
                    const avatarColor = nameToColor(senderName || '');
                    return (
                      <div className="nc-avatar" style={{ background: senderName ? avatarColor + '33' : '#b2e0e033' }}>
                        {notif.senderProfile?.avatar_url ? (
                          <img src={notif.senderProfile.avatar_url} alt="sender"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        ) : (
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: senderName ? avatarColor : '#5bc8c8' }}>
                            {senderName ? senderName.replace(/^(Dr|Mr|Ms|Mrs|Prof)\.?\s*/i, '')[0].toUpperCase() : '?'}
                          </span>
                        )}
                        <div className="nc-avatar-icon" style={{ background: meta.iconBg }}>
                          {meta.icon}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="nc-body">
                    <p className="nc-label">{meta.label}</p>
                    <p className="nc-msg">{notif.message}</p>
                    <p className="nc-time">{formatTimeAgo(notif.created_at)}</p>
                  </div>

                  {!notif.is_read && <div className="nc-dot" />}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="nc-footer">
          <button className="nc-view-all">View all notification</button>
          {unreadCount > 0 && (
            <button className="nc-mark-all" onClick={markAllAsRead}>Mark all read</button>
          )}
        </div>

      </div>
    </div>
  );
};

export default NotificationCenter;
