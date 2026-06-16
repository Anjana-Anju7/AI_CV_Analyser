import { useEffect, useState } from 'react';
import type { AnalysisResult, AnalysisStatus } from '../types';

export function useAnalysisStatus(analysisId: string | null, accessToken: string | null) {
  const [status, setStatus] = useState<AnalysisStatus>('QUEUED');
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (!analysisId || !accessToken) return;

    const es = new EventSource(
      `/api/analyses/${analysisId}/status?token=${encodeURIComponent(accessToken)}`
    );

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStatus(data.status);
      if (data.result) setResult(data.result);
      if (data.status === 'COMPLETE' || data.status === 'FAILED') es.close();
    };

    es.onerror = () => {
      setStatus('FAILED');
      es.close();
    };

    return () => es.close();
  }, [analysisId, accessToken]);

  return { status, result };
}
