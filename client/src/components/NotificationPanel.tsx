/**
 * Notification Panel Component
 * Displays real-time notifications
 */

import { Bell, Check, Trash2, X } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

interface NotificationPanelProps {
  userId?: string;
}

export function NotificationPanel({ userId }: NotificationPanelProps) {
  const {
    notifications,
    isConnected,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll
  } = useNotifications(userId);

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-[var(--sfs-glass-bg-hover)]"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-[var(--sfs-gold)]" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[var(--sfs-gold)] text-[var(--sfs-black)] text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          {isConnected && (
            <span className="absolute bottom-0 right-0 h-2 w-2 bg-green-500 rounded-full border border-[var(--sfs-background)]" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0 bg-[var(--sfs-panel-bg)] backdrop-blur-[var(--sfs-panel-blur)] border-[var(--sfs-panel-border)]"
        align="end"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--sfs-border)]">
          <div>
            <h3 className="font-semibold text-[var(--sfs-text-highlight)]">Notifications</h3>
            <p className="text-xs text-[var(--sfs-text)]">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          </div>
          <div className="flex gap-2">
            {notifications.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs hover:bg-[var(--sfs-glass-bg-hover)]"
                  title="Mark all as read"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-xs hover:bg-[var(--sfs-glass-bg-hover)]"
                  title="Clear all"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="h-12 w-12 text-[var(--sfs-gold)] opacity-30 mb-4" />
              <p className="text-sm text-[var(--sfs-text)] opacity-70">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--sfs-border)]">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 hover:bg-[var(--sfs-glass-bg-hover)] transition-colors ${
                    !notification.read ? 'bg-[var(--sfs-glass-bg)]' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`h-2 w-2 rounded-full ${getPriorityColor(
                            notification.priority
                          )}`}
                        />
                        <h4 className="text-sm font-medium text-[var(--sfs-text-highlight)] truncate">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <Badge
                            variant="secondary"
                            className="ml-auto bg-[var(--sfs-gold)] text-[var(--sfs-black)] text-xs px-1.5 py-0"
                          >
                            NEW
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-[var(--sfs-text)] mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-[var(--sfs-text)] opacity-60">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-[var(--sfs-glass-bg)]"
                          onClick={() => markAsRead(notification.id!)}
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-[var(--sfs-glass-bg)]"
                        onClick={() => clearNotification(notification.id!)}
                        title="Remove"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
