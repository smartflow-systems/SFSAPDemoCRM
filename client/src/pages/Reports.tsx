/**
 * Advanced Reporting Dashboard
 * Analytics and insights with interactive charts
 */

import { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Calendar, TrendingUp, DollarSign, Users, Target, Download, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';

// Sample data - in production, this would come from API
const salesData = [
  { month: 'Jan', revenue: 45000, deals: 12, leads: 145 },
  { month: 'Feb', revenue: 52000, deals: 15, leads: 168 },
  { month: 'Mar', revenue: 48000, deals: 13, leads: 152 },
  { month: 'Apr', revenue: 61000, deals: 18, leads: 189 },
  { month: 'May', revenue: 55000, deals: 16, leads: 172 },
  { month: 'Jun', revenue: 67000, deals: 20, leads: 198 },
];

const pipelineData = [
  { stage: 'New', value: 25, count: 42 },
  { stage: 'Qualified', value: 20, count: 35 },
  { stage: 'Proposal', value: 15, count: 28 },
  { stage: 'Negotiation', value: 30, count: 18 },
  { stage: 'Won', value: 10, count: 12 },
];

const sourceData = [
  { name: 'Website', value: 35 },
  { name: 'Referral', value: 25 },
  { name: 'Cold Call', value: 15 },
  { name: 'Social Media', value: 20 },
  { name: 'Email Campaign', value: 5 },
];

const performanceData = [
  { name: 'Sarah Johnson', deals: 28, revenue: 156000, conversion: 65 },
  { name: 'Mike Chen', deals: 24, revenue: 142000, conversion: 58 },
  { name: 'Emily Davis', deals: 31, revenue: 178000, conversion: 72 },
  { name: 'James Wilson', deals: 19, revenue: 98000, conversion: 51 },
  { name: 'Lisa Anderson', deals: 26, revenue: 134000, conversion: 62 },
];

const COLORS = ['#FFD700', '#E6C200', '#CCA000', '#B38800', '#997000'];

export default function Reports() {
  const [timeRange, setTimeRange] = useState('6m');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const metrics = [
    {
      title: 'Total Revenue',
      value: '$328,000',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-500'
    },
    {
      title: 'Active Deals',
      value: '94',
      change: '+8.2%',
      trend: 'up',
      icon: Target,
      color: 'text-blue-500'
    },
    {
      title: 'Conversion Rate',
      value: '62%',
      change: '+3.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-purple-500'
    },
    {
      title: 'New Leads',
      value: '1,024',
      change: '+18.7%',
      trend: 'up',
      icon: Users,
      color: 'text-orange-500'
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--sfs-text-highlight)]">
            Reports & Analytics
          </h1>
          <p className="text-[var(--sfs-text)] mt-1">
            Track performance and gain insights into your sales pipeline
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-[var(--sfs-glass-bg)] border-[var(--sfs-border)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[var(--sfs-panel-bg)] border-[var(--sfs-border)]">
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-[var(--sfs-gold)] text-[var(--sfs-black)] hover:bg-[var(--sfs-gold-hover)]">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card
              key={metric.title}
              className="bg-[var(--sfs-glass-bg)] backdrop-blur-[var(--sfs-glass-blur)] border-[var(--sfs-glass-border)] hover:bg-[var(--sfs-glass-bg-hover)] transition-all"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`h-8 w-8 ${metric.color}`} />
                  <Badge
                    variant="secondary"
                    className="bg-green-500/10 text-green-500 border-green-500/20"
                  >
                    {metric.change}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-[var(--sfs-text)] mb-1">{metric.title}</p>
                  <p className="text-2xl font-bold text-[var(--sfs-text-highlight)]">
                    {metric.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="bg-[var(--sfs-glass-bg)] border border-[var(--sfs-border)]">
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline Analysis</TabsTrigger>
          <TabsTrigger value="sources">Lead Sources</TabsTrigger>
          <TabsTrigger value="performance">Team Performance</TabsTrigger>
        </TabsList>

        {/* Revenue Trends */}
        <TabsContent value="revenue" className="space-y-4">
          <Card className="bg-[var(--sfs-glass-bg)] backdrop-blur-[var(--sfs-glass-blur)] border-[var(--sfs-glass-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--sfs-text-highlight)]">Revenue & Deals Over Time</CardTitle>
              <CardDescription className="text-[var(--sfs-text)]">
                Monthly revenue and deal closure trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3B2F2F" />
                  <XAxis dataKey="month" stroke="#F5F5DC" />
                  <YAxis stroke="#F5F5DC" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(13, 13, 13, 0.9)',
                      border: '1px solid #FFD700',
                      borderRadius: '8px',
                      color: '#F5F5DC'
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#FFD700"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenue ($)"
                  />
                  <Line
                    type="monotone"
                    dataKey="deals"
                    stroke="#E6C200"
                    strokeWidth={2}
                    name="Deals Closed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-[var(--sfs-glass-bg)] backdrop-blur-[var(--sfs-glass-blur)] border-[var(--sfs-glass-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--sfs-text-highlight)]">Lead Generation</CardTitle>
              <CardDescription className="text-[var(--sfs-text)]">
                New leads acquired per month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3B2F2F" />
                  <XAxis dataKey="month" stroke="#F5F5DC" />
                  <YAxis stroke="#F5F5DC" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(13, 13, 13, 0.9)',
                      border: '1px solid #FFD700',
                      borderRadius: '8px',
                      color: '#F5F5DC'
                    }}
                  />
                  <Bar dataKey="leads" fill="#FFD700" name="New Leads" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pipeline Analysis */}
        <TabsContent value="pipeline" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-[var(--sfs-glass-bg)] backdrop-blur-[var(--sfs-glass-blur)] border-[var(--sfs-glass-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--sfs-text-highlight)]">Pipeline by Stage</CardTitle>
                <CardDescription className="text-[var(--sfs-text)]">
                  Distribution of opportunities across stages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={pipelineData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pipelineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(13, 13, 13, 0.9)',
                        border: '1px solid #FFD700',
                        borderRadius: '8px',
                        color: '#F5F5DC'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-[var(--sfs-glass-bg)] backdrop-blur-[var(--sfs-glass-blur)] border-[var(--sfs-glass-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--sfs-text-highlight)]">Stage Details</CardTitle>
                <CardDescription className="text-[var(--sfs-text)]">
                  Opportunity count by stage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pipelineData.map((stage, index) => (
                    <div key={stage.stage} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-[var(--sfs-text)]">{stage.stage}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          variant="outline"
                          className="border-[var(--sfs-gold)] text-[var(--sfs-gold)]"
                        >
                          {stage.count} deals
                        </Badge>
                        <span className="text-[var(--sfs-text-highlight)] font-semibold min-w-[60px] text-right">
                          {stage.value}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lead Sources */}
        <TabsContent value="sources">
          <Card className="bg-[var(--sfs-glass-bg)] backdrop-blur-[var(--sfs-glass-blur)] border-[var(--sfs-glass-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--sfs-text-highlight)]">Lead Source Distribution</CardTitle>
              <CardDescription className="text-[var(--sfs-text)]">
                Where your leads are coming from
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(13, 13, 13, 0.9)',
                        border: '1px solid #FFD700',
                        borderRadius: '8px',
                        color: '#F5F5DC'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--sfs-text-highlight)] mb-4">
                    Source Breakdown
                  </h3>
                  {sourceData.map((source, index) => (
                    <div key={source.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-[var(--sfs-text)]">{source.name}</span>
                        </div>
                        <span className="text-[var(--sfs-text-highlight)] font-semibold">
                          {source.value}%
                        </span>
                      </div>
                      <div className="w-full bg-[var(--sfs-brown)] rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${source.value}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Performance */}
        <TabsContent value="performance">
          <Card className="bg-[var(--sfs-glass-bg)] backdrop-blur-[var(--sfs-glass-blur)] border-[var(--sfs-glass-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--sfs-text-highlight)]">Team Performance</CardTitle>
              <CardDescription className="text-[var(--sfs-text)]">
                Individual sales representative metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={performanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#3B2F2F" />
                  <XAxis type="number" stroke="#F5F5DC" />
                  <YAxis dataKey="name" type="category" stroke="#F5F5DC" width={120} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(13, 13, 13, 0.9)',
                      border: '1px solid #FFD700',
                      borderRadius: '8px',
                      color: '#F5F5DC'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="deals" fill="#FFD700" name="Deals Closed" />
                  <Bar dataKey="conversion" fill="#E6C200" name="Conversion Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
