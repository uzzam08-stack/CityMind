import { Zap, CheckCircle2 } from 'lucide-react';
import type { Alert } from '../api/client';

interface AlertsTableProps {
  alerts: Alert[];
  onDispatch: (alertId: string) => void;
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    critical: 'bg-red-100 text-red-700 ring-red-200',
    warning: 'bg-amber-100 text-amber-700 ring-amber-200',
    info: 'bg-blue-100 text-blue-700 ring-blue-200',
  };
  const cls = styles[severity.toLowerCase()] ?? styles.info;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${cls}`}>
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: 'bg-red-50 text-red-700 ring-red-200',
    acknowledged: 'bg-amber-50 text-amber-700 ring-amber-200',
    resolved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    dispatched: 'bg-blue-50 text-blue-700 ring-blue-200',
  };
  const cls = styles[status.toLowerCase()] ?? 'bg-slate-100 text-slate-600 ring-slate-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${cls}`}>
      {status}
    </span>
  );
}

function FillBar({ fill }: { fill: number }) {
  const color =
    fill > 80 ? 'bg-status-red' : fill >= 50 ? 'bg-status-amber' : 'bg-status-green';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(fill, 100)}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-10 text-right">{fill}%</span>
    </div>
  );
}

export default function AlertsTable({ alerts, onDispatch }: AlertsTableProps) {
  if (alerts.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="text-lg font-medium">No alerts found</p>
        <p className="text-sm mt-1">Adjust your filters or check back later</p>
      </div>
    );
  }

  return (
    <div id="alerts-table" className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Ward</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Bin ID</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Fill Level</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Time Detected</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Severity</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Status</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Action</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert, idx) => (
            <tr
              key={alert.alert_id}
              id={`alert-row-${alert.alert_id}`}
              className={`border-b border-slate-100 transition-colors hover:bg-blue-50/40 ${
                idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
              }`}
            >
              <td className="px-4 py-3 font-medium text-slate-900">{alert.ward}</td>
              <td className="px-4 py-3 text-slate-700 font-mono text-xs">{alert.bin_id}</td>
              <td className="px-4 py-3">
                <FillBar fill={alert.fill_level} />
              </td>
              <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                {formatTimeAgo(alert.detected_at)}
              </td>
              <td className="px-4 py-3">
                <SeverityBadge severity={alert.severity} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={alert.status} />
              </td>
              <td className="px-4 py-3">
                {alert.status.toLowerCase() === 'open' ? (
                  <button
                    id={`dispatch-btn-${alert.alert_id}`}
                    onClick={() => onDispatch(alert.alert_id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pcmc-blue text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Auto-Dispatch
                  </button>
                ) : alert.status.toLowerCase() === 'resolved' ? (
                  <span className="inline-flex items-center gap-1 text-status-green text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    Resolved
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 italic">
                    {alert.dispatched_truck_id ? `Truck: ${alert.dispatched_truck_id}` : 'Pending'}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
