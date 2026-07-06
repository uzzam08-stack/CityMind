import { useState } from 'react';
import { Route as RouteIcon, Loader2, ArrowRight, TrendingDown, MapPin } from 'lucide-react';
import RouteMap from '../components/RouteMap';
import { api } from '../api/client';
import type { RouteOptimizationResponse } from '../api/client';

const WARDS = ['Ward A', 'Ward B', 'Ward C', 'Ward D', 'Ward E'];

export default function Routes() {
  const [ward, setWard] = useState('Ward A');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [routeData, setRouteData] = useState<RouteOptimizationResponse | null>(null);
  const [showOptimized, setShowOptimized] = useState(false);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    setRouteData(null);
    setShowOptimized(false);

    try {
      const result = await api.optimizeRoutes(ward);
      setRouteData(result);
      // auto-flip to optimized after a brief delay
      setTimeout(() => setShowOptimized(true), 500);
    } catch {
      // handle error silently
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div id="routes-page" className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Route Optimization</h1>
        <p className="text-sm text-slate-500 mt-1">
          AI-powered route optimization for waste collection trucks
        </p>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel — Controls */}
        <div className="lg:col-span-1 space-y-4">
          {/* Ward selector */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-pcmc-blue" />
              <h3 className="text-sm font-semibold text-slate-700">Select Ward</h3>
            </div>
            <select
              id="ward-selector"
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pcmc-blue/20 focus:border-pcmc-blue"
            >
              {WARDS.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>

            <button
              id="optimize-route-btn"
              onClick={handleOptimize}
              disabled={isOptimizing}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-pcmc-blue text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Optimizing…
                </>
              ) : (
                <>
                  <RouteIcon className="w-4 h-4" />
                  Optimize Route
                </>
              )}
            </button>
          </div>

          {/* Before / After cards */}
          {routeData && (
            <>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Current Route
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Distance</span>
                    <span className="font-semibold text-slate-800">
                      {routeData.current_routes.total_distance_km.toFixed(1)} km
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Time</span>
                    <span className="font-semibold text-slate-800">
                      {routeData.current_routes.estimated_time_hours.toFixed(1)} hrs
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Fuel Cost</span>
                    <span className="font-semibold text-slate-800">
                      ₹{routeData.current_routes.fuel_cost.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-pcmc-blue rotate-90 lg:rotate-0" />
              </div>

              <div className="bg-white rounded-xl border-2 border-pcmc-blue/30 shadow-sm p-5 ring-1 ring-pcmc-blue/10">
                <h4 className="text-xs font-semibold text-pcmc-blue uppercase tracking-wider mb-3">
                  Optimized Route
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Distance</span>
                    <span className="font-semibold text-pcmc-blue">
                      {routeData.optimized_routes.total_distance_km.toFixed(1)} km
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Time</span>
                    <span className="font-semibold text-pcmc-blue">
                      {routeData.optimized_routes.estimated_time_hours.toFixed(1)} hrs
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Fuel Cost</span>
                    <span className="font-semibold text-pcmc-blue">
                      ₹{routeData.optimized_routes.fuel_cost.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Savings summary */}
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="w-4 h-4 text-emerald-200" />
                  <h4 className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">
                    Savings
                  </h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-100">Distance Saved</span>
                    <span className="font-bold">
                      {routeData.savings.distance_saved_km.toFixed(1)} km
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-100">Time Saved</span>
                    <span className="font-bold">
                      {routeData.savings.time_saved_hours.toFixed(1)} hrs
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-100">Cost Saved</span>
                    <span className="font-bold">
                      ₹{routeData.savings.cost_saved.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-emerald-400/30">
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-100">Improvement</span>
                      <span className="text-lg font-bold">
                        {routeData.savings.percentage_improvement.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right panel — Map */}
        <div className="lg:col-span-2">
          {routeData ? (
            <div className="space-y-3">
              {/* Toggle */}
              <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 shadow-sm p-2">
                <button
                  id="show-current-route"
                  onClick={() => setShowOptimized(false)}
                  className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    !showOptimized
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Current Route
                </button>
                <button
                  id="show-optimized-route"
                  onClick={() => setShowOptimized(true)}
                  className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    showOptimized
                      ? 'bg-pcmc-blue text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Optimized Route
                </button>
              </div>

              <RouteMap
                currentRoute={routeData.current_routes}
                optimizedRoute={routeData.optimized_routes}
                showOptimized={showOptimized}
                ward={ward}
              />
            </div>
          ) : (
            <div className="h-[520px] rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50/50">
              <div className="text-center">
                <RouteIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500">
                  Select a ward and click "Optimize Route"
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  AI will find the optimal collection path
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
