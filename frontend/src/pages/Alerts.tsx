import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import AlertsTable from '../components/AlertsTable';
import DispatchModal from '../components/DispatchModal';
import { useAlerts, useDispatchAlert } from '../hooks/useAlerts';
import type { DispatchResponse } from '../api/client';

const WARD_OPTIONS = ['All', 'Ward A', 'Ward B', 'Ward C', 'Ward D', 'Ward E'];
const SEVERITY_OPTIONS = ['All', 'Critical', 'Warning', 'Info'];
const STATUS_OPTIONS = ['All', 'Open', 'Acknowledged', 'Dispatched', 'Resolved'];

export default function Alerts() {
  const [wardFilter, setWardFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [modalOpen, setModalOpen] = useState(false);
  const [dispatchData, setDispatchData] = useState<DispatchResponse | null>(null);

  const params = {
    ward: wardFilter === 'All' ? undefined : wardFilter,
    severity: severityFilter === 'All' ? undefined : severityFilter.toLowerCase(),
    status: statusFilter === 'All' ? undefined : statusFilter.toLowerCase(),
  };

  const { data: alerts, isLoading } = useAlerts(params);
  const dispatchMutation = useDispatchAlert();

  const handleDispatch = async (alertId: string) => {
    try {
      const result = await dispatchMutation.mutateAsync(alertId);
      setDispatchData(result);
      setModalOpen(true);
    } catch {
      // Error handled by react-query
    }
  };

  const clearFilters = () => {
    setWardFilter('All');
    setSeverityFilter('All');
    setStatusFilter('All');
  };

  const hasFilters = wardFilter !== 'All' || severityFilter !== 'All' || statusFilter !== 'All';
  const alertCount = alerts?.length ?? 0;

  return (
    <div id="alerts-page" className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Anomaly Alerts</h1>
          <span
            id="alert-count-badge"
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700"
          >
            {alertCount}
          </span>
        </div>
        {hasFilters && (
          <button
            id="clear-filters-btn"
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear Filters
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-600">Filters</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <div>
            <label htmlFor="ward-filter" className="block text-xs font-medium text-slate-500 mb-1">
              Ward
            </label>
            <select
              id="ward-filter"
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pcmc-blue/20 focus:border-pcmc-blue min-w-[140px]"
            >
              {WARD_OPTIONS.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="severity-filter" className="block text-xs font-medium text-slate-500 mb-1">
              Severity
            </label>
            <select
              id="severity-filter"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pcmc-blue/20 focus:border-pcmc-blue min-w-[140px]"
            >
              {SEVERITY_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status-filter" className="block text-xs font-medium text-slate-500 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pcmc-blue/20 focus:border-pcmc-blue min-w-[140px]"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-pcmc-blue/30 border-t-pcmc-blue rounded-full animate-spin" />
            <span className="text-sm text-slate-500">Loading alerts…</span>
          </div>
        </div>
      ) : (
        <AlertsTable alerts={alerts || []} onDispatch={handleDispatch} />
      )}

      {/* Dispatch loading indicator */}
      {dispatchMutation.isPending && !modalOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-pcmc-blue text-white rounded-xl shadow-lg animate-slide-up">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span className="text-sm font-medium">Dispatching…</span>
        </div>
      )}

      {/* Dispatch Modal */}
      <DispatchModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        steps={dispatchData?.steps ?? []}
        truckId={dispatchData?.truck_id ?? ''}
        estimatedArrival={dispatchData?.estimated_arrival ?? ''}
        alertStatus={dispatchData?.status ?? ''}
      />
    </div>
  );
}
