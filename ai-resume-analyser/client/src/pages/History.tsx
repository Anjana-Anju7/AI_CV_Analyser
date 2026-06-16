import { useEffect, useState } from 'react';
import { PageShell } from '../components/layout/PageShell';
import { HistoryList } from '../components/history/HistoryList';
import { ScoreTrendChart } from '../components/history/ScoreTrendChart';
import { analysisService } from '../services/analysis.service';
import type { AnalysisSummary } from '../types';
import { Loader2 } from 'lucide-react';

export default function History() {
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analysisService
      .getHistory(1, 50)
      .then((data) => setAnalyses(data.analyses))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Analysis history</h1>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
          </div>
        ) : (
          <>
            <ScoreTrendChart analyses={analyses} />
            <HistoryList analyses={analyses} />
          </>
        )}
      </div>
    </PageShell>
  );
}
