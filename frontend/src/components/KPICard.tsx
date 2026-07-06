import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
  trend?: 'up' | 'down';
}

const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    ring: 'ring-blue-500/20',
  },
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    ring: 'ring-amber-500/20',
  },
  green: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    ring: 'ring-emerald-500/20',
  },
  red: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    ring: 'ring-red-500/20',
  },
};

export default function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
}: KPICardProps) {
  const scheme = colorMap[color] ?? colorMap.blue;

  const formattedValue =
    typeof value === 'number' ? value.toLocaleString('en-IN') : value;

  return (
    <div
      id={`kpi-${title.toLowerCase().replace(/\s+/g, '-')}`}
      className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-6 transition-all duration-500 ease-in-out hover:-translate-y-0.5 hover:bg-white/[0.08] hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.4)] cursor-default"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-400 truncate">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white tracking-tight">
            {formattedValue}
          </p>
          {subtitle && (
            <div className="mt-2 flex items-center gap-1.5">
              {trend === 'up' && (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              )}
              {trend === 'down' && (
                <TrendingDown className="w-3.5 h-3.5 text-red-400" />
              )}
              <p
                className={`text-xs font-medium ${
                  trend === 'up'
                    ? 'text-emerald-400'
                    : trend === 'down'
                    ? 'text-red-400'
                    : 'text-slate-500'
                }`}
              >
                {subtitle}
              </p>
            </div>
          )}
        </div>

        <div
          className={`flex-shrink-0 w-12 h-12 rounded-xl ${scheme.bg} ${scheme.text} ring-1 ${scheme.ring} flex items-center justify-center`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
