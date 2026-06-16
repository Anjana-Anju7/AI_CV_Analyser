import { CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { ATSItem } from '../../types';

interface Props {
  score: number;
  items: ATSItem[];
}

export function ATSCard({ score, items }: Props) {
  const label =
    score >= 75 ? 'Great Job!' : score >= 50 ? 'Getting There' : 'Needs Improvement';

  const labelClass =
    score >= 75
      ? 'text-emerald-600'
      : score >= 50
      ? 'text-amber-600'
      : 'text-red-600';

  const gaugeColor =
    score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  const r = 28;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - score / 100);

  return (
    <div className="bg-white rounded-2xl border p-6">
      <div className="flex items-start gap-4 mb-4">
        {/* Mini circular progress */}
        <div className="relative flex-shrink-0">
          <svg viewBox="0 0 72 72" className="w-16 h-16 -rotate-90">
            <circle cx="36" cy="36" r={r} fill="none" stroke="#f3f4f6" strokeWidth="8" />
            <circle
              cx="36"
              cy="36"
              r={r}
              fill="none"
              stroke={gaugeColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.9s ease-out' }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-900 rotate-0">
            {score}
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <h3 className="font-semibold text-gray-900">ATS Score — {score}/100</h3>
          </div>
          <p className={`text-sm font-medium mt-0.5 ${labelClass}`}>{label}</p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-sm">
            This score represents how well your resume is likely to perform in Applicant
            Tracking Systems used by employers.
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2.5 text-sm">
            <span className="flex-shrink-0 mt-0.5">
              {item.type === 'pass' ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              )}
            </span>
            <span className={item.type === 'pass' ? 'text-emerald-700' : 'text-amber-700'}>
              {item.message}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-4 italic">
        Keep refining your resume to improve your chances of getting past ATS filters and into
        the hands of recruiters.
      </p>
    </div>
  );
}
