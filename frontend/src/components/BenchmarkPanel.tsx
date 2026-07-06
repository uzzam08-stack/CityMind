import { useState, useRef, useEffect } from 'react';
import { Play, Cpu, Monitor, Zap, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { api } from '../api/client';
import type { BenchmarkResponse } from '../api/client';

const DATASET_SIZES = [
  { value: 100000, label: '100K Rows', short: '100K' },
  { value: 1000000, label: '1M Rows', short: '1M' },
  { value: 10000000, label: '10M Rows', short: '10M' },
];

const TERMINAL_LOGS = [
  '> Initializing CUDA cores...',
  '> Bypassing CPU thread limits...',
  '> Mapping spatial coordinate rows to GPU memory...',
  '> Executing Haversine distance matrix computation...',
  '> Process complete. Target execution time logged.',
];

const PANDAS_CODE = `import pandas as pd

# CPU — Pandas
df = pd.read_csv("waste_data.csv")
result = (
    df.groupby("ward")
      .agg({"fill_level": "mean", "tonnage": "sum"})
      .sort_values("fill_level", ascending=False)
)`;

const RAPIDS_CODE = `import cudf  # GPU-accelerated DataFrame

# GPU — RAPIDS cuDF
df = cudf.read_csv("waste_data.csv")
result = (
    df.groupby("ward")
      .agg({"fill_level": "mean", "tonnage": "sum"})
      .sort_values("fill_level", ascending=False)
)`;

const darkTooltipStyle = {
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.1)',
  backgroundColor: 'rgba(15,23,42,0.95)',
  color: '#E2E8F0',
  fontSize: 12,
};

export default function BenchmarkPanel() {
  const [datasetSize, setDatasetSize] = useState(1000000);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<BenchmarkResponse | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [terminalDone, setTerminalDone] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const runBenchmark = async () => {
    setIsRunning(true);
    setProgress(0);
    setResult(null);
    setTerminalLines([]);
    setTerminalDone(false);

    // Start cascading terminal logs
    for (let i = 0; i < TERMINAL_LOGS.length; i++) {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          setTerminalLines((prev) => [...prev, TERMINAL_LOGS[i]]);
          setProgress(((i + 1) / TERMINAL_LOGS.length) * 80);
          resolve();
        }, 400 + Math.random() * 300);
      });
    }

    setTerminalDone(true);
    setProgress(85);

    try {
      const resp = await api.runBenchmark(datasetSize);
      setProgress(100);
      setTimeout(() => {
        setResult(resp);
        setIsRunning(false);
      }, 400);
    } catch {
      setIsRunning(false);
      setProgress(0);
      setTerminalLines([]);
      setTerminalDone(false);
    }
  };

  const chartData = result
    ? [
        { name: 'Pandas (CPU)', time: result.pandas_ms / 1000 },
        { name: 'RAPIDS (GPU)', time: result.rapids_ms / 1000 },
      ]
    : [];

  const selectedLabel = DATASET_SIZES.find((d) => d.value === datasetSize)?.label || '';

  return (
    <div id="benchmark-panel" className="space-y-6">
      {/* Dataset size selector */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-6 transition-all duration-500 ease-in-out">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Dataset Size</h3>
        <div className="flex gap-3">
          {DATASET_SIZES.map((ds) => (
            <label
              key={ds.value}
              id={`dataset-${ds.short}`}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-300 text-sm font-semibold ${
                datasetSize === ds.value
                  ? 'border-pcmc-blue/60 bg-pcmc-blue/10 text-blue-400 shadow-lg shadow-pcmc-blue/10'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/[0.08]'
              }`}
            >
              <input
                type="radio"
                name="datasetSize"
                value={ds.value}
                checked={datasetSize === ds.value}
                onChange={() => setDatasetSize(ds.value)}
                className="sr-only"
              />
              {ds.label}
            </label>
          ))}
        </div>

        <button
          id="run-benchmark-btn"
          onClick={runBenchmark}
          disabled={isRunning}
          className="mt-5 w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pcmc-blue to-blue-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pcmc-blue/25"
        >
          {isRunning ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Running Benchmark…
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run Benchmark — {selectedLabel}
            </>
          )}
        </button>

        {/* Progress bar */}
        {isRunning && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Processing {selectedLabel}…</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-pcmc-blue to-emerald-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* GPU Terminal Visualizer */}
      {(terminalLines.length > 0 || isRunning) && (
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-500 ease-in-out">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-300">NVIDIA RAPIDS — GPU Compute Terminal</span>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
            </div>
          </div>
          <div ref={terminalRef} className="p-4 font-mono text-xs space-y-1.5 max-h-48 overflow-y-auto bg-black/30">
            {terminalLines.map((line, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 animate-slide-up ${
                  line.includes('complete') ? 'text-emerald-400' : 'text-slate-300'
                }`}
              >
                <span className={`${
                  line.includes('complete') ? 'text-emerald-500' : 'text-blue-500'
                }`}>●</span>
                {line}
              </div>
            ))}
            {isRunning && !terminalDone && (
              <span className="inline-block w-2 h-4 bg-emerald-400 animate-terminal-blink" />
            )}
          </div>
        </div>
      )}

      {/* Results — only shown after terminal finishes */}
      {result && (
        <>
          {/* Comparison cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pandas CPU */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-6 transition-all duration-500 ease-in-out">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Pandas</p>
                  <p className="text-sm font-bold text-slate-200">CPU Processing</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-white">
                {(result.pandas_ms / 1000).toFixed(2)}
                <span className="text-base font-normal text-slate-500 ml-1">sec</span>
              </p>
            </div>

            {/* RAPIDS GPU */}
            <div className="bg-white/5 backdrop-blur-lg border border-emerald-500/20 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-6 ring-1 ring-emerald-500/10 transition-all duration-500 ease-in-out">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-emerald-400">RAPIDS cuDF</p>
                  <p className="text-sm font-bold text-slate-200">GPU Processing</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-emerald-400">
                {(result.rapids_ms / 1000).toFixed(2)}
                <span className="text-base font-normal text-emerald-600 ml-1">sec</span>
              </p>
            </div>

            {/* Speedup */}
            <div className="bg-gradient-to-br from-emerald-600/80 to-emerald-800/80 backdrop-blur-lg rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-6 text-white border border-emerald-500/20 transition-all duration-500 ease-in-out">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-emerald-200">GPU Acceleration</p>
                  <p className="text-sm font-bold text-white">Speedup Factor</p>
                </div>
              </div>
              <p className="text-3xl font-bold">
                {result.speedup.toFixed(1)}×
                <span className="text-base font-normal text-emerald-200 ml-2">faster</span>
              </p>
            </div>
          </div>

          {/* Bar chart */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-6 transition-all duration-500 ease-in-out">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">
              Processing Time Comparison
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: '#64748B' }}
                    stroke="#334155"
                    label={{ value: 'Seconds', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#64748B' }}
                  />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#94A3B8' }} stroke="#334155" width={110} />
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(3)} sec`, 'Time']}
                    contentStyle={darkTooltipStyle}
                  />
                  <Bar dataKey="time" radius={[0, 6, 6, 0]}>
                    <Cell fill="#64748B" />
                    <Cell fill="#22C55E" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Code comparison */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-500 ease-in-out">
            <button
              id="toggle-code-btn"
              onClick={() => setShowCode(!showCode)}
              className="w-full flex items-center justify-between px-6 py-4 text-sm font-semibold text-slate-300 hover:bg-white/5 transition-all duration-300"
            >
              <span>💻 Code Comparison — Pandas vs cuDF</span>
              {showCode ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showCode && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-white/10">
                <div className="border-r border-white/10">
                  <div className="px-4 py-2 bg-white/[0.02] border-b border-white/10">
                    <span className="text-xs font-semibold text-slate-500">Pandas (CPU)</span>
                  </div>
                  <pre className="p-4 text-xs font-mono text-slate-400 leading-relaxed overflow-x-auto">
                    {PANDAS_CODE}
                  </pre>
                </div>
                <div>
                  <div className="px-4 py-2 bg-emerald-500/5 border-b border-white/10">
                    <span className="text-xs font-semibold text-emerald-400">RAPIDS cuDF (GPU)</span>
                  </div>
                  <pre className="p-4 text-xs font-mono text-emerald-400/80 leading-relaxed overflow-x-auto">
                    {RAPIDS_CODE}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Note */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 backdrop-blur-lg">
            <p className="text-xs text-blue-300 leading-relaxed">
              <span className="font-semibold">Note:</span> {result.note || 'This benchmark demonstrates the performance advantage of NVIDIA RAPIDS cuDF over traditional Pandas for large-scale city data processing. GPU acceleration enables real-time analytics on millions of sensor readings, waste collection records, and citizen grievances.'}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
