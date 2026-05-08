import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Calendar, Info, AlertTriangle } from 'lucide-react';
import { supabase } from '../supabase/supabase';
import { formatTimeAgo } from '../utils/dateUtils';

const NotificationCenter = ({ userId, isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error) setNotifications(data || []);
      setLoading(false);
    };

    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications', 
        filter: `user_id=eq.${userId}` 
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isOpen, userId]);

  const markAsRead = async (id) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    
    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    }
  };

  const markAllAsRead = async () => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    
    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="notification-overlay" onClick={onClose}>
      <style>{`
        .notification-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: transparent;
          z-index: 1500;
        }
        .notification-panel {
          position: fixed;
          top: 70px;
          right: 20px;
          width: 350px;
          max-height: 500px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
          display: flex;
          flex-direction: column;
          animation: slideIn 0.2s ease;
          overflow: hidden;
        }
        @keyframes slideIn {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .notif-header {
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-primary);
        }
        .notif-header h3 { margin: 0; font-size: 1rem; }
        .mark-all-btn {
          font-size: 0.75rem;
          color: var(--accent-orange);
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 600;
        }
        .notif-list {
          flex: 1;
          overflow-y: auto;
          padding: 0.5rem;
        }
        .notif-item {
          padding: 0.8rem;
          border-radius: 10px;
          display: flex;
          gap: 0.8rem;
          cursor: pointer;
          transition: background 0.2s;
          position: relative;
          margin-bottom: 0.4rem;
        }
        .notif-item:hover { background: var(--bg-primary); }
        .notif-item.unread { background: var(--accent-light); }
        .notif-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .notif-content { flex: 1; }
        .notif-msg {
          font-size: 0.85rem;
          color: var(--text-primary);
          line-height: 1.4;
          margin-bottom: 0.2rem;
        }
        .notif-time {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        .unread-dot {
          width: 8px;
          height: 8px;
          background: var(--accent-orange);
          border-radius: 50%;
          position: absolute;
          top: 1rem;
          right: 0.8rem;
        }
        .empty-notif {
          padding: 3rem 1rem;
          text-align: center;
          color: var(--text-muted);
        }
        @media (max-width: 400px) {
          .notification-panel {
            width: 90%;
            right: 5%;
          }
        }
      `}</style>

      <div className="notification-panel" onClick={e => e.stopPropagation()}>
        <div className="notif-header">
          <h3>Notifications {unreadCount > 0 && `(${unreadCount})`}</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {unreadCount > 0 && (
              <button className="mark-all-btn" onClick={markAllAsRead}>Mark all read</button>
            )}
            <X size={18} onClick={onClose} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} />
          </div>
        </div>

        <div className="notif-list">
          {loading ? (
            <div className="empty-notif">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="empty-notif">
              <Bell size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`notif-item ${!notif.is_read ? 'unread' : ''}`}
                onClick={() => markAsRead(notif.id)}
              >
                <div className="notif-icon">
                  {notif.type === 'approved' && <Check size={16} color="#22c55e" />}
                  {notif.type === 'declined' && <X size={16} color="#ef4444" />}
                  {notif.type === 'new_request' && <Calendar size={16} color="#ea580c" />}
                  {notif.type === 'reminder' && <Info size={16} color="#3b82f6" />}
                  {(!['approved', 'declined', 'new_request', 'reminder'].includes(notif.type)) && <AlertTriangle size={16} color="#eab308" />}
                </div>
                <div className="notif-content">
                  <p className="notif-msg">{notif.message}</p>
                  <span className="notif-time">{formatTimeAgo(notif.created_at)}</span>
                </div>
                {!notif.is_read && <div className="unread-dot"></div>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
