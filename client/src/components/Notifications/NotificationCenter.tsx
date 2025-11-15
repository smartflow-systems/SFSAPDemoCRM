import { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, Filter, Users, Briefcase, Mail, Phone, Calendar, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'lead' | 'deal' | 'task' | 'email' | 'call' | 'ai';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'high' | 'normal' | 'low';
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'ai',
      title: 'AI Lead Score Updated',
      message: 'John Smith from Acme Corp scored 92/100 - Hot Lead!',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      priority: 'high',
    },
    {
      id: '2',
      type: 'deal',
      title: 'Deal Won! 🎉',
      message: 'Sarah closed Enterprise Plan deal worth $45,000',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      priority: 'high',
    },
    {
      id: '3',
      type: 'task',
      title: 'Task Due Soon',
      message: 'Follow up with TechStart Inc - Due in 2 hours',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      priority: 'normal',
    },
    {
      id: '4',
      type: 'lead',
      title: 'New Lead Added',
      message: 'Michael Chen added Emma Davis from Global Industries',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      read: true,
      priority: 'normal',
    },
    {
      id: '5',
      type: 'email',
      title: 'Email Replied',
      message: 'David Brown replied to your proposal email',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
      priority: 'normal',
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => !n.read);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: Notification['type']) => {
    const iconClass = 'w-4 h-4';
    switch (type) {
      case 'lead':
        return <Users className={iconClass} />;
      case 'deal':
        return <Briefcase className={iconClass} />;
      case 'task':
        return <Calendar className={iconClass} />;
      case 'email':
        return <Mail className={iconClass} />;
      case 'call':
        return <Phone className={iconClass} />;
      case 'ai':
        return <Sparkles className={iconClass} />;
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'lead':
        return 'from-blue-500/20 to-blue-600/20 text-blue-400';
      case 'deal':
        return 'from-green-500/20 to-green-600/20 text-green-400';
      case 'task':
        return 'from-orange-500/20 to-orange-600/20 text-orange-400';
      case 'email':
        return 'from-purple-500/20 to-purple-600/20 text-purple-400';
      case 'call':
        return 'from-pink-500/20 to-pink-600/20 text-pink-400';
      case 'ai':
        return 'from-sf-gold/20 to-yellow-500/20 text-sf-gold';
    }
  };

  return (
    <>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-sf-brown/20 transition-all"
      >
        <Bell className="w-6 h-6 text-sf-text-secondary hover:text-sf-gold transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-sf-error rounded-full flex items-center justify-center text-xs font-bold text-white animate-sf-glow-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed top-16 right-4 w-96 z-50 glass-card p-0 overflow-hidden animate-sf-slide-down max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gold-800/20 bg-gradient-to-br from-sf-gold/10 to-transparent">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-sf-text-primary">Notifications</h3>
                  <p className="text-xs text-sf-text-muted">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-sf-text-muted hover:text-sf-gold transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filter === 'all'
                      ? 'bg-sf-gold text-sf-black'
                      : 'bg-sf-brown/30 text-sf-text-secondary hover:bg-sf-brown/50'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filter === 'unread'
                      ? 'bg-sf-gold text-sf-black'
                      : 'bg-sf-brown/30 text-sf-text-secondary hover:bg-sf-brown/50'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-sf-brown/30 text-sf-text-secondary hover:bg-sf-brown/50 transition-all"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-sf-text-muted opacity-30" />
                  <p className="text-sf-text-muted">
                    {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gold-800/10 hover:bg-sf-brown/10 transition-all ${
                      !notification.read ? 'bg-sf-gold/5 border-l-2 border-l-sf-gold' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`p-2 bg-gradient-to-br ${getTypeColor(notification.type)} rounded-lg mt-0.5`}>
                        {getIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className={`text-sm font-semibold ${
                            !notification.read ? 'text-sf-text-primary' : 'text-sf-text-secondary'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-sf-gold rounded-full mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-sf-text-muted mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-sf-text-muted">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </span>
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 rounded hover:bg-sf-gold/20 text-sf-text-muted hover:text-sf-gold transition-all"
                                title="Mark as read"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1 rounded hover:bg-sf-error/20 text-sf-text-muted hover:text-sf-error transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {filteredNotifications.length > 0 && (
              <div className="p-3 border-t border-gold-800/20 bg-sf-black/30">
                <button className="w-full text-center text-xs text-sf-gold hover:text-sf-gold-hover font-medium transition-colors">
                  View All Notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
