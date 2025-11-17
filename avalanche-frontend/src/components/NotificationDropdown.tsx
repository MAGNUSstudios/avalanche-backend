import React, { useState, useEffect, useRef } from 'react';
import { styled } from '../stitches.config';
import { Bell, Check, X, AlertCircle, DollarSign, Users, TrendingUp, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';

const DropdownContainer = styled('div', {
  position: 'relative',
});

const NotificationButton = styled('button', {
  position: 'relative',
  padding: '$2',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-secondary)',
  transition: 'color 0.2s ease',

  '&:hover': {
    color: 'var(--text-primary)',
  },

  variants: {
    hasUnread: {
      true: {
        '&::after': {
          content: '',
          position: 'absolute',
          top: '4px',
          right: '4px',
          width: '8px',
          height: '8px',
          backgroundColor: '#ef4444',
          borderRadius: '$full',
        },
      },
    },
  },
});

const Badge = styled('span', {
  position: 'absolute',
  top: '-4px',
  right: '-4px',
  backgroundColor: '#ef4444',
  color: 'white',
  borderRadius: '$full',
  fontSize: '10px',
  fontWeight: '$bold',
  minWidth: '18px',
  height: '18px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 4px',
});

const DropdownPanel = styled('div', {
  position: 'absolute',
  top: 'calc(100% + 8px)',
  right: 0,
  width: '380px',
  maxHeight: '500px',
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '$lg',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
  zIndex: 1000,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
});

const DropdownHeader = styled('div', {
  padding: '$4',
  borderBottom: '1px solid var(--border-color)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const HeaderTitle = styled('h3', {
  fontSize: '$base',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
  margin: 0,
});

const MarkAllButton = styled('button', {
  fontSize: '$xs',
  color: 'var(--primary-color)',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontWeight: '$medium',
  transition: 'opacity 0.2s',

  '&:hover': {
    opacity: 0.8,
  },

  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

const NotificationList = styled('div', {
  overflowY: 'auto',
  maxHeight: '400px',

  '&::-webkit-scrollbar': {
    width: '6px',
  },

  '&::-webkit-scrollbar-track': {
    background: 'var(--bg-secondary)',
  },

  '&::-webkit-scrollbar-thumb': {
    background: 'var(--border-color)',
    borderRadius: '3px',
  },
});

const NotificationItem = styled('div', {
  padding: '$4',
  borderBottom: '1px solid var(--border-color)',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  display: 'flex',
  gap: '$3',

  '&:hover': {
    backgroundColor: 'var(--bg-secondary)',
  },

  '&:last-child': {
    borderBottom: 'none',
  },

  variants: {
    unread: {
      true: {
        backgroundColor: 'var(--bg-tertiary)',
      },
    },
  },
});

const IconWrapper = styled('div', {
  width: '40px',
  height: '40px',
  borderRadius: '$full',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,

  variants: {
    type: {
      alert: {
        backgroundColor: '#fef3c7',
        color: '#f59e0b',
      },
      user: {
        backgroundColor: '#dbeafe',
        color: '#3b82f6',
      },
      dispute: {
        backgroundColor: '#fee2e2',
        color: '#ef4444',
      },
      system: {
        backgroundColor: '#e0e7ff',
        color: '#6366f1',
      },
      guild: {
        backgroundColor: '#f3e8ff',
        color: '#a855f7',
      },
      revenue: {
        backgroundColor: '#d1fae5',
        color: '#10b981',
      },
      security: {
        backgroundColor: '#ffe4e6',
        color: '#f43f5e',
      },
      ai: {
        backgroundColor: '#fce7f3',
        color: '#ec4899',
      },
      default: {
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-secondary)',
      },
    },
  },
});

const NotificationContent = styled('div', {
  flex: 1,
  minWidth: 0,
});

const NotificationTitle = styled('div', {
  fontSize: '$sm',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
  marginBottom: '$1',
});

const NotificationMessage = styled('div', {
  fontSize: '$xs',
  color: 'var(--text-secondary)',
  lineHeight: 1.4,
  marginBottom: '$2',
});

const NotificationTime = styled('div', {
  fontSize: '$xs',
  color: 'var(--text-tertiary)',
});

const EmptyState = styled('div', {
  padding: '$8',
  textAlign: 'center',
  color: 'var(--text-secondary)',
  fontSize: '$sm',
});

const LoadingState = styled('div', {
  padding: '$8',
  textAlign: 'center',
  color: 'var(--text-secondary)',
  fontSize: '$sm',
});

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'alert':
      return <AlertCircle size={20} />;
    case 'user':
      return <Users size={20} />;
    case 'dispute':
      return <X size={20} />;
    case 'revenue':
      return <DollarSign size={20} />;
    case 'guild':
      return <Users size={20} />;
    case 'security':
      return <Shield size={20} />;
    case 'ai':
      return <Zap size={20} />;
    default:
      return <Bell size={20} />;
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Use the shared notification context
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read (this will update all instances via context)
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate to link if provided
    if (notification.link) {
      navigate(notification.link);
      setIsOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  return (
    <DropdownContainer ref={dropdownRef}>
      <NotificationButton
        hasUnread={unreadCount > 0}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={20} />
        {unreadCount > 0 && <Badge>{unreadCount > 99 ? '99+' : unreadCount}</Badge>}
      </NotificationButton>

      {isOpen && (
        <DropdownPanel>
          <DropdownHeader>
            <HeaderTitle>Notifications</HeaderTitle>
            {unreadCount > 0 && (
              <MarkAllButton onClick={handleMarkAllRead}>
                Mark all as read
              </MarkAllButton>
            )}
          </DropdownHeader>

          {loading ? (
            <LoadingState>Loading notifications...</LoadingState>
          ) : notifications.length === 0 ? (
            <EmptyState>No notifications</EmptyState>
          ) : (
            <NotificationList>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  unread={!notification.is_read}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <IconWrapper type={notification.type as any}>
                    {getNotificationIcon(notification.type)}
                  </IconWrapper>
                  <NotificationContent>
                    <NotificationTitle>{notification.title}</NotificationTitle>
                    <NotificationMessage>{notification.message}</NotificationMessage>
                    <NotificationTime>
                      {formatTimeAgo(notification.created_at)}
                    </NotificationTime>
                  </NotificationContent>
                </NotificationItem>
              ))}
            </NotificationList>
          )}
        </DropdownPanel>
      )}
    </DropdownContainer>
  );
};

export default NotificationDropdown;
