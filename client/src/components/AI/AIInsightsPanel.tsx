import { useState, useEffect } from 'react';
import {
  Brain, TrendingUp, AlertCircle, Lightbulb, Target, Users,
  DollarSign, Clock, Zap, ArrowUp, ArrowDown, Info, Sparkles, RefreshCw
} from 'lucide-react';

interface Insight {
  id: string;
  type: 'opportunity' | 'warning' | 'trend' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  metric?: {
    value: string;
    change: number;
    label: string;
  };
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: string;
}

interface AIInsightsPanelProps {
  compact?: boolean;
  maxInsights?: number;
}

export default function AIInsightsPanel({
  compact = false,
  maxInsights = 10,
}: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');

  // Mock insights - in real app, fetch from AI API
  const mockInsights: Insight[] = [
    {
      id: '1',
      type: 'opportunity',
      title: 'High-Value Leads Trending Up',
      description: 'Your enterprise leads have increased by 45% this week. Consider allocating more resources to this segment.',
      impact: 'high',
      metric: {
        value: '23',
        change: 45,
        label: 'Enterprise Leads',
      },
      action: {
        label: 'View Leads',
        onClick: () => console.log('Navigate to leads'),
      },
      timestamp: '2 hours ago',
    },
    {
      id: '2',
      type: 'warning',
      title: '5 Deals at Risk of Stalling',
      description: 'These deals have been in "Proposal" stage for over 30 days with no recent activity. Immediate action recommended.',
      impact: 'high',
      metric: {
        value: '5',
        change: -12,
        label: 'Stalled Deals',
      },
      action: {
        label: 'Review Deals',
        onClick: () => console.log('Navigate to pipeline'),
      },
      timestamp: '3 hours ago',
    },
    {
      id: '3',
      type: 'trend',
      title: 'Win Rate Improving',
      description: 'Your win rate has increased from 62% to 68% over the past quarter. Great work!',
      impact: 'medium',
      metric: {
        value: '68%',
        change: 9.7,
        label: 'Win Rate',
      },
      timestamp: '5 hours ago',
    },
    {
      id: '4',
      type: 'recommendation',
      title: 'Optimize Follow-Up Timing',
      description: 'Analysis shows your deals close 40% faster when you follow up within 2 hours. Current average is 6 hours.',
      impact: 'medium',
      action: {
        label: 'Set Reminders',
        onClick: () => console.log('Setup reminders'),
      },
      timestamp: '1 day ago',
    },
    {
      id: '5',
      type: 'opportunity',
      title: 'Untapped Market Segment',
      description: 'Healthcare industry has 15 warm leads but low engagement. Consider a targeted campaign.',
      impact: 'high',
      metric: {
        value: '15',
        change: 0,
        label: 'Healthcare Leads',
      },
      action: {
        label: 'Create Campaign',
        onClick: () => console.log('Create campaign'),
      },
      timestamp: '1 day ago',
    },
    {
      id: '6',
      type: 'warning',
      title: 'Response Time Slowing',
      description: 'Average response time to new leads has increased to 8 hours (up from 3). This may impact conversion rates.',
      impact: 'medium',
      metric: {
        value: '8h',
        change: 167,
        label: 'Avg Response',
      },
      timestamp: '2 days ago',
    },
    {
      id: '7',
      type: 'trend',
      title: 'Email Open Rates Rising',
      description: 'Your personalized email templates are performing 25% better than generic ones.',
      impact: 'low',
      metric: {
        value: '42%',
        change: 25,
        label: 'Open Rate',
      },
      timestamp: '2 days ago',
    },
    {
      id: '8',
      type: 'recommendation',
      title: 'Cross-Sell Opportunity',
      description: '12 customers are eligible for premium plan upgrades based on their usage patterns.',
      impact: 'high',
      metric: {
        value: '12',
        change: 0,
        label: 'Upgrade Opportunities',
      },
      action: {
        label: 'View Customers',
        onClick: () => console.log('View upgrade opportunities'),
      },
      timestamp: '3 days ago',
    },
  ];

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      setInsights(mockInsights.slice(0, maxInsights));
      setLoading(false);
    }, 800);
  }, [maxInsights]);

  const typeConfig = {
    opportunity: {
      icon: Zap,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
      label: 'Opportunity',
    },
    warning: {
      icon: AlertCircle,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30',
      label: 'Warning',
    },
    trend: {
      icon: TrendingUp,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      label: 'Trend',
    },
    recommendation: {
      icon: Lightbulb,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30',
      label: 'Recommendation',
    },
  };

  const impactConfig = {
    high: { color: 'text-red-400', label: 'High Impact' },
    medium: { color: 'text-yellow-400', label: 'Medium Impact' },
    low: { color: 'text-green-400', label: 'Low Impact' },
  };

  const filteredInsights = selectedType === 'all'
    ? insights
    : insights.filter(i => i.type === selectedType);

  const refreshInsights = () => {
    setLoading(true);
    setTimeout(() => {
      setInsights([...mockInsights].sort(() => Math.random() - 0.5).slice(0, maxInsights));
      setLoading(false);
    }, 800);
  };

  if (loading) {
    return (
      <div className="glass-card p-6 animate-sf-scale-in">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Brain className="w-12 h-12 text-sf-gold mx-auto mb-3 animate-pulse" />
            <p className="text-sf-text-muted">AI is analyzing your data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    // Compact view - show top 3 insights
    const topInsights = insights.slice(0, 3);
    return (
      <div className="space-y-3">
        {topInsights.map((insight) => {
          const config = typeConfig[insight.type];
          const Icon = config.icon;
          return (
            <div
              key={insight.id}
              className={`glass-panel p-3 rounded-lg border ${config.borderColor}`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${config.bgColor}`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-sf-text-primary mb-1">
                    {insight.title}
                  </h4>
                  <p className="text-xs text-sf-text-muted line-clamp-2">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="glass-card p-6 animate-sf-scale-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-sf-text-primary">AI Insights</h3>
            <p className="text-sm text-sf-text-muted">Powered by Claude AI</p>
          </div>
        </div>
        <button
          onClick={refreshInsights}
          className="p-2 hover:bg-sf-brown/30 rounded-lg transition-colors"
          title="Refresh insights"
        >
          <RefreshCw className="w-5 h-5 text-sf-text-muted hover:text-sf-gold transition-colors" />
        </button>
      </div>

      {/* Type Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['all', 'opportunity', 'warning', 'trend', 'recommendation'].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              selectedType === type
                ? 'bg-sf-gold text-sf-black'
                : 'bg-sf-brown/30 text-sf-text-secondary hover:bg-sf-brown/50'
            }`}
          >
            {type === 'all' ? 'All Insights' : typeConfig[type as keyof typeof typeConfig].label}
          </button>
        ))}
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-sf-text-muted mx-auto mb-3 opacity-30" />
            <p className="text-sf-text-muted">No insights for this category</p>
          </div>
        ) : (
          filteredInsights.map((insight) => {
            const config = typeConfig[insight.type];
            const Icon = config.icon;
            const impactConf = impactConfig[insight.impact];

            return (
              <div
                key={insight.id}
                className={`glass-panel p-4 rounded-lg border ${config.borderColor} hover:bg-sf-brown/20 transition-all`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-base font-semibold text-sf-text-primary">
                          {insight.title}
                        </h4>
                        <span className={`text-xs ${impactConf.color} px-2 py-0.5 bg-sf-brown/30 rounded`}>
                          {impactConf.label}
                        </span>
                      </div>
                      <p className="text-sm text-sf-text-secondary">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metric */}
                {insight.metric && (
                  <div className="flex items-center gap-4 mb-3 pl-11">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-sf-gold">
                        {insight.metric.value}
                      </span>
                      <span className="text-xs text-sf-text-muted">
                        {insight.metric.label}
                      </span>
                    </div>
                    {insight.metric.change !== 0 && (
                      <div className={`flex items-center gap-1 text-sm ${
                        insight.metric.change > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {insight.metric.change > 0 ? (
                          <ArrowUp className="w-4 h-4" />
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )}
                        <span>{Math.abs(insight.metric.change)}%</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Row */}
                <div className="flex items-center justify-between pl-11">
                  <span className="text-xs text-sf-text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {insight.timestamp}
                  </span>
                  {insight.action && (
                    <button
                      onClick={insight.action.onClick}
                      className="btn-sf-secondary text-sm"
                    >
                      {insight.action.label}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gold-800/20 flex items-center justify-center text-xs text-sf-text-muted">
        <Info className="w-3 h-3 mr-1" />
        Insights update every 15 minutes based on your latest data
      </div>
    </div>
  );
}
