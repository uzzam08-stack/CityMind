import { useState, useRef, useEffect } from 'react';
import { Send, ChevronDown, ChevronUp, Sparkles, Database, Camera } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { api } from '../api/client';
import type { NLQueryResponse, VisionResponse } from '../api/client';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  sql?: string;
  data?: Record<string, any>[];
  chartType?: string;
  latencyMs?: number;
  visionResult?: VisionResponse;
  timestamp: Date;
}

const CHART_COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#A78BFA', '#F472B6', '#22D3EE', '#FB923C'];

const SUGGESTED_QUERIES = [
  'Show me bins with fill level above 80% in Ward A',
  'How many grievances are open grouped by category?',
  'What is the average fill level per ward?',
  'Show truck utilization for today',
];

function VisionAnalysisCard({ result }: { result: VisionResponse }) {
  const a = result.analysis;
  const isPenaltyZone = a.penalty_multiplier > 1;
  return (
    <div className="mt-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-4 space-y-3 transition-all duration-500 ease-in-out animate-slide-up">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">🛰️ Drone Analysis — {result.model}</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isPenaltyZone ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
          {isPenaltyZone ? `⚠️ ${a.penalty_multiplier}× Penalty Zone` : '✅ Standard Zone'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
          <p className="text-[10px] text-slate-500 uppercase">Volume</p>
          <p className="text-lg font-bold text-white">{a.estimated_volume_m3} m³</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
          <p className="text-[10px] text-slate-500 uppercase">Estimated Fine</p>
          <p className="text-lg font-bold text-amber-400">₹{a.estimated_fine_inr.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
          <p className="text-[10px] text-slate-500 uppercase">Remediation Cost</p>
          <p className="text-lg font-bold text-emerald-400">₹{a.remediation_cost_inr.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
          <p className="text-[10px] text-slate-500 uppercase">Confidence</p>
          <p className="text-lg font-bold text-blue-400">{(a.confidence * 100).toFixed(0)}%</p>
        </div>
      </div>
      <div>
        <p className="text-[10px] text-slate-500 uppercase mb-1">Materials Identified</p>
        <div className="flex flex-wrap gap-1.5">
          {a.materials.map((m, i) => (
            <span key={i} className="px-2 py-0.5 text-[11px] bg-white/10 text-slate-300 rounded-full border border-white/5">{m}</span>
          ))}
        </div>
      </div>
      <p className="text-xs text-slate-400">📍 {a.location_risk}</p>
    </div>
  );
}

function SqlBlock({ sql, isOpen, onToggle }: { sql: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="mt-3">
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-400 transition-colors font-medium"
      >
        <Database className="w-3.5 h-3.5" />
        {isOpen ? 'Hide' : 'View'} SQL
        {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {isOpen && (
        <pre className="mt-2 p-3 bg-black/40 text-emerald-400 text-xs rounded-lg overflow-x-auto font-mono leading-relaxed border border-white/5">
          {sql}
        </pre>
      )}
    </div>
  );
}

function DataChart({ chartType, data }: { chartType: string; data: Record<string, any>[] }) {
  if (!data || data.length === 0) return null;

  const keys = Object.keys(data[0]).filter((k) => k !== Object.keys(data[0])[0]);
  const xKey = Object.keys(data[0])[0];

  const darkTooltipStyle = {
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(15,23,42,0.95)',
    color: '#E2E8F0',
    fontSize: 12,
  };

  if (chartType === 'bar') {
    return (
      <div className="mt-3 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#64748B' }} stroke="#334155" />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#334155" />
            <Tooltip contentStyle={darkTooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#94A3B8' }} />
            {keys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chartType === 'line') {
    return (
      <div className="mt-3 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#64748B' }} stroke="#334155" />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#334155" />
            <Tooltip contentStyle={darkTooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#94A3B8' }} />
            {keys.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chartType === 'pie') {
    const valueKey = keys[0];
    return (
      <div className="mt-3 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={40}
              dataKey={valueKey}
              nameKey={xKey}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              labelLine={true}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={darkTooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chartType === 'table') {
    const allKeys = Object.keys(data[0]);
    return (
      <div className="mt-3 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              {allKeys.map((k) => (
                <th key={k} className="px-3 py-2 text-left font-semibold text-slate-400 whitespace-nowrap">
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}>
                {allKeys.map((k) => (
                  <td key={k} className="px-3 py-2 text-slate-300 whitespace-nowrap">
                    {String(row[k])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [openSqlIds, setOpenSqlIds] = useState<Set<string>>(new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const toggleSql = (id: string) => {
    setOpenSqlIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDroneFeed = async () => {
    if (isLoading || isAnalyzing) return;
    setIsAnalyzing(true);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: '📸 Uploaded drone feed image for C&D waste site analysis…',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const resp = await api.analyzeDumping('SIMULATED_DRONE_IMAGE_BASE64');
      const aiMsg: ChatMessage = {
        id: `ai-vision-${Date.now()}`,
        role: 'ai',
        text: `Analysis complete. Identified ${resp.analysis.materials.length} material types across an estimated ${resp.analysis.estimated_volume_m3} m³ dumping site.`,
        visionResult: resp,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'ai',
        text: 'Vision analysis failed. The Gemini 1.5 Flash endpoint is not available.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sendMessage = async (query: string) => {
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const resp: NLQueryResponse = await api.queryNL(query.trim());
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: resp.answer,
        sql: resp.sql,
        data: resp.data,
        chartType: resp.chart_type,
        latencyMs: resp.latency_ms,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'ai',
        text: 'Sorry, I encountered an error processing your query. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div id="chat-interface" className="flex flex-col h-[calc(100vh-220px)] min-h-[500px] bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden">
      {/* Suggested queries */}
      {messages.length === 0 && (
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Suggested Queries
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.map((q, i) => (
              <button
                key={i}
                id={`suggested-query-${i}`}
                onClick={() => sendMessage(q)}
                className="px-3.5 py-2 text-xs bg-blue-500/10 text-blue-400 rounded-full hover:bg-blue-500/20 transition-all duration-300 font-medium border border-blue-500/20"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Thread */}
      <div ref={threadRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 transition-all duration-300 ${
                msg.role === 'user'
                  ? 'bg-pcmc-blue/80 text-white rounded-br-md backdrop-blur-lg'
                  : 'bg-white/5 text-slate-200 rounded-bl-md border border-white/10 backdrop-blur-lg'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

              {msg.role === 'ai' && msg.sql && (
                <SqlBlock
                  sql={msg.sql}
                  isOpen={openSqlIds.has(msg.id)}
                  onToggle={() => toggleSql(msg.id)}
                />
              )}

              {msg.role === 'ai' && msg.chartType && msg.data && (
                <DataChart chartType={msg.chartType} data={msg.data} />
              )}

              {msg.role === 'ai' && msg.visionResult && (
                <VisionAnalysisCard result={msg.visionResult} />
              )}

              <p
                className={`text-[10px] mt-2 ${
                  msg.role === 'user' ? 'text-blue-200' : 'text-slate-500'
                }`}
              >
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {msg.latencyMs != null && (
                  <span className="ml-2">• {msg.latencyMs}ms</span>
                )}
              </p>
            </div>
          </div>
        ))}

        {(isLoading || isAnalyzing) && (
          <div className="flex justify-start">
            <div className="bg-white/5 rounded-2xl rounded-bl-md px-4 py-3 border border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-3 px-4 py-3 border-t border-white/10 bg-white/[0.02]"
      >
        <input
          id="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about city operations, bins, trucks, grievances…"
          disabled={isLoading || isAnalyzing}
          className="flex-1 px-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pcmc-blue/30 focus:border-pcmc-blue/50 disabled:opacity-50 transition-all"
        />
        <button
          id="drone-feed-btn"
          type="button"
          onClick={handleDroneFeed}
          disabled={isLoading || isAnalyzing}
          title="Upload Drone Feed"
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-amber-500/20 text-amber-400 rounded-xl hover:bg-amber-500/30 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed border border-amber-500/20"
        >
          <Camera className="w-4 h-4" />
        </button>
        <button
          id="chat-send-btn"
          type="submit"
          disabled={!input.trim() || isLoading || isAnalyzing}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-pcmc-blue text-white rounded-xl hover:bg-blue-600 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-pcmc-blue/25"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
