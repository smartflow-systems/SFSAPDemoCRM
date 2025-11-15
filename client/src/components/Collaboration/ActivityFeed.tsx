import { useState, useEffect } from 'react';
import { Activity, Users, Briefcase, CheckCircle2, Phone, Mail, MessageSquare, Star, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'lead_created' | 'opportunity_won' | 'task_completed' | 'call_made' | 'email_sent' | 'note_added';
  user: {
    name: string;
    avatar?: string;
  };
  title: string;
  description?: string;
  timestamp: Date;
  metadata?: {
    leadName?: string;
    dealValue?: number;
    taskName?: string;
  };
}

interface ActivityFeedProps {
  limit?: number;
  showLiveIndicator?: boolean;
}

export default function ActivityFeed({ limit = 20, showLiveIndicator = true }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // Mock initial activities
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        type: 'opportunity_won',
        user: { name: 'Sarah Johnson' },
        title: 'Won a deal',
        description: 'Acme Corp - Enterprise Plan',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        metadata: { dealValue: 45000 },
      },
      {
        id: '2',
        type: 'lead_created',
        user: { name: 'Michael Chen' },
        title: 'Added new lead',
        description: 'John Smith from TechStart Inc',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        metadata: { leadName: 'John Smith' },
      },
      {
        id: '3',
        type: 'call_made',
        user: { name: 'Emma Davis' },
        title: 'Made a call',
        description: 'Follow-up call with Global Industries',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
      },
      {
        id: '4',
        type: 'task_completed',
        user: { name: 'James Wilson' },
        title: 'Completed task',
        description: 'Send proposal to Beta Company',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        metadata: { taskName: 'Send proposal' },
      },
      {
        id: '5',
        type: 'email_sent',
        user: { name: 'Lisa Martinez' },
        title: 'Sent email',
        description: 'Introduction email to new lead',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
      },
      {
        id: '6',
        type: 'note_added',
        user: { name: 'David Brown' },
        title: 'Added note',
        description: 'Client mentioned budget increase next quarter',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
      },
    ];

    setActivities(mockActivities);

    // Simulate real-time updates
    const interval = setInterval(() => {
      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        type: ['lead_created', 'opportunity_won', 'task_completed', 'call_made', 'email_sent'][
          Math.floor(Math.random() * 5)
        ] as any,
        user: { name: ['Sarah', 'Michael', 'Emma', 'James', 'Lisa'][Math.floor(Math.random() * 5)] },
        title: 'New activity',
        description: 'Sample activity',
        timestamp: new Date(),
      };

      setActivities((prev) => [newActivity, ...prev].slice(0, limit));
    }, 30000); // New activity every 30 seconds

    return () => clearInterval(interval);
  }, [limit]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case 'lead_created':
        return <Users className={`${iconClass} text-blue-400`} />;
      case 'opportunity_won':
        return <Star className={`${iconClass} text-sf-success`} />;
      case 'task_completed':
        return <CheckCircle2 className={`${iconClass} text-sf-success`} />;
      case 'call_made':
        return <Phone className={`${iconClass} text-purple-400`} />;
      case 'email_sent':
        return <Mail className={`${iconClass} text-sf-warning`} />;
      case 'note_added':
        return <MessageSquare className={`${iconClass} text-sf-gold`} />;
      default:
        return <Activity className={`${iconClass} text-sf-text-muted`} />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="glass-card p-6 animate-sf-scale-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
            <Activity className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-sf-text-primary">Team Activity</h2>
            <p className="text-sm text-sf-text-muted">Real-time updates</p>
          </div>
        </div>
        {showLiveIndicator && isLive && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-sf-success rounded-full animate-pulse"></div>
            <span className="text-xs text-sf-success font-medium">LIVE</span>
          </div>
        )}
      </div>

      {/* Activity List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-sf-text-muted mx-auto mb-3 opacity-30" />
            <p className="text-sf-text-muted">No recent activity</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div
              key={activity.id}
              className="glass-panel p-4 rounded-lg hover:bg-sf-brown/30 transition-all cursor-pointer animate-sf-slide-down"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 p-2 bg-sf-black/50 rounded-lg mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="text-sm font-medium text-sf-text-primary">
                        <span className="text-sf-gold">{activity.user.name}</span>
                        <span className="text-sf-text-secondary ml-1">{activity.title}</span>
                      </p>
                      {activity.description && (
                        <p className="text-sm text-sf-text-muted mt-0.5">{activity.description}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-1 text-xs text-sf-text-muted">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </div>
                  </div>

                  {/* Metadata */}
                  {activity.metadata?.dealValue && (
                    <div className="mt-2">
                      <span className="badge-sf-success text-xs">
                        {formatCurrency(activity.metadata.dealValue)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View All Link */}
      {activities.length >= limit && (
        <div className="mt-4 pt-4 border-t border-sf-gold/20 text-center">
          <button className="btn-sf-ghost text-sm">
            View All Activity
          </button>
        </div>
      )}
    </div>
  );
}
