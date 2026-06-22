import { useState } from 'react';
import { analysisService } from '../services/analysis.service';

export function useAnalysis() {
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(file: File, jobDescription: string, jobTitle?: string) {
    setSubmitting(true);
    setError(null);
    try {
      const data = await analysisService.submit(file, jobDescription, jobTitle);
      setAnalysisId(data.id);
      return data.id as string;
    } catch (err: any) {
      const msg =
        err.response?.data?.error ?? 'Failed to submit analysis. Please try again.';
      setError(msg);
      return null;
    } finally {
      setSubmitting(false);
    }
  }

  return { analysisId, submitting, error, submit };
}
