import { useState, useEffect } from 'react';
import { TrendingUp, Zap, Target, DollarSign, TrendingDown, Calendar, Sparkles, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ForecastData {
  month: string;
  actual: number;
  forecast: number;
  confidence: number;
}

export default function SalesForecast() {
  const [timeRange, setTimeRange] = useState<'3months' | '6months' | '12months'>('6months');
  const [forecast, setForecast] = useState<ForecastData[]>([]);

  useEffect(() => {
    // Generate forecast data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();

    const data: ForecastData[] = [];
    const baseRevenue = 50000;
    const growthRate = 1.08; // 8% monthly growth

    for (let i = 0; i < (timeRange === '3months' ? 3 : timeRange === '6months' ? 6 : 12); i++) {
      const monthIndex = (currentMonth + i + 1) % 12;
      const isActual = i < 2; // Past 2 months have actual data

      const actual = isActual ? baseRevenue * Math.pow(growthRate, i) * (0.95 + Math.random() * 0.1) : 0;
      const forecastValue = baseRevenue * Math.pow(growthRate, i);
      const confidence = Math.max(60, 95 - (i * 5)); // Confidence decreases further out

      data.push({
        month: months[monthIndex],
        actual: Math.round(actual),
        forecast: Math.round(forecastValue),
        confidence: confidence,
      });
    }

    setForecast(data);
  }, [timeRange]);

  const totalForecast = forecast.reduce((sum, d) => sum + d.forecast, 0);
  const avgConfidence = forecast.reduce((sum, d) => sum + d.confidence, 0) / forecast.length;
  const projectedGrowth = forecast.length > 1
    ? ((forecast[forecast.length - 1].forecast - forecast[0].forecast) / forecast[0].forecast * 100)
    : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="glass-card p-6 animate-sf-scale-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl">
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-sf-text-primary">AI Sales Forecast</h2>
            <p className="text-sm text-sf-text-muted">Powered by Machine Learning</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sf-gold animate-sf-glow-pulse" />
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-6">
        {(['3months', '6months', '12months'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              timeRange === range
                ? 'bg-sf-gold text-sf-black'
                : 'bg-sf-brown/30 text-sf-text-secondary hover:bg-sf-brown/50'
            }`}
          >
            {range === '3months' ? '3 Months' : range === '6months' ? '6 Months' : '12 Months'}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="glass-panel p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-xs text-sf-text-muted">Projected Revenue</span>
          </div>
          <p className="text-2xl font-bold text-sf-text-primary">{formatCurrency(totalForecast)}</p>
          <p className="text-xs text-green-400 mt-1">Next {timeRange.replace('months', ' months')}</p>
        </div>

        <div className="glass-panel p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-sf-gold" />
            <span className="text-xs text-sf-text-muted">Growth Rate</span>
          </div>
          <p className="text-2xl font-bold text-sf-text-primary">+{projectedGrowth.toFixed(1)}%</p>
          <p className="text-xs text-sf-gold mt-1">Period over period</p>
        </div>

        <div className="glass-panel p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-sf-text-muted">Confidence</span>
          </div>
          <p className="text-2xl font-bold text-sf-text-primary">{avgConfidence.toFixed(0)}%</p>
          <p className="text-xs text-purple-400 mt-1">Forecast accuracy</p>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="glass-panel p-4 rounded-lg mb-6">
        <h3 className="text-sm font-semibold text-sf-text-primary mb-4">Revenue Forecast</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={forecast}>
            <defs>
              <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="forecast"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#forecastGradient)"
              name="Forecast"
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#FFD700"
              strokeWidth={3}
              fill="url(#actualGradient)"
              name="Actual"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* AI Insights */}
      <div className="glass-panel p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-sf-text-primary mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sf-gold" />
          AI Insights
        </h3>
        <div className="space-y-2">
          <div className="flex items-start gap-3 p-3 bg-sf-black/30 rounded-lg">
            <div className="p-1.5 bg-green-500/20 rounded-lg mt-0.5">
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-sf-text-primary">Strong Growth Trajectory</p>
              <p className="text-xs text-sf-text-muted mt-1">
                Your pipeline shows {projectedGrowth.toFixed(0)}% growth potential. Continue current momentum.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-sf-black/30 rounded-lg">
            <div className="p-1.5 bg-purple-500/20 rounded-lg mt-0.5">
              <Target className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-sf-text-primary">High Forecast Confidence</p>
              <p className="text-xs text-sf-text-muted mt-1">
                {avgConfidence.toFixed(0)}% confidence score based on historical data and current pipeline health.
              </p>
            </div>
          </div>

          {projectedGrowth < 5 && (
            <div className="flex items-start gap-3 p-3 bg-sf-black/30 rounded-lg">
              <div className="p-1.5 bg-orange-500/20 rounded-lg mt-0.5">
                <AlertCircle className="w-4 h-4 text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-sf-text-primary">Growth Opportunity</p>
                <p className="text-xs text-sf-text-muted mt-1">
                  Consider increasing lead generation activities to accelerate growth.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
