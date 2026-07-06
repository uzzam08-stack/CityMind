import { LayoutDashboard, Truck, MapPin, AlertTriangle } from 'lucide-react';
import KPICard from '../components/KPICard';
import AnalyticsCharts from '../components/AnalyticsCharts';
import { useKPIs } from '../hooks/useKPIs';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export default function Dashboard() {
  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useKPIs();
  
  const { data: analyticsData } = useQuery({
    queryKey: ['analytics', '7d'],
    queryFn: () => api.getAnalytics('7d'),
  });

  if (kpisLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-2 text-blue-400">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          <span className="ml-2 text-sm font-medium">Loading C&D metrics...</span>
        </div>
      </div>
    );
  }

  if (kpisError || !kpis) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-medium">
        Failed to load dashboard data. Ensure backend is running.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            City Operations Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time insights for PCMC Construction & Demolition waste infrastructure.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot" />
          <span className="text-xs font-semibold text-emerald-400">System Live</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total C&D Sites"
          value={kpis.total_bins}
          icon={LayoutDashboard}
          color="blue"
        />
        <KPICard
          title="Active RFID Transports"
          value={kpis.active_trucks}
          subtitle="All fleets operational"
          icon={Truck}
          color="green"
        />
        <KPICard
          title="Critical Fill Level Sites"
          value={kpis.bins_requiring_collection}
          subtitle={`${Math.round(
            (kpis.bins_requiring_collection / (kpis.total_bins || 1)) * 100
          )}% of total`}
          icon={AlertTriangle}
          color="red"
          trend="up"
        />
        <KPICard
          title="Avg Depot Utilization"
          value="76%"
          subtitle="Trending optimal"
          icon={MapPin}
          color="amber"
          trend="down"
        />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {analyticsData ? (
             <AnalyticsCharts data={analyticsData} />
          ) : (
            <div className="flex h-64 items-center justify-center text-slate-500">Loading charts...</div>
          )}
        </div>
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-6 h-[400px]">
          <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
            Critical Alerts
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">Nigdi Transfer Station Overflow</p>
                <p className="text-xs text-red-300/80 mt-1">Utilization at 94%. Route diversion recommended.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">Vision Alert: Suspected Illegal Dump</p>
                <p className="text-xs text-amber-300/80 mt-1">Drone ID-14 detected anomalies near Wakad Highway.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
