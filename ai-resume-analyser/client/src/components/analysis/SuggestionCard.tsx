import type { RewriteSuggestion } from '../../types';

interface Props {
  suggestion: RewriteSuggestion;
  index: number;
}

export function SuggestionCard({ suggestion, index }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Suggestion {index + 1}
        </span>
      </div>

      <div className="bg-red-50 border-b border-red-100 px-4 py-3">
        <p className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">Original</p>
        <p className="text-sm text-gray-800 leading-relaxed">{suggestion.original}</p>
      </div>

      <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-3">
        <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide mb-1">Suggested</p>
        <p className="text-sm text-gray-800 leading-relaxed">{suggestion.suggested}</p>
      </div>

      <div className="px-4 py-3 bg-white">
        <p className="text-xs text-gray-500 italic">{suggestion.reason}</p>
      </div>
    </div>
  );
}
