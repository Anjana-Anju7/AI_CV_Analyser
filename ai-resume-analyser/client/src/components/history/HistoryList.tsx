import { Link } from 'react-router-dom';
import type { AnalysisSummary } from '../../types';
import { ExternalLink, FileText } from 'lucide-react';

interface Props {
  analyses: AnalysisSummary[];
}

const JD_HEADER_PATTERNS = /^(what you(('|'| wi)ll do|'re looking for)|about (the role|us|this role)|responsibilities|requirements|the role|overview|job description|who you are|your role|role overview)/i;

function extractJdTitle(jd: string): string {
  const lines = jd
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 20 && !JD_HEADER_PATTERNS.test(l));
  const first = lines[0] ?? jd.replace(/\s+/g, ' ').trim();
  return first.length > 90 ? first.slice(0, 87) + '…' : first;
}

function scoreColor(score: number | null): string {
  if (score === null) return 'text-gray-400';
  if (score >= 75) return 'text-emerald-600';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-500';
}

export function HistoryList({ analyses }: Props) {
  if (analyses.length === 0) {
    return (
      <div className="bg-white rounded-2xl border p-12 text-center">
        <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No completed analyses yet.</p>
        <Link
          to="/analyse"
          className="mt-4 inline-block text-sm font-medium px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Analyse your first resume
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border divide-y divide-gray-100">
      {analyses.map((a) => (
        <div key={a.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
          <div className="flex-shrink-0 w-12 text-center">
            <span className={`text-xl font-bold tabular-nums ${scoreColor(a.overallScore)}`}>
              {a.overallScore ?? '–'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {a.jobTitle || extractJdTitle(a.jobDescription)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(a.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
          <Link
            to={`/results/${a.id}`}
            className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline flex-shrink-0"
          >
            View
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      ))}
    </div>
  );
}
