import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import GitHubSidebar from "../components/Dashboard/GitHubSidebar";
import Leaderboard from "../components/Gamification/Leaderboard";
import ActivityFeed from "../components/Collaboration/ActivityFeed";
import { useCRM, useLeads, useOpportunities } from "@/contexts/CRMContext";
import { TrendingUp, Users, Briefcase, Target, DollarSign, Zap, Sparkles } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useCRM();
  const { data: leads = [] } = useLeads();
  const { data: opportunities = [] } = useOpportunities();

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  // Calculate stats
  const totalLeads = leads.length;
  const hotLeads = leads.filter(l => l.rating === 'Hot').length;
  const totalOpportunities = opportunities.length;
  const totalRevenue = opportunities
    .filter(o => o.stage === 'Won')
    .reduce((sum, o) => sum + (o.value || 0), 0);

  // Revenue trend data
  const revenueTrendData = [
    { month: 'Jan', revenue: 45000, deals: 5 },
    { month: 'Feb', revenue: 52000, deals: 6 },
    { month: 'Mar', revenue: 61000, deals: 8 },
    { month: 'Apr', revenue: 58000, deals: 7 },
    { month: 'May', revenue: 72000, deals: 9 },
    { month: 'Jun', revenue: 85000, deals: 11 },
  ];

  // Pipeline distribution
  const pipelineData = [
    { name: 'New', value: opportunities.filter(o => o.stage === 'New').length, color: '#3B82F6' },
    { name: 'Qualified', value: opportunities.filter(o => o.stage === 'Qualified').length, color: '#8B5CF6' },
    { name: 'Proposal', value: opportunities.filter(o => o.stage === 'Proposal').length, color: '#F59E0B' },
    { name: 'Won', value: opportunities.filter(o => o.stage === 'Won').length, color: '#10B981' },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-sf-black">
      {/* GitHub-style Sidebar */}
      <GitHubSidebar />

      {/* Main Content */}
      <main className="pt-20 px-4 md:px-6 lg:px-8 pb-8">
        <div className="max-w-[1600px] mx-auto">
          {/* Welcome Header */}
          <div className="mb-8 animate-sf-slide-down">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-8 h-8 text-sf-gold animate-sf-glow-pulse" />
              <h1 className="text-4xl font-bold text-sf-gold-gradient">
                Welcome back, {user?.fullName}!
              </h1>
            </div>
            <p className="text-lg text-sf-text-secondary">
              Here's what's happening with your sales today
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Revenue */}
            <div className="glass-card p-6 hover:scale-105 transition-transform cursor-pointer animate-sf-scale-in">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-sf-success" />
              </div>
              <h3 className="text-sm font-medium text-sf-text-secondary mb-1">Total Revenue</h3>
              <p className="text-3xl font-bold text-sf-text-primary">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-sf-success mt-2">+12% from last month</p>
            </div>

            {/* Active Leads */}
            <div className="glass-card p-6 hover:scale-105 transition-transform cursor-pointer animate-sf-scale-in" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <Zap className="w-5 h-5 text-sf-gold" />
              </div>
              <h3 className="text-sm font-medium text-sf-text-secondary mb-1">Active Leads</h3>
              <p className="text-3xl font-bold text-sf-text-primary">{totalLeads}</p>
              <p className="text-xs text-sf-gold mt-2">{hotLeads} hot leads 🔥</p>
            </div>

            {/* Opportunities */}
            <div className="glass-card p-6 hover:scale-105 transition-transform cursor-pointer animate-sf-scale-in" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl">
                  <Briefcase className="w-6 h-6 text-purple-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-sm font-medium text-sf-text-secondary mb-1">Open Deals</h3>
              <p className="text-3xl font-bold text-sf-text-primary">{totalOpportunities}</p>
              <p className="text-xs text-purple-400 mt-2">In pipeline</p>
            </div>

            {/* Win Rate */}
            <div className="glass-card p-6 hover:scale-105 transition-transform cursor-pointer animate-sf-scale-in" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-sf-gold/20 to-sf-gold-hover/10 rounded-xl">
                  <Target className="w-6 h-6 text-sf-gold" />
                </div>
                <Sparkles className="w-5 h-5 text-sf-gold" />
              </div>
              <h3 className="text-sm font-medium text-sf-text-secondary mb-1">Win Rate</h3>
              <p className="text-3xl font-bold text-sf-text-primary">68%</p>
              <p className="text-xs text-sf-gold mt-2">Above average</p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Charts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Revenue Trend */}
              <div className="glass-card p-6 animate-sf-scale-in">
                <h2 className="text-xl font-bold text-sf-text-primary mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-sf-gold" />
                  Revenue Trend
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 215, 0, 0.1)" />
                    <XAxis dataKey="month" stroke="#A89968" />
                    <YAxis stroke="#A89968" tickFormatter={(value) => `$${value / 1000}k`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(13, 13, 13, 0.9)',
                        border: '1px solid rgba(255, 215, 0, 0.3)',
                        borderRadius: '8px',
                        color: '#F5F5DC',
                      }}
                      formatter={(value: any) => formatCurrency(value)}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#FFD700"
                      strokeWidth={3}
                      dot={{ fill: '#FFD700', r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Pipeline Distribution */}
              <div className="glass-card p-6 animate-sf-scale-in">
                <h2 className="text-xl font-bold text-sf-text-primary mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-sf-gold" />
                  Pipeline Distribution
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pipelineData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pipelineData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(13, 13, 13, 0.9)',
                          border: '1px solid rgba(255, 215, 0, 0.3)',
                          borderRadius: '8px',
                          color: '#F5F5DC',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col justify-center space-y-3">
                    {pipelineData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-sf-text-secondary">{item.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-sf-text-primary">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Leaderboard */}
              <Leaderboard limit={5} />
            </div>

            {/* Right Column - Activity Feed */}
            <div className="lg:col-span-1">
              <ActivityFeed limit={15} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
