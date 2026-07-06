import { NavLink } from 'react-router-dom';
import {
  Building2,
  LayoutDashboard,
  AlertTriangle,
  Route,
  MessageSquare,
  BarChart3,
  Cpu,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/alerts', label: 'Anomaly Alerts', icon: AlertTriangle },
  { to: '/routes', label: 'Route Optimization', icon: Route },
  { to: '/query', label: 'AI Query', icon: MessageSquare },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/benchmark', label: 'NVIDIA Benchmark', icon: Cpu },
];

export default function Sidebar() {
  return (
    <aside
      id="sidebar"
      className="fixed top-0 left-0 w-64 h-screen bg-white/5 backdrop-blur-lg border-r border-white/10 text-white flex flex-col z-50"
    >
      {/* Logo / Branding */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pcmc-blue to-blue-400 flex items-center justify-center shadow-lg shadow-pcmc-blue/25">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">CityMind</h1>
            <p className="text-[11px] text-slate-400 leading-tight">
              PCMC C&D Infrastructure
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 group ${
                isActive
                  ? 'bg-pcmc-blue/20 text-white shadow-lg shadow-pcmc-blue/10 border border-pcmc-blue/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Demo Mode Badge */}
      <div className="px-4 py-4 border-t border-white/10">
        <div
          id="demo-mode-badge"
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>
          <span className="text-xs font-semibold text-emerald-400">
            Demo Mode
          </span>
        </div>
        <p className="text-[10px] text-slate-600 text-center mt-2">
          v1.0.0 — PCMC Pune
        </p>
      </div>
    </aside>
  );
}
