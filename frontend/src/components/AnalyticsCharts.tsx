import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import type { AnalyticsData } from '../api/client';

const darkTooltipStyle = {
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.1)',
  backgroundColor: 'rgba(15,23,42,0.95)',
  color: '#E2E8F0',
  fontSize: 12,
};

interface Props {
  data: AnalyticsData;
}

export default function AnalyticsCharts({ data }: Props) {
  // Aggregate daily waste
  const dailyTotal = data.daily_waste.reduce((acc, curr) => {
    const existing = acc.find((item) => item.date === curr.date);
    if (existing) {
      existing.tonnes += curr.tonnes;
    } else {
      acc.push({ date: curr.date, tonnes: curr.tonnes });
    }
    return acc;
  }, [] as Array<{ date: string; tonnes: number }>);

  const sortedDaily = dailyTotal.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Route Efficiency Trend */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-6">
        <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">
          Daily C&D Waste Collection (Tonnes)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sortedDaily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fill: '#64748B' }} 
                stroke="#334155" 
                tickFormatter={(val) => {
                  const d = new Date(val);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
                dy={10} 
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748B' }} 
                stroke="#334155" 
                tickFormatter={(val) => `${val}T`} 
              />
              <Tooltip contentStyle={darkTooltipStyle} />
              <Area
                type="monotone"
                dataKey="tonnes"
                name="Tonnes Collected"
                stroke="#3B82F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorWaste)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Truck Utilization */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-6">
        <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">
          Fleet Status Breakdown
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.truck_utilization} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#334155" dy={10} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#334155" allowDecimals={false} />
              <Tooltip contentStyle={darkTooltipStyle} />
              <Bar 
                dataKey="count" 
                name="Vehicles" 
                fill="#10B981" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
