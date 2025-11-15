import { useState } from 'react';
import {
  Trophy, Star, Zap, Target, TrendingUp, Award, Crown, Flame,
  Rocket, Medal, Diamond, Heart, Users, Briefcase, DollarSign,
  Calendar, CheckCircle, MessageCircle, Phone, Mail, Sparkles
} from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  requirement: string;
  category: 'sales' | 'activity' | 'collaboration' | 'milestone';
}

interface AchievementBadgesProps {
  userId?: number;
  compact?: boolean;
  showUnearned?: boolean;
}

export default function AchievementBadges({
  userId,
  compact = false,
  showUnearned = true,
}: AchievementBadgesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  // Mock badge data - in real app, fetch from API
  const badges: Badge[] = [
    // Sales Badges
    {
      id: 'first-deal',
      name: 'First Victory',
      description: 'Close your first deal',
      icon: <Trophy className="w-6 h-6" />,
      rarity: 'common',
      earned: true,
      earnedDate: '2025-01-10',
      progress: 100,
      requirement: 'Close 1 deal',
      category: 'sales',
    },
    {
      id: 'deal-master',
      name: 'Deal Master',
      description: 'Close 50 deals',
      icon: <Crown className="w-6 h-6" />,
      rarity: 'epic',
      earned: true,
      earnedDate: '2025-11-05',
      progress: 100,
      requirement: 'Close 50 deals',
      category: 'sales',
    },
    {
      id: 'sales-legend',
      name: 'Sales Legend',
      description: 'Close 100 deals',
      icon: <Diamond className="w-6 h-6" />,
      rarity: 'legendary',
      earned: false,
      progress: 68,
      requirement: 'Close 100 deals (68/100)',
      category: 'sales',
    },
    {
      id: 'big-fish',
      name: 'Big Fish',
      description: 'Close a deal worth over $100k',
      icon: <DollarSign className="w-6 h-6" />,
      rarity: 'rare',
      earned: true,
      earnedDate: '2025-10-20',
      progress: 100,
      requirement: 'Close a $100k+ deal',
      category: 'sales',
    },
    {
      id: 'whale-hunter',
      name: 'Whale Hunter',
      description: 'Close a deal worth over $500k',
      icon: <Rocket className="w-6 h-6" />,
      rarity: 'legendary',
      earned: false,
      progress: 40,
      requirement: 'Close a $500k+ deal',
      category: 'sales',
    },

    // Activity Badges
    {
      id: 'early-bird',
      name: 'Early Bird',
      description: 'Log activity before 8 AM for 7 days straight',
      icon: <Star className="w-6 h-6" />,
      rarity: 'common',
      earned: true,
      earnedDate: '2025-09-15',
      progress: 100,
      requirement: '7 days of early activity',
      category: 'activity',
    },
    {
      id: 'hot-streak',
      name: 'Hot Streak',
      description: 'Log activity every day for 30 days',
      icon: <Flame className="w-6 h-6" />,
      rarity: 'epic',
      earned: false,
      progress: 23,
      requirement: '30 day streak (23/30)',
      category: 'activity',
    },
    {
      id: 'call-champion',
      name: 'Call Champion',
      description: 'Make 100 calls in a week',
      icon: <Phone className="w-6 h-6" />,
      rarity: 'rare',
      earned: true,
      earnedDate: '2025-10-01',
      progress: 100,
      requirement: '100 calls per week',
      category: 'activity',
    },
    {
      id: 'email-ninja',
      name: 'Email Ninja',
      description: 'Send 50 personalized emails in a day',
      icon: <Mail className="w-6 h-6" />,
      rarity: 'rare',
      earned: false,
      progress: 60,
      requirement: '50 emails in one day (30/50)',
      category: 'activity',
    },

    // Collaboration Badges
    {
      id: 'team-player',
      name: 'Team Player',
      description: 'Help 5 teammates close deals',
      icon: <Users className="w-6 h-6" />,
      rarity: 'rare',
      earned: true,
      earnedDate: '2025-11-01',
      progress: 100,
      requirement: 'Assist 5 team deals',
      category: 'collaboration',
    },
    {
      id: 'mentor',
      name: 'Mentor',
      description: 'Train 3 new team members',
      icon: <Heart className="w-6 h-6" />,
      rarity: 'epic',
      earned: false,
      progress: 33,
      requirement: 'Train 3 members (1/3)',
      category: 'collaboration',
    },

    // Milestone Badges
    {
      id: 'month-quota',
      name: 'Quota Crusher',
      description: 'Hit monthly quota',
      icon: <Target className="w-6 h-6" />,
      rarity: 'common',
      earned: true,
      earnedDate: '2025-11-01',
      progress: 100,
      requirement: 'Achieve monthly quota',
      category: 'milestone',
    },
    {
      id: 'quarter-superstar',
      name: 'Quarter Superstar',
      description: 'Exceed quota by 150% in a quarter',
      icon: <Sparkles className="w-6 h-6" />,
      rarity: 'legendary',
      earned: true,
      earnedDate: '2025-09-30',
      progress: 100,
      requirement: '150% quota achievement',
      category: 'milestone',
    },
  ];

  const rarityConfig = {
    common: {
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/20',
      borderColor: 'border-gray-500/30',
      glowColor: 'shadow-gray-500/20',
      label: 'Common',
    },
    rare: {
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      glowColor: 'shadow-blue-500/30',
      label: 'Rare',
    },
    epic: {
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30',
      glowColor: 'shadow-purple-500/30',
      label: 'Epic',
    },
    legendary: {
      color: 'text-sf-gold',
      bgColor: 'bg-sf-gold/20',
      borderColor: 'border-sf-gold/30',
      glowColor: 'shadow-sf-gold/40',
      label: 'Legendary',
    },
  };

  const categories = [
    { id: 'all', label: 'All Badges', icon: <Award className="w-4 h-4" /> },
    { id: 'sales', label: 'Sales', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'activity', label: 'Activity', icon: <Zap className="w-4 h-4" /> },
    { id: 'collaboration', label: 'Team', icon: <Users className="w-4 h-4" /> },
    { id: 'milestone', label: 'Milestones', icon: <Trophy className="w-4 h-4" /> },
  ];

  const filteredBadges = badges.filter(badge => {
    if (selectedCategory === 'all') return showUnearned ? true : badge.earned;
    return badge.category === selectedCategory && (showUnearned ? true : badge.earned);
  });

  const earnedCount = badges.filter(b => b.earned).length;
  const totalCount = badges.length;
  const completionPercentage = Math.round((earnedCount / totalCount) * 100);

  if (compact) {
    // Compact view - show earned badges as icons
    const earnedBadges = badges.filter(b => b.earned).slice(0, 5);
    return (
      <div className="flex items-center gap-2">
        {earnedBadges.map((badge) => {
          const config = rarityConfig[badge.rarity];
          return (
            <div
              key={badge.id}
              className={`p-2 rounded-lg ${config.bgColor} border ${config.borderColor} ${config.color}`}
              title={badge.name}
            >
              {badge.icon}
            </div>
          );
        })}
        {earnedCount > 5 && (
          <span className="text-xs text-sf-text-muted">+{earnedCount - 5} more</span>
        )}
      </div>
    );
  }

  return (
    <div className="glass-card p-6 animate-sf-scale-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-sf-gold/20 to-purple-500/20 rounded-xl">
            <Award className="w-6 h-6 text-sf-gold" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-sf-text-primary">Achievement Badges</h3>
            <p className="text-sm text-sf-text-muted">
              {earnedCount} of {totalCount} earned ({completionPercentage}%)
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-sf-brown/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sf-gold to-purple-500 transition-all duration-500 animate-sf-glow-pulse"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              selectedCategory === category.id
                ? 'bg-sf-gold text-sf-black'
                : 'bg-sf-brown/30 text-sf-text-secondary hover:bg-sf-brown/50'
            }`}
          >
            {category.icon}
            {category.label}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredBadges.map((badge) => {
          const config = rarityConfig[badge.rarity];
          return (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`glass-panel p-4 rounded-lg cursor-pointer transition-all hover:scale-105 ${
                badge.earned
                  ? `border ${config.borderColor} ${config.glowColor} shadow-lg`
                  : 'opacity-50 grayscale hover:grayscale-0 hover:opacity-100'
              }`}
            >
              {/* Badge Icon */}
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full ${config.bgColor} border-2 ${config.borderColor} flex items-center justify-center ${config.color}`}>
                {badge.icon}
              </div>

              {/* Badge Name */}
              <h4 className="text-sm font-semibold text-sf-text-primary text-center mb-1">
                {badge.name}
              </h4>

              {/* Rarity */}
              <div className={`text-xs ${config.color} text-center mb-2`}>
                {config.label}
              </div>

              {/* Progress or Earned Date */}
              {badge.earned ? (
                <div className="text-xs text-sf-text-muted text-center">
                  Earned {badge.earnedDate}
                </div>
              ) : (
                badge.progress !== undefined && (
                  <div className="mt-2">
                    <div className="h-1 bg-sf-brown/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r from-${config.color} to-purple-400 transition-all`}
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-sf-text-muted text-center mt-1">
                      {badge.progress}%
                    </div>
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] animate-sf-fade-in"
            onClick={() => setSelectedBadge(null)}
          />

          {/* Modal */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[60] px-4 animate-sf-scale-in">
            <div className="glass-card p-6">
              {/* Icon */}
              <div className={`w-24 h-24 mx-auto mb-4 rounded-full ${rarityConfig[selectedBadge.rarity].bgColor} border-4 ${rarityConfig[selectedBadge.rarity].borderColor} flex items-center justify-center ${rarityConfig[selectedBadge.rarity].color}`}>
                {selectedBadge.icon}
              </div>

              {/* Name & Rarity */}
              <h3 className="text-2xl font-bold text-sf-text-primary text-center mb-2">
                {selectedBadge.name}
              </h3>
              <div className={`text-sm ${rarityConfig[selectedBadge.rarity].color} text-center mb-4`}>
                {rarityConfig[selectedBadge.rarity].label} Badge
              </div>

              {/* Description */}
              <p className="text-sf-text-secondary text-center mb-4">
                {selectedBadge.description}
              </p>

              {/* Requirement */}
              <div className="glass-panel p-3 rounded-lg mb-4">
                <p className="text-xs text-sf-text-muted text-center">
                  Requirement: {selectedBadge.requirement}
                </p>
              </div>

              {/* Status */}
              {selectedBadge.earned ? (
                <div className="flex items-center justify-center gap-2 text-sf-success">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Earned on {selectedBadge.earnedDate}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-sf-text-muted">Progress:</span>
                    <span className="text-sf-text-primary font-semibold">{selectedBadge.progress}%</span>
                  </div>
                  <div className="h-2 bg-sf-brown/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sf-gold to-purple-500 transition-all"
                      style={{ width: `${selectedBadge.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setSelectedBadge(null)}
                className="btn-sf-primary w-full mt-6"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
