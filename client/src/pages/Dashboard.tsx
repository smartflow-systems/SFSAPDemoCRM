import { useMemo } from 'react';
import Page from '@/components/layout/Page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCRM } from '@/contexts/CRMContext';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Target, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const { useLeads, useOpportunities, useActivities } = useCRM();
  const { data: leads = [] } = useLeads();
  const { data: opportunities = [] } = useOpportunities();
  const { data: activities = [] } = useActivities();

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalRevenue = opportunities
      .filter(opp => opp.stage === 'Won')
      .reduce((sum, opp) => sum + opp.value, 0);

    const activeDeals = opportunities.filter(
      opp => !['Won', 'Lost'].includes(opp.stage)
    ).length;

    const pipelineValue = opportunities
      .filter(opp => !['Won', 'Lost'].includes(opp.stage))
      .reduce((sum, opp) => sum + opp.value, 0);

    const totalLeads = leads.length;
    const convertedLeads = leads.filter(lead => lead.status === 'Converted').length;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    const thisMonthRevenue = opportunities
      .filter(opp => {
        if (opp.stage !== 'Won' || !opp.closedAt) return false;
        const closedDate = new Date(opp.closedAt);
        const now = new Date();
        return closedDate.getMonth() === now.getMonth() && closedDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, opp) => sum + opp.value, 0);

    const lastMonthRevenue = opportunities
      .filter(opp => {
        if (opp.stage !== 'Won' || !opp.closedAt) return false;
        const closedDate = new Date(opp.closedAt);
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return closedDate.getMonth() === lastMonth.getMonth() && closedDate.getFullYear() === lastMonth.getFullYear();
      })
      .reduce((sum, opp) => sum + opp.value, 0);

    const revenueChange = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

    return {
      totalRevenue,
      activeDeals,
      pipelineValue,
      conversionRate,
      totalLeads,
      revenueChange
    };
  }, [leads, opportunities]);

  // Lead source distribution
  const leadSourceData = useMemo(() => {
    const sources = leads.reduce((acc, lead) => {
      const source = lead.source || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(sources).map(([name, value]) => ({ name, value }));
  }, [leads]);

  // Pipeline stage distribution
  const pipelineData = useMemo(() => {
    const stages = opportunities.reduce((acc, opp) => {
      acc[opp.stage] = (acc[opp.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stages).map(([name, value]) => ({ name, value }));
  }, [opportunities]);

  // Recent activities
  const recentActivities = useMemo(() => {
    return [...activities]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [activities]);

  // Revenue trend (last 6 months)
  const revenueTrend = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthRevenue = opportunities
        .filter(opp => {
          if (opp.stage !== 'Won' || !opp.closedAt) return false;
          const closedDate = new Date(opp.closedAt);
          return closedDate.getMonth() === date.getMonth() && closedDate.getFullYear() === date.getFullYear();
        })
        .reduce((sum, opp) => sum + opp.value, 0);

      data.push({
        month: monthNames[date.getMonth()],
        revenue: monthRevenue
      });
    }

    return data;
  }, [opportunities]);

  const COLORS = ['#FFD700', '#C5A028', '#B69121', '#A7821A', '#997313'];

  return (
    <Page title="Dashboard">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="panel-dark border-gold-800/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gold-300">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold-shine">
              ${kpis.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-gold-300 flex items-center mt-1">
              {kpis.revenueChange >= 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 mr-1 text-green-400" />
                  <span className="text-green-400">+{kpis.revenueChange.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 mr-1 text-red-400" />
                  <span className="text-red-400">{kpis.revenueChange.toFixed(1)}%</span>
                </>
              )}
              <span className="ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>

        <Card className="panel-dark border-gold-800/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gold-300">Pipeline Value</CardTitle>
            <Target className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold-shine">
              ${kpis.pipelineValue.toLocaleString()}
            </div>
            <p className="text-xs text-gold-300 mt-1">
              {kpis.activeDeals} active deals
            </p>
          </CardContent>
        </Card>

        <Card className="panel-dark border-gold-800/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gold-300">Conversion Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold-shine">
              {kpis.conversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gold-300 mt-1">
              {kpis.totalLeads} total leads
            </p>
          </CardContent>
        </Card>

        <Card className="panel-dark border-gold-800/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gold-300">Active Deals</CardTitle>
            <Users className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold-shine">
              {kpis.activeDeals}
            </div>
            <p className="text-xs text-gold-300 mt-1">
              In pipeline
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend */}
        <Card className="panel-dark border-gold-800/30">
          <CardHeader>
            <CardTitle className="text-gold-shine">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#3e2a1f" />
                <XAxis dataKey="month" stroke="#C5A028" />
                <YAxis stroke="#C5A028" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#2a1810', border: '1px solid #FFD700' }}
                  labelStyle={{ color: '#FFD700' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#FFD700" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pipeline Distribution */}
        <Card className="panel-dark border-gold-800/30">
          <CardHeader>
            <CardTitle className="text-gold-shine">Pipeline Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pipelineData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#2a1810', border: '1px solid #FFD700' }}
                  labelStyle={{ color: '#FFD700' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Sources */}
        <Card className="panel-dark border-gold-800/30">
          <CardHeader>
            <CardTitle className="text-gold-shine">Lead Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={leadSourceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3e2a1f" />
                <XAxis dataKey="name" stroke="#C5A028" />
                <YAxis stroke="#C5A028" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#2a1810', border: '1px solid #FFD700' }}
                  labelStyle={{ color: '#FFD700' }}
                />
                <Bar dataKey="value" fill="#FFD700" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="panel-dark border-gold-800/30">
          <CardHeader>
            <CardTitle className="text-gold-shine">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <p className="text-gold-300 text-sm text-center py-4">No recent activities</p>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b border-gold-800/30 last:border-0">
                    <div className="flex-shrink-0 mt-1">
                      {activity.type === 'call' && <Clock className="h-4 w-4 text-gold" />}
                      {activity.type === 'email' && <AlertCircle className="h-4 w-4 text-gold" />}
                      {activity.type === 'meeting' && <Users className="h-4 w-4 text-gold" />}
                      {activity.type === 'task' && <CheckCircle2 className="h-4 w-4 text-gold" />}
                      {activity.type === 'note' && <AlertCircle className="h-4 w-4 text-gold" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gold-shine capitalize">
                        {activity.type}
                      </p>
                      <p className="text-sm text-gold-300 truncate">
                        {activity.subject || activity.description || 'No subject'}
                      </p>
                      <p className="text-xs text-gold-300/60">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
