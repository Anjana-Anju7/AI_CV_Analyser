import { useState } from 'react';
import { analysisService } from '../../services/analysis.service';
import type { RewriteSuggestion } from '../../types';
import { Loader2, RotateCcw } from 'lucide-react';

interface Props {
  suggestion: RewriteSuggestion;
  analysisId: string;
  index: number;
}

export function SuggestionCard({ suggestion, analysisId, index }: Props) {
  const [custom, setCustom] = useState('');
  const [rewrite, setRewrite] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRewrite() {
    setLoading(true);
    try {
      const result = await analysisService.rewriteBullet(
        analysisId,
        custom.trim() || suggestion.original
      );
      setRewrite(result.suggested);
    } catch {
      // fail silently, keep original
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Suggestion {index + 1}
        </span>
        {rewrite && (
          <button
            onClick={() => setRewrite(null)}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      <div className="bg-red-50 border-b border-red-100 px-4 py-3">
        <p className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">Original</p>
        <p className="text-sm text-gray-800 leading-relaxed">{suggestion.original}</p>
      </div>

      <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-3">
        <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide mb-1">
          Suggested
        </p>
        <p className="text-sm text-gray-800 leading-relaxed">{rewrite ?? suggestion.suggested}</p>
      </div>

      <div className="px-4 py-3 bg-white">
        <p className="text-xs text-gray-500 mb-3 italic">{suggestion.reason}</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Paste your own bullet to rewrite…"
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
          />
          <button
            onClick={handleRewrite}
            disabled={loading}
            className="text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
          >
            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
            {loading ? 'Rewriting…' : 'Rewrite'}
          </button>
        </div>
      </div>
    </div>
  );
}
