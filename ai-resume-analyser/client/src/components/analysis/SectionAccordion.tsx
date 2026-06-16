import { useState, ReactNode } from 'react';
import { ChevronDown, CheckCircle, AlertTriangle } from 'lucide-react';
import type { SectionDetail } from '../../types';

interface Props {
  name: string;
  section: SectionDetail;
  icon: ReactNode;
  defaultOpen?: boolean;
}

const labelStyles = {
  Strong: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Good Start': 'bg-amber-50 text-amber-700 border border-amber-200',
  'Needs Work': 'bg-orange-50 text-orange-700 border border-orange-200',
  Poor: 'bg-red-50 text-red-700 border border-red-200',
};

const scoreColor = (score: number) =>
  score >= 75 ? 'text-emerald-600' : score >= 50 ? 'text-amber-500' : 'text-red-500';

export function SectionAccordion({ name, section, icon, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b last:border-b-0">
      <button
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="text-gray-400 flex-shrink-0">{icon}</span>
        <span className="flex-1 font-medium text-gray-900">{name}</span>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${labelStyles[section.label]}`}
        >
          {section.label}
        </span>
        <span className={`text-lg font-bold tabular-nums ${scoreColor(section.score)} w-20 text-right`}>
          {section.score}
          <span className="text-xs text-gray-400 font-normal">/100</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 space-y-2.5 bg-gray-50 border-t border-gray-100">
          {section.highlights.map((h, i) => (
            <div key={i} className="flex gap-2.5 text-sm">
              <span className="flex-shrink-0 mt-0.5">
                {h.type === 'positive' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
              </span>
              <span className={h.type === 'positive' ? 'text-gray-700' : 'text-gray-700'}>
                {h.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
