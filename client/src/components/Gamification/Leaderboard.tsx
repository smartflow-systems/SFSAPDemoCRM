import { useState, useEffect } from 'react';
import { Trophy, Medal, Star, TrendingUp, Zap, Target, Award, Crown } from 'lucide-react';
import { useCRM } from '@/contexts/CRMContext';

interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar?: string;
  score: number;
  dealsWon: number;
  revenue: number;
  rank: number;
  trend: 'up' | 'down' | 'same';
  badges: string[];
}

interface LeaderboardProps {
  period?: 'daily' | 'weekly' | 'monthly' | 'all-time';
  limit?: number;
}

export default function Leaderboard({ period = 'monthly', limit = 10 }: LeaderboardProps) {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useCRM();

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockLeaders: LeaderboardEntry[] = [
      {
        userId: '1',
        name: 'Sarah Johnson',
        score: 2850,
        dealsWon: 28,
        revenue: 285000,
        rank: 1,
        trend: 'up',
        badges: ['Top Closer', 'Revenue King', 'Speed Demon'],
      },
      {
        userId: '2',
        name: 'Michael Chen',
        score: 2630,
        dealsWon: 24,
        revenue: 263000,
        rank: 2,
        trend: 'same',
        badges: ['Consistent Performer', 'Customer Favorite'],
      },
      {
        userId: '3',
        name: 'Emma Davis',
        score: 2420,
        dealsWon: 22,
        revenue: 242000,
        rank: 3,
        trend: 'up',
        badges: ['Rising Star', 'Team Player'],
      },
      {
        userId: '4',
        name: 'James Wilson',
        score: 2180,
        dealsWon: 19,
        revenue: 218000,
        rank: 4,
        trend: 'down',
        badges: ['Veteran'],
      },
      {
        userId: '5',
        name: 'Lisa Martinez',
        score: 2050,
        dealsWon: 18,
        revenue: 205000,
        rank: 5,
        trend: 'up',
        badges: ['Quick Start'],
      },
    ];

    setTimeout(() => {
      setLeaders(mockLeaders);
      setLoading(false);
    }, 500);
  }, [period]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-sf-text-muted font-semibold">#{rank}</span>;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'same') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-sf-success" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-sf-error rotate-180" />;
      default:
        return <span className="text-sf-text-muted">—</span>;
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

  const periodLabels = {
    daily: 'Today',
    weekly: 'This Week',
    monthly: 'This Month',
    'all-time': 'All Time',
  };

  return (
    <div className="glass-card p-6 animate-sf-scale-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-sf-gold/20 to-sf-gold/10 rounded-xl">
            <Trophy className="w-6 h-6 text-sf-gold" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-sf-text-primary">Leaderboard</h2>
            <p className="text-sm text-sf-text-muted">{periodLabels[period]}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-sf-gold animate-sf-glow-pulse" />
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['daily', 'weekly', 'monthly', 'all-time'] as const).map((p) => (
          <button
            key={p}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              period === p
                ? 'bg-sf-gold text-sf-black'
                : 'bg-sf-brown/30 text-sf-text-secondary hover:bg-sf-brown/50'
            }`}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass-panel p-3 rounded-lg text-center">
          <Zap className="w-5 h-5 text-sf-gold mx-auto mb-1" />
          <p className="text-xs text-sf-text-muted">Total Deals</p>
          <p className="text-lg font-bold text-sf-text-primary">
            {leaders.reduce((sum, l) => sum + l.dealsWon, 0)}
          </p>
        </div>
        <div className="glass-panel p-3 rounded-lg text-center">
          <Target className="w-5 h-5 text-sf-success mx-auto mb-1" />
          <p className="text-xs text-sf-text-muted">Revenue</p>
          <p className="text-lg font-bold text-sf-text-primary">
            {formatCurrency(leaders.reduce((sum, l) => sum + l.revenue, 0))}
          </p>
        </div>
        <div className="glass-panel p-3 rounded-lg text-center">
          <Award className="w-5 h-5 text-sf-warning mx-auto mb-1" />
          <p className="text-xs text-sf-text-muted">Leaders</p>
          <p className="text-lg font-bold text-sf-text-primary">{leaders.length}</p>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-20 rounded-lg"></div>
            ))}
          </div>
        ) : (
          leaders.slice(0, limit).map((leader, index) => (
            <div
              key={leader.userId}
              className={`glass-panel p-4 rounded-lg transition-all hover:scale-[1.02] cursor-pointer ${
                leader.rank <= 3 ? 'border border-sf-gold/30' : ''
              } ${user?.id === leader.userId ? 'bg-sf-gold/10 border-sf-gold' : ''}`}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex-shrink-0 w-12 text-center">
                  {getRankIcon(leader.rank)}
                </div>

                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sf-gold to-sf-gold-hover flex items-center justify-center text-sf-black font-bold text-lg">
                    {leader.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sf-text-primary truncate">{leader.name}</h3>
                    {user?.id === leader.userId && (
                      <span className="badge-sf-gold text-xs">You</span>
                    )}
                    {getTrendIcon(leader.trend)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-sf-text-muted">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {leader.dealsWon} deals
                    </span>
                    <span>•</span>
                    <span className="text-sf-success">{formatCurrency(leader.revenue)}</span>
                  </div>
                  {/* Badges */}
                  {leader.badges.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {leader.badges.slice(0, 2).map((badge, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 bg-sf-gold/20 text-sf-gold rounded-full"
                        >
                          {badge}
                        </span>
                      ))}
                      {leader.badges.length > 2 && (
                        <span className="text-[10px] px-2 py-0.5 bg-sf-brown/30 text-sf-text-muted rounded-full">
                          +{leader.badges.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Score */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-2xl font-bold text-sf-gold">{leader.score}</div>
                  <div className="text-xs text-sf-text-muted">points</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* My Rank (if not in top leaders) */}
      {user && !leaders.slice(0, limit).some((l) => l.userId === user.id) && (
        <div className="mt-4 pt-4 border-t border-sf-gold/20">
          <div className="glass-panel p-4 rounded-lg bg-sf-gold/10 border border-sf-gold">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-sf-text-primary">Your Rank</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-sf-text-muted">#{12}</span>
                <TrendingUp className="w-4 h-4 text-sf-success" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
