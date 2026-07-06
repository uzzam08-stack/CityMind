import { MessageSquare, Sparkles } from 'lucide-react';
import ChatInterface from '../components/ChatInterface';

export default function Query() {
  return (
    <div id="query-page" className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-pcmc-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI-Powered Query Interface</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Ask anything about PCMC city operations in natural language
            </p>
          </div>
        </div>
      </div>

      {/* Feature badges */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100">
          <Sparkles className="w-3.5 h-3.5 text-pcmc-blue" />
          <span className="text-xs font-medium text-pcmc-blue">Natural Language to SQL</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
          <span className="text-xs font-medium text-status-green">Auto-Visualization</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-100">
          <span className="text-xs font-medium text-status-amber">Real-time Data</span>
        </div>
      </div>

      {/* Chat */}
      <ChatInterface />
    </div>
  );
}
