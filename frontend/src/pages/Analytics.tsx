import { useState } from 'react';
import { BarChart3, Download, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import AnalyticsCharts from '../components/AnalyticsCharts';
import { api } from '../api/client';
import type { AnalyticsData } from '../api/client';

const DATE_RANGES = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '14d', label: 'Last 14 Days' },
  { value: '30d', label: 'Last 30 Days' },
];

function getScoreColor(score: number): string {
  if (score >= 75) return 'text-status-green';
  if (score >= 50) return 'text-status-amber';
  return 'text-status-red';
}

function getScoreBg(score: number): string {
  if (score >= 75) return 'bg-emerald-50';
  if (score >= 50) return 'bg-amber-50';
  return 'bg-red-50';
}

function exportCsv(data: AnalyticsData['ward_performance']) {
  const headers = ['Ward', 'Bins', 'Avg Fill %', 'Collection Rate', 'Open Grievances', 'Score'];
  const rows = data.map((w) =>
    [w.ward, w.bins, w.avg_fill_pct, w.collection_rate, w.open_grievances, w.score].join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ward_performance_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function Analytics() {
  const [dateRange, setDateRange] = useState('7d');

  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['analytics', dateRange],
    queryFn: () => api.getAnalytics(dateRange),
  });

  return (
    <div id="analytics-page" className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-pcmc-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Analytics & Reports</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Comprehensive city operations insights
            </p>
          </div>
        </div>

        {/* Date range picker */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              id="date-range-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-sm bg-transparent border-none focus:outline-none text-slate-700 font-medium cursor-pointer"
            >
              {DATE_RANGES.map((dr) => (
                <option key={dr.value} value={dr.value}>
                  {dr.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-pcmc-blue/30 border-t-pcmc-blue rounded-full animate-spin" />
            <span className="text-sm text-slate-500">Loading analytics…</span>
          </div>
        </div>
      ) : data ? (
        <>
          {/* Charts */}
          <AnalyticsCharts data={data} />

          {/* Ward Performance Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700">Ward Performance</h3>
              <button
                id="export-csv-btn"
                onClick={() => exportCsv(data.ward_performance)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-pcmc-blue bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-6 py-3 font-semibold text-slate-600">Ward</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-600">Bins</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-600">Avg Fill %</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-600">Collection Rate</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-600">Open Grievances</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-600">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {data.ward_performance.map((ward, idx) => (
                    <tr
                      key={ward.ward}
                      id={`ward-perf-${ward.ward.toLowerCase().replace(/\s+/g, '-')}`}
                      className={`border-b border-slate-100 hover:bg-blue-50/30 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      }`}
                    >
                      <td className="px-6 py-3 font-semibold text-slate-900">{ward.ward}</td>
                      <td className="px-6 py-3 text-slate-700">{ward.bins}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                ward.avg_fill_pct > 80
                                  ? 'bg-status-red'
                                  : ward.avg_fill_pct >= 50
                                  ? 'bg-status-amber'
                                  : 'bg-status-green'
                              }`}
                              style={{ width: `${Math.min(ward.avg_fill_pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-slate-700 font-medium">
                            {ward.avg_fill_pct.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-slate-700">
                        {(ward.collection_rate * 100).toFixed(0)}%
                      </td>
                      <td className="px-6 py-3 text-slate-700">{ward.open_grievances}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getScoreColor(
                            ward.score
                          )} ${getScoreBg(ward.score)}`}
                        >
                          {ward.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-16 text-slate-400">
          <p>No analytics data available</p>
        </div>
      )}
    </div>
  );
}
