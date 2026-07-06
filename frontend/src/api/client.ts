const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export interface Bin {
  bin_id: string;
  ward: string;
  lat: number;
  lng: number;
  fill_level: number;
  capacity_litres: number;
  last_collected: string;
  installed_date: string;
  zone: string;
}

export interface Truck {
  truck_id: string;
  ward: string;
  driver_name: string;
  lat: number;
  lng: number;
  status: string;
  capacity_tonnes: number;
  current_load_pct: number;
  last_updated: string;
}

export interface Alert {
  alert_id: string;
  bin_id: string;
  ward: string;
  fill_level: number;
  alert_type: string;
  severity: string;
  detected_at: string;
  status: string;
  dispatched_truck_id: string | null;
  resolved_at: string | null;
}

export interface Grievance {
  grievance_id: string;
  ward: string;
  category: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  resolved_at: string | null;
  sla_hours: number;
}

export interface KPISummary {
  total_bins: number;
  bins_requiring_collection: number;
  active_trucks: number;
  open_grievances: number;
  sla_breaches: number;
}

export interface NLQueryResponse {
  answer: string;
  sql: string;
  data: Record<string, any>[];
  chart_type: string;
  latency_ms: number;
}

export interface RouteData {
  route: Array<{ lat: number; lng: number; bin_id?: string }>;
  total_distance_km: number;
  estimated_time_hours: number;
  fuel_cost: number;
}

export interface RouteOptimizationResponse {
  current_routes: RouteData;
  optimized_routes: RouteData;
  savings: {
    distance_saved_km: number;
    time_saved_hours: number;
    cost_saved: number;
    percentage_improvement: number;
  };
}

export interface BenchmarkResponse {
  pandas_ms: number;
  rapids_ms: number;
  speedup: number;
  operation: string;
  row_count: number;
  note: string;
}

export interface DispatchStep {
  step: string;
  timestamp: string;
  status: string;
}

export interface DispatchResponse {
  steps: DispatchStep[];
  truck_id: string;
  estimated_arrival: string;
  status: string;
}

export interface AnalyticsData {
  daily_waste: Array<{ date: string; ward: string; tonnes: number }>;
  grievance_categories: Array<{ category: string; count: number }>;
  truck_utilization: Array<{ status: string; count: number }>;
  ward_performance: Array<{
    ward: string;
    bins: number;
    avg_fill_pct: number;
    collection_rate: number;
    open_grievances: number;
    score: number;
  }>;
}

export interface VisionAnalysis {
  materials: string[];
  estimated_volume_m3: number;
  penalty_multiplier: number;
  location_risk: string;
  estimated_fine_inr: number;
  remediation_cost_inr: number;
  confidence: number;
}

export interface VisionResponse {
  status: string;
  model: string;
  analysis: VisionAnalysis;
}

// API functions
export const api = {
  getBins: (ward?: string) => fetchAPI<Bin[]>(`/bins${ward ? `?ward=${ward}` : ''}`),
  getBin: (id: string) => fetchAPI<Bin>(`/bins/${id}`),
  getTrucks: () => fetchAPI<Truck[]>('/trucks'),
  getAlerts: (params?: { ward?: string; severity?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.ward) searchParams.set('ward', params.ward);
    if (params?.severity) searchParams.set('severity', params.severity);
    if (params?.status) searchParams.set('status', params.status);
    const qs = searchParams.toString();
    return fetchAPI<Alert[]>(`/alerts${qs ? `?${qs}` : ''}`);
  },
  dispatchAlert: (alertId: string) => fetchAPI<DispatchResponse>(`/alerts/${alertId}/dispatch`, { method: 'POST' }),
  getGrievances: () => fetchAPI<Grievance[]>('/grievances'),
  getKPIs: () => fetchAPI<KPISummary>('/kpis'),
  getAnalytics: (dateRange?: string) => fetchAPI<AnalyticsData>(`/analytics${dateRange ? `?date_range=${dateRange.replace('d', '')}` : ''}`),
  queryNL: (query: string) => fetchAPI<NLQueryResponse>('/nl-query', {
    method: 'POST',
    body: JSON.stringify({ query }),
  }),
  getRoutes: (ward: string) => fetchAPI<RouteOptimizationResponse>(`/routes?ward=${ward}`),
  optimizeRoutes: (wardId: string) => fetchAPI<RouteOptimizationResponse>('/optimize-routes', {
    method: 'POST',
    body: JSON.stringify({ ward_id: wardId }),
  }),
  runBenchmark: (rows: number) => fetchAPI<BenchmarkResponse>(`/benchmark?rows=${rows}`),
  analyzeDumping: (imageBase64: string) => fetchAPI<VisionResponse>('/analyze-dumping', {
    method: 'POST',
    body: JSON.stringify({ image_base64: imageBase64 }),
  }),
};
