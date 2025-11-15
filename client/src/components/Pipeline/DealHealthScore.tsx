import { useState } from 'react';
import { Heart, AlertTriangle, XCircle, TrendingUp, Clock, DollarSign, Activity, Info } from 'lucide-react';

interface DealHealthScoreProps {
  dealId?: number;
  dealValue?: number;
  stage?: string;
  lastActivity?: string;
  daysInStage?: number;
  probability?: number;
  showDetails?: boolean;
}

type HealthStatus = 'healthy' | 'at-risk' | 'critical';

interface HealthMetrics {
  status: HealthStatus;
  score: number;
  factors: {
    activity: { score: number; label: string };
    velocity: { score: number; label: string };
    engagement: { score: number; label: string };
    value: { score: number; label: string };
  };
  recommendations: string[];
}

export default function DealHealthScore({
  dealId,
  dealValue = 50000,
  stage = 'Proposal',
  lastActivity = '2 days ago',
  daysInStage = 14,
  probability = 65,
  showDetails = false,
}: DealHealthScoreProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Calculate health metrics
  const calculateHealth = (): HealthMetrics => {
    // Activity score (0-100) - based on last activity
    const activityDays = parseInt(lastActivity.split(' ')[0]) || 0;
    const activityScore = Math.max(0, 100 - (activityDays * 10));
    const activityLabel = activityScore > 70 ? 'Active' : activityScore > 40 ? 'Moderate' : 'Stale';

    // Velocity score (0-100) - based on days in stage
    const velocityScore = Math.max(0, 100 - (daysInStage * 3));
    const velocityLabel = velocityScore > 70 ? 'Fast' : velocityScore > 40 ? 'Normal' : 'Slow';

    // Engagement score (0-100) - based on probability
    const engagementScore = probability;
    const engagementLabel = engagementScore > 70 ? 'High' : engagementScore > 40 ? 'Medium' : 'Low';

    // Value score (0-100) - based on deal value
    const valueScore = Math.min(100, (dealValue / 100000) * 100);
    const valueLabel = valueScore > 70 ? 'High Value' : valueScore > 40 ? 'Medium Value' : 'Lower Value';

    // Overall score (weighted average)
    const overallScore = Math.round(
      (activityScore * 0.3) +
      (velocityScore * 0.3) +
      (engagementScore * 0.25) +
      (valueScore * 0.15)
    );

    // Determine status
    let status: HealthStatus;
    if (overallScore >= 70) status = 'healthy';
    else if (overallScore >= 40) status = 'at-risk';
    else status = 'critical';

    // Generate recommendations
    const recommendations: string[] = [];
    if (activityScore < 50) recommendations.push('Schedule a follow-up call or meeting');
    if (velocityScore < 50) recommendations.push('Move deal to next stage or re-qualify');
    if (engagementScore < 50) recommendations.push('Send personalized content to increase engagement');
    if (valueScore < 30) recommendations.push('Consider if this deal aligns with target customer profile');

    return {
      status,
      score: overallScore,
      factors: {
        activity: { score: activityScore, label: activityLabel },
        velocity: { score: velocityScore, label: velocityLabel },
        engagement: { score: engagementScore, label: engagementLabel },
        value: { score: valueScore, label: valueLabel },
      },
      recommendations,
    };
  };

  const health = calculateHealth();

  // Status configuration
  const statusConfig = {
    healthy: {
      icon: Heart,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
      label: 'Healthy',
      description: 'Deal is progressing well',
    },
    'at-risk': {
      icon: AlertTriangle,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30',
      label: 'At Risk',
      description: 'Needs attention',
    },
    critical: {
      icon: XCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30',
      label: 'Critical',
      description: 'Immediate action required',
    },
  };

  const config = statusConfig[health.status];
  const StatusIcon = config.icon;

  if (!showDetails) {
    // Compact view - just icon with tooltip
    return (
      <div className="relative inline-block">
        <div
          className={`p-2 rounded-lg ${config.bgColor} border ${config.borderColor} cursor-pointer transition-all hover:scale-110`}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <StatusIcon className={`w-4 h-4 ${config.color}`} />
        </div>

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 animate-sf-fade-in">
            <div className="glass-card p-3 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <StatusIcon className={`w-4 h-4 ${config.color}`} />
                <span className="font-semibold text-sf-text-primary">{config.label}</span>
                <span className="text-xs text-sf-text-muted ml-auto">{health.score}/100</span>
              </div>
              <p className="text-xs text-sf-text-secondary mb-3">{config.description}</p>

              {/* Quick metrics */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-sf-text-muted">Activity:</span>
                  <span className="text-sf-text-secondary">{health.factors.activity.label}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-sf-text-muted">Velocity:</span>
                  <span className="text-sf-text-secondary">{health.factors.velocity.label}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-sf-text-muted">Engagement:</span>
                  <span className="text-sf-text-secondary">{health.factors.engagement.label}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Detailed view - full card
  return (
    <div className="glass-card p-6 animate-sf-scale-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${config.bgColor} border ${config.borderColor}`}>
            <StatusIcon className={`w-6 h-6 ${config.color}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-sf-text-primary">Deal Health Score</h3>
            <p className="text-sm text-sf-text-muted">{config.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-sf-gold">{health.score}</div>
          <div className="text-xs text-sf-text-muted">/ 100</div>
        </div>
      </div>

      {/* Health Factors */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Activity */}
        <div className="glass-panel p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-sf-text-secondary">Activity</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-sf-text-primary">{health.factors.activity.score}</span>
            <span className="text-xs text-sf-text-muted">/ 100</span>
          </div>
          <p className="text-xs text-sf-text-muted mt-1">{health.factors.activity.label}</p>
          <div className="mt-2 h-1 bg-sf-brown/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 transition-all"
              style={{ width: `${health.factors.activity.score}%` }}
            />
          </div>
        </div>

        {/* Velocity */}
        <div className="glass-panel p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-sf-text-secondary">Velocity</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-sf-text-primary">{health.factors.velocity.score}</span>
            <span className="text-xs text-sf-text-muted">/ 100</span>
          </div>
          <p className="text-xs text-sf-text-muted mt-1">{health.factors.velocity.label}</p>
          <div className="mt-2 h-1 bg-sf-brown/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-400 transition-all"
              style={{ width: `${health.factors.velocity.score}%` }}
            />
          </div>
        </div>

        {/* Engagement */}
        <div className="glass-panel p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-medium text-sf-text-secondary">Engagement</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-sf-text-primary">{health.factors.engagement.score}</span>
            <span className="text-xs text-sf-text-muted">/ 100</span>
          </div>
          <p className="text-xs text-sf-text-muted mt-1">{health.factors.engagement.label}</p>
          <div className="mt-2 h-1 bg-sf-brown/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-pink-400 transition-all"
              style={{ width: `${health.factors.engagement.score}%` }}
            />
          </div>
        </div>

        {/* Value */}
        <div className="glass-panel p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-sf-gold" />
            <span className="text-sm font-medium text-sf-text-secondary">Value</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-sf-text-primary">{health.factors.value.score}</span>
            <span className="text-xs text-sf-text-muted">/ 100</span>
          </div>
          <p className="text-xs text-sf-text-muted mt-1">{health.factors.value.label}</p>
          <div className="mt-2 h-1 bg-sf-brown/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-sf-gold transition-all"
              style={{ width: `${health.factors.value.score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {health.recommendations.length > 0 && (
        <div className="glass-panel p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-sf-text-primary mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-sf-gold" />
            Recommended Actions
          </h4>
          <ul className="space-y-2">
            {health.recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-sf-text-secondary flex items-start gap-2">
                <span className="text-sf-gold mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
