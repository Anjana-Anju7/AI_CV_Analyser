interface Props {
  score: number;
}

export function ScoreGauge({ score }: Props) {
  const r = 70;
  const circumference = Math.PI * r; // ~219.9
  const dashOffset = circumference * (1 - score / 100);

  const color =
    score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  const scoreLabel =
    score >= 75 ? 'Strong' : score >= 50 ? 'Good Start' : score >= 25 ? 'Needs Work' : 'Poor';

  const scoreLabelClass =
    score >= 75
      ? 'text-emerald-600 bg-emerald-50'
      : score >= 50
      ? 'text-amber-600 bg-amber-50'
      : 'text-red-600 bg-red-50';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg viewBox="0 0 200 115" className="w-52">
          {/* Background track */}
          <path
            d="M 30 100 A 70 70 0 0 1 170 100"
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Score arc */}
          <path
            d="M 30 100 A 70 70 0 0 1 170 100"
            fill="none"
            stroke={color}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.9s ease-out' }}
          />
          {/* Score number */}
          <text
            x="100"
            y="88"
            textAnchor="middle"
            fontSize="36"
            fontWeight="800"
            fill="#111827"
          >
            {score}
          </text>
          <text x="100" y="106" textAnchor="middle" fontSize="12" fill="#9ca3af">
            out of 100
          </text>
        </svg>
      </div>
      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${scoreLabelClass}`}>
        {scoreLabel}
      </span>
    </div>
  );
}
