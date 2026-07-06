import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Polyline, CircleMarker, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { RouteData } from '../api/client';

interface RouteMapProps {
  currentRoute: RouteData;
  optimizedRoute: RouteData;
  showOptimized: boolean;
  ward: string;
}

function createDepotIcon() {
  return L.divIcon({
    html: '<span style="font-size:22px;">📍</span>',
    className: 'depot-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

const depotIcon = createDepotIcon();

function getCenter(route: RouteData): [number, number] {
  if (route.route.length === 0) return [18.6298, 73.7997];
  const lats = route.route.map((p) => p.lat);
  const lngs = route.route.map((p) => p.lng);
  return [
    (Math.min(...lats) + Math.max(...lats)) / 2,
    (Math.min(...lngs) + Math.max(...lngs)) / 2,
  ];
}

export default function RouteMap({
  currentRoute,
  optimizedRoute,
  showOptimized,
  ward,
}: RouteMapProps) {
  const center = getCenter(showOptimized ? optimizedRoute : currentRoute);
  const currentPositions = currentRoute.route.map((p) => [p.lat, p.lng] as [number, number]);
  const optimizedPositions = optimizedRoute.route.map((p) => [p.lat, p.lng] as [number, number]);
  const activeRoute = showOptimized ? optimizedRoute : currentRoute;

  return (
    <div id="route-map" className="relative h-[520px] rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Current route (gray) */}
        {currentPositions.length > 1 && (
          <Polyline
            positions={currentPositions}
            pathOptions={{
              color: '#94A3B8',
              weight: showOptimized ? 3 : 5,
              opacity: showOptimized ? 0.4 : 0.8,
              dashArray: showOptimized ? '8 6' : undefined,
            }}
          />
        )}

        {/* Optimized route (blue) */}
        {showOptimized && optimizedPositions.length > 1 && (
          <Polyline
            positions={optimizedPositions}
            pathOptions={{
              color: '#1D4ED8',
              weight: 5,
              opacity: 0.85,
            }}
          />
        )}

        {/* Bin stop markers */}
        {activeRoute.route
          .filter((p) => p.bin_id)
          .map((p, idx) => (
            <CircleMarker
              key={`${p.bin_id}-${idx}`}
              center={[p.lat, p.lng]}
              radius={5}
              pathOptions={{
                color: showOptimized ? '#1D4ED8' : '#64748B',
                fillColor: showOptimized ? '#3B82F6' : '#94A3B8',
                fillOpacity: 0.9,
                weight: 2,
              }}
            >
              <Popup>
                <p className="font-semibold text-sm">{p.bin_id}</p>
              </Popup>
            </CircleMarker>
          ))}

        {/* Depot marker (first point) */}
        {activeRoute.route.length > 0 && (
          <Marker position={[activeRoute.route[0].lat, activeRoute.route[0].lng]} icon={depotIcon}>
            <Popup>
              <p className="font-semibold text-sm">Depot — {ward}</p>
              <p className="text-xs text-slate-500">Start / End Point</p>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Stats Overlay */}
      <div className="absolute bottom-4 left-4 z-[500] bg-white/95 backdrop-blur rounded-xl shadow-lg px-4 py-3 border border-slate-200">
        <div className="flex items-center gap-5 text-xs">
          <div>
            <p className="text-slate-500">Distance</p>
            <p className="text-sm font-bold text-slate-900">
              {activeRoute.total_distance_km.toFixed(1)} km
            </p>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <p className="text-slate-500">Time</p>
            <p className="text-sm font-bold text-slate-900">
              {activeRoute.estimated_time_hours.toFixed(1)} hrs
            </p>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <p className="text-slate-500">Fuel Cost</p>
            <p className="text-sm font-bold text-slate-900">
              ₹{activeRoute.fuel_cost.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-slate-400 rounded" />
            <span className="text-[10px] text-slate-500">Current</span>
          </div>
          {showOptimized && (
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-pcmc-blue rounded" />
              <span className="text-[10px] text-pcmc-blue font-semibold">Optimized</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
