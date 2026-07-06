import { Cpu, Zap } from 'lucide-react';
import BenchmarkPanel from '../components/BenchmarkPanel';

export default function Benchmark() {
  return (
    <div id="benchmark-page" className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
          <Cpu className="w-5 h-5 text-status-green" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">NVIDIA RAPIDS Performance Benchmark</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            CPU vs GPU acceleration for city-scale data processing
          </p>
        </div>
      </div>

      {/* Feature badges */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
          <Zap className="w-3.5 h-3.5 text-status-green" />
          <span className="text-xs font-medium text-status-green">NVIDIA RAPIDS cuDF</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
          <span className="text-xs font-medium text-slate-600">Pandas CPU Baseline</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100">
          <span className="text-xs font-medium text-pcmc-blue">Up to 100× Faster</span>
        </div>
      </div>

      <BenchmarkPanel />
    </div>
  );
}
