import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { AnalysisStatus } from '../../types';

interface Props {
  status: AnalysisStatus;
}

const steps = [
  { key: 'QUEUED', label: 'Queued' },
  { key: 'PROCESSING', label: 'Analysing with AI' },
  { key: 'COMPLETE', label: 'Complete' },
];

export function ProcessingStatus({ status }: Props) {
  if (status === 'FAILED') {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <XCircle className="w-12 h-12 text-red-500" />
        <p className="text-lg font-semibold text-gray-900">Analysis failed</p>
        <p className="text-sm text-gray-500">
          Something went wrong. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <div className="relative">
        <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-900">
          {status === 'QUEUED' ? 'Waiting in queue…' : 'AI is analysing your resume…'}
        </p>
        <p className="text-sm text-gray-500 mt-1">This usually takes 15–30 seconds</p>
      </div>
      <div className="flex items-center gap-4">
        {steps.map((step, i) => {
          const currentIdx = steps.findIndex((s) => s.key === status);
          const done = i < currentIdx || status === 'COMPLETE';
          const active = step.key === status;

          return (
            <div key={step.key} className="flex items-center gap-2">
              {i > 0 && (
                <div className={`w-12 h-px ${done || active ? 'bg-indigo-400' : 'bg-gray-300'}`} />
              )}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors
                    ${done
                      ? 'bg-indigo-600 border-indigo-600'
                      : active
                      ? 'border-indigo-500 bg-white'
                      : 'border-gray-300 bg-white'
                    }`}
                >
                  {done ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : active ? (
                    <Loader2 className="w-3 h-3 text-indigo-500 animate-spin" />
                  ) : (
                    <Clock className="w-3 h-3 text-gray-400" />
                  )}
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">{step.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
