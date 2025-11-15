import { useState } from 'react';
import { GraduationCap, TrendingUp, Lightbulb, Target, Zap, Sparkles, Award, AlertTriangle } from 'lucide-react';

interface CoachingInsight {
  type: 'strength' | 'improvement' | 'tip' | 'warning';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export default function AISalesCoach() {
  const [insights] = useState<CoachingInsight[]>([
    {
      type: 'strength',
      title: 'Fast Response Time',
      description: 'Your average response time is 2.3 hours, 40% faster than team average. Keep it up!',
      impact: 'high',
    },
    {
      type: 'improvement',
      title: 'Follow-up Frequency',
      description: 'Deals close 35% faster when you follow up within 24 hours. Try setting reminders.',
      impact: 'high',
    },
    {
      type: 'tip',
      title: 'Best Time to Call',
      description: 'Your calls between 10-11 AM have 60% higher connect rates than afternoon calls.',
      impact: 'medium',
    },
    {
      type: 'warning',
      title: 'Pipeline Risk',
      description: '3 deals in proposal stage for >14 days. Consider reaching out to move them forward.',
      impact: 'high',
    },
    {
      type: 'strength',
      title: 'High Win Rate',
      description: 'Your win rate is 68%, which is 23% above team average. Excellent work!',
      impact: 'high',
    },
    {
      type: 'tip',
      title: 'Email Engagement',
      description: 'Emails with questions get 45% more replies. Try ending with a clear call-to-action.',
      impact: 'medium',
    },
  ]);

  const getIcon = (type: CoachingInsight['type']) => {
    switch (type) {
      case 'strength':
        return <Award className="w-4 h-4" />;
      case 'improvement':
        return <TrendingUp className="w-4 h-4" />;
      case 'tip':
        return <Lightbulb className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getColor = (type: CoachingInsight['type']) => {
    switch (type) {
      case 'strength':
        return 'from-green-500/20 to-emerald-500/20 text-green-400 border-green-400/30';
      case 'improvement':
        return 'from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-400/30';
      case 'tip':
        return 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-400/30';
      case 'warning':
        return 'from-orange-500/20 to-red-500/20 text-orange-400 border-orange-400/30';
    }
  };

  const getImpactBadge = (impact: CoachingInsight['impact']) => {
    const colors = {
      high: 'bg-sf-gold/20 text-sf-gold border-sf-gold/30',
      medium: 'bg-blue-500/20 text-blue-400 border-blue-400/30',
      low: 'bg-sf-text-muted/20 text-sf-text-muted border-sf-text-muted/30',
    };

    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${colors[impact]}`}>
        {impact.toUpperCase()} IMPACT
      </span>
    );
  };

  return (
    <div className="glass-card p-6 animate-sf-scale-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
            <GraduationCap className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-sf-text-primary">AI Sales Coach</h2>
            <p className="text-sm text-sf-text-muted">Personalized insights for you</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sf-gold animate-sf-glow-pulse" />
        </div>
      </div>

      {/* Performance Score */}
      <div className="glass-panel p-4 rounded-lg mb-6 bg-gradient-to-br from-sf-gold/10 to-transparent border border-sf-gold/20">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-sf-text-secondary">Performance Score</span>
          <Target className="w-5 h-5 text-sf-gold" />
        </div>
        <div className="flex items-end gap-2 mb-2">
          <span className="text-4xl font-bold text-sf-gold">87</span>
          <span className="text-sf-text-muted mb-1">/100</span>
        </div>
        <div className="w-full bg-sf-brown/30 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sf-gold to-yellow-500 transition-all duration-1000"
            style={{ width: '87%' }}
          />
        </div>
        <p className="text-xs text-sf-text-muted mt-2">
          ↗️ +5 points from last week
        </p>
      </div>

      {/* Coaching Insights */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-sf-text-primary flex items-center gap-2">
          <Zap className="w-4 h-4 text-sf-gold" />
          Coaching Insights
        </h3>

        {insights.map((insight, index) => {
          const iconColor = getColor(insight.type).split(' ')[2]; // Extract text color class
          return (
            <div
              key={index}
              className="glass-panel p-4 rounded-lg hover:scale-[1.02] transition-transform cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 bg-gradient-to-br ${getColor(insight.type)} rounded-lg mt-0.5 border`}>
                  {getIcon(insight.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-sf-text-primary">{insight.title}</h4>
                    {getImpactBadge(insight.impact)}
                  </div>
                  <p className="text-sm text-sf-text-secondary leading-relaxed">{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Tips */}
      <div className="glass-panel p-4 rounded-lg mt-6 bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-400/20">
        <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Today's Pro Tip
        </h4>
        <p className="text-sm text-sf-text-secondary leading-relaxed">
          Deals with 5+ touchpoints close 40% faster. Schedule a mix of calls, emails, and meetings to build stronger relationships.
        </p>
      </div>
    </div>
  );
}
