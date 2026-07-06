import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, CircleMarker, Popup, Marker } from 'react-leaflet';
import L from 'leaflet';
import type { Bin, Truck } from '../api/client';

interface BinMapProps {
  bins: Bin[];
  trucks: Truck[];
}

function getFillColor(fill: number): string {
  if (fill > 80) return '#DC2626';
  if (fill >= 50) return '#D97706';
  return '#16A34A';
}

function getFillLabel(fill: number): string {
  if (fill > 80) return 'Critical';
  if (fill >= 50) return 'Warning';
  return 'Normal';
}

function createTruckIcon() {
  return L.divIcon({
    html: '<span style="font-size:24px;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3));">🚛</span>',
    className: 'truck-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

const truckIcon = createTruckIcon();

export default function BinMap({ bins, trucks }: BinMapProps) {
  return (
    <div id="bin-map" className="h-[500px] rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <MapContainer
        center={[18.6298, 73.7997]}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Bin markers */}
        {bins.map((bin) => {
          const color = getFillColor(bin.fill_level);
          const label = getFillLabel(bin.fill_level);
          return (
            <CircleMarker
              key={bin.bin_id}
              center={[bin.lat, bin.lng]}
              radius={bin.fill_level > 80 ? 8 : 6}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.85,
                weight: 2,
                opacity: 1,
              }}
            >
              <Popup>
                <div className="font-inter text-sm min-w-[180px]">
                  <p className="font-bold text-slate-900 text-base">{bin.bin_id}</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ward</span>
                      <span className="font-medium text-slate-700">{bin.ward}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Fill Level</span>
                      <span
                        className="font-bold px-2 py-0.5 rounded-full text-xs text-white"
                        style={{ backgroundColor: color }}
                      >
                        {bin.fill_level}% — {label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Capacity</span>
                      <span className="font-medium text-slate-700">{bin.capacity_litres}L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Last Collected</span>
                      <span className="font-medium text-slate-700">
                        {formatTimeAgo(bin.last_collected)}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Truck markers */}
        {trucks.map((truck) => (
          <Marker
            key={truck.truck_id}
            position={[truck.lat, truck.lng]}
            icon={truckIcon}
          >
            <Popup>
              <div className="font-inter text-sm min-w-[170px]">
                <p className="font-bold text-slate-900 text-base">{truck.truck_id}</p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Driver</span>
                    <span className="font-medium text-slate-700">{truck.driver_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status</span>
                    <span
                      className={`font-semibold text-xs px-2 py-0.5 rounded-full ${
                        truck.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : truck.status === 'idle'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {truck.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Load</span>
                    <span className="font-medium text-slate-700">{truck.current_load_pct}%</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
