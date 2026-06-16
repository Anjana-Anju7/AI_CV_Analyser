import type { AnalysisResult } from '../../types';

interface Props {
  result: AnalysisResult;
}

export function KeywordGap({ result }: Props) {
  return (
    <div className="bg-white rounded-2xl border p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Keyword analysis</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-medium text-emerald-700 mb-2 uppercase tracking-wide">
            Present ({result.presentKeywords.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {result.presentKeywords.map((kw) => (
              <span
                key={kw}
                className="px-2.5 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
              >
                {kw}
              </span>
            ))}
            {result.presentKeywords.length === 0 && (
              <p className="text-xs text-gray-400">None detected</p>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-red-600 mb-2 uppercase tracking-wide">
            Missing ({result.missingKeywords.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {result.missingKeywords.map((kw) => (
              <span
                key={kw}
                className="px-2.5 py-1 text-xs rounded-full bg-red-50 text-red-600 border border-red-200 cursor-default"
                title="Keyword from job description missing in your resume"
              >
                + {kw}
              </span>
            ))}
            {result.missingKeywords.length === 0 && (
              <p className="text-xs text-gray-400">No missing keywords</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
