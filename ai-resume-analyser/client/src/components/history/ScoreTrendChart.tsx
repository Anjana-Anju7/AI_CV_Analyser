import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { AnalysisSummary } from '../../types';

interface Props {
  analyses: AnalysisSummary[];
}

export function ScoreTrendChart({ analyses }: Props) {
  const data = [...analyses]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((a) => ({
      date: new Date(a.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      }),
      score: a.overallScore,
    }));

  if (data.length < 2) {
    return (
      <div className="bg-white rounded-2xl border p-6 flex items-center justify-center h-48 text-sm text-gray-400">
        Run at least 2 analyses to see your score trend
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Score over time</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 4, fill: '#6366f1' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
