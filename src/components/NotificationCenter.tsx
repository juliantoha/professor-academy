import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CheckCheck, Trash2, FileText, CheckCircle, AlertCircle, MessageSquare, Award, Settings } from 'lucide-react';
import { useNotifications, Notification } from '../contexts/NotificationContext';

const NotificationCenter = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'submission':
        return <FileText size={18} />;
      case 'approval':
        return <CheckCircle size={18} />;
      case 'needs_work':
        return <AlertCircle size={18} />;
      case 'message':
        return <MessageSquare size={18} />;
      case 'achievement':
        return <Award size={18} />;
      case 'system':
        return <Settings size={18} />;
      default:
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ display: 'block' }}>
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
    }
  };

  const getIconColor = (type: Notification['type']) => {
    switch (type) {
      case 'submission':
        return { bg: '#EFF6FF', color: '#3B82F6' };
      case 'approval':
        return { bg: '#ECFDF5', color: '#10B981' };
      case 'needs_work':
        return { bg: '#FEF3C7', color: '#F59E0B' };
      case 'message':
        return { bg: '#F3E8FF', color: '#8B5CF6' };
      case 'achievement':
        return { bg: '#FFF7ED', color: '#F97316' };
      case 'system':
        return { bg: '#F1F5F9', color: '#64748B' };
      default:
        return { bg: '#F1F5F9', color: '#64748B' };
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const groupNotifications = (notifications: Notification[]) => {
    const today: Notification[] = [];
    const yesterday: Notification[] = [];
    const thisWeek: Notification[] = [];
    const older: Notification[] = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart.getTime() - 86400000);
    const weekStart = new Date(todayStart.getTime() - 7 * 86400000);

    notifications.forEach(n => {
      const time = n.timestamp.getTime();
      if (time >= todayStart.getTime()) {
        today.push(n);
      } else if (time >= yesterdayStart.getTime()) {
        yesterday.push(n);
      } else if (time >= weekStart.getTime()) {
        thisWeek.push(n);
      } else {
        older.push(n);
      }
    });

    return { today, yesterday, thisWeek, older };
  };

  const grouped = groupNotifications(notifications);

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
      setIsOpen(false);
    }
  };

  const renderNotificationGroup = (title: string, items: Notification[]) => {
    if (items.length === 0) return null;

    return (
      <div style={{ marginBottom: '1rem' }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#64748B',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          padding: '0.5rem 1rem',
          background: '#F8FAFC'
        }}>
          {title}
        </div>
        {items.map(notification => {
          const iconStyle = getIconColor(notification.type);
          return (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              style={{
                display: 'flex',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
                cursor: notification.link ? 'pointer' : 'default',
                background: notification.read ? 'white' : 'linear-gradient(135deg, #FFF7ED 0%, #FFFBF7 100%)',
                borderLeft: notification.read ? '3px solid transparent' : '3px solid #F97316',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F8FAFC';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = notification.read ? 'white' : 'linear-gradient(135deg, #FFF7ED 0%, #FFFBF7 100%)';
              }}
            >
              {/* Icon */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: iconStyle.bg,
                color: iconStyle.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {getIcon(notification.type)}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: notification.read ? 500 : 600,
                  color: '#1E293B',
                  marginBottom: '2px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {notification.title}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#64748B',
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {notification.message}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#94A3B8',
                  marginTop: '4px'
                }}>
                  {formatTime(notification.timestamp)}
                </div>
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                opacity: 0,
                transition: 'opacity 0.15s ease'
              }}
              className="notification-actions"
              >
                {!notification.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                    title="Mark as read"
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#E0F2FE',
                      color: '#0284C7',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Check size={12} />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notification.id);
                  }}
                  title="Remove"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#FEE2E2',
                    color: '#DC2626',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          border: 'none',
          background: isOpen ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
          color: 'white',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
        }}
      >
        {/* Bell icon - using raw SVG for reliable rendering */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          style={{
            display: 'block',
            minWidth: '22px',
            minHeight: '22px',
            animation: unreadCount > 0 ? 'bell-ring 0.5s ease-in-out' : 'none'
          }}
        >
          <path
            d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.3 21a1.94 1.94 0 0 0 3.4 0"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Badge */}
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            minWidth: '18px',
            height: '18px',
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
            color: 'white',
            fontSize: '10px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            boxShadow: '0 2px 8px rgba(249, 115, 22, 0.4)',
            animation: 'badge-pulse 2s ease-in-out infinite'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.3)',
              zIndex: 998,
              animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={() => setIsOpen(false)}
          />

          <div
            ref={panelRef}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(380px, 100vw)',
              background: 'white',
              boxShadow: '-4px 0 30px rgba(0,0,0,0.15)',
              zIndex: 999,
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInRight 0.3s ease-out'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1.25rem 1rem',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #003250 0%, #004A69 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" style={{ display: 'block', minWidth: '20px', minHeight: '20px' }}>
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h2 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: 'white',
                    margin: 0
                  }}>
                    Notifications
                  </h2>
                  {unreadCount > 0 && (
                    <p style={{
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.7)',
                      margin: '4px 0 0 0'
                    }}>
                      {unreadCount} unread
                    </p>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'rgba(255,255,255,0.15)',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                  >
                    <CheckCheck size={14} />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" style={{ display: 'block', minWidth: '18px', minHeight: '18px' }}>
                    <line x1="18" y1="6" x2="6" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <line x1="6" y1="6" x2="18" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden'
            }}>
              {notifications.length === 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4rem 2rem',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" style={{ display: 'block', minWidth: '32px', minHeight: '32px' }}>
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#1E293B',
                    margin: '0 0 0.5rem 0'
                  }}>
                    All caught up!
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#64748B',
                    margin: 0
                  }}>
                    You have no notifications yet.
                  </p>
                </div>
              ) : (
                <>
                  {renderNotificationGroup('Today', grouped.today)}
                  {renderNotificationGroup('Yesterday', grouped.yesterday)}
                  {renderNotificationGroup('This Week', grouped.thisWeek)}
                  {renderNotificationGroup('Older', grouped.older)}
                </>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div style={{
                padding: '0.75rem 1rem',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <button
                  onClick={clearAll}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    background: 'white',
                    color: '#64748B',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FEE2E2';
                    e.currentTarget.style.borderColor = '#FECACA';
                    e.currentTarget.style.color = '#DC2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.color = '#64748B';
                  }}
                >
                  <Trash2 size={14} />
                  Clear all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        @keyframes bell-ring {
          0%, 100% { transform: rotate(0); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-15deg); }
          60% { transform: rotate(10deg); }
          80% { transform: rotate(-10deg); }
        }

        @keyframes badge-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        div:hover > .notification-actions {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};

export default NotificationCenter;
