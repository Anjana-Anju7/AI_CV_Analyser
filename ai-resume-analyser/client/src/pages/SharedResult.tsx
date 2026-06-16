import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ScoreGauge } from '../components/analysis/ScoreGauge';
import { SectionAccordion } from '../components/analysis/SectionAccordion';
import { ATSCard } from '../components/analysis/ATSCard';
import { KeywordGap } from '../components/analysis/KeywordGap';
import type { AnalysisResult } from '../types';
import { Loader2, AlertCircle, FileText, MessageSquare, Layout, Zap } from 'lucide-react';
import api from '../services/api';

export default function SharedResult() {
  const { token } = useParams<{ token: string }>();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token) return;
    api
      .get(`/analyses/shared/${token}`)
      .then((res) => setResult(res.data.result as AnalysisResult))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white px-6 h-14 flex items-center justify-between max-w-6xl mx-auto">
        <Link to="/" className="flex items-center gap-2 font-bold text-indigo-600 text-lg">
          <FileText className="w-5 h-5" /> ResumeAI
        </Link>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
          Shared analysis
        </span>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : notFound || !result ? (
          <div className="max-w-md mx-auto text-center py-24">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">This analysis is no longer available</p>
            <Link to="/" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">
              Go to ResumeAI
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Score card */}
            <div className="bg-white rounded-2xl border p-6">
              <h1 className="text-lg font-bold text-gray-900 mb-5">Resume Review</h1>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ScoreGauge score={result.overallScore} />
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-xl font-bold text-gray-900">Overall Score</h2>
                  <p className="text-sm text-gray-600 mt-3 leading-relaxed">{result.summary}</p>
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="bg-white rounded-2xl border overflow-hidden">
              <SectionAccordion
                name="Tone & Style"
                section={result.toneAndStyle}
                icon={<MessageSquare className="w-4 h-4" />}
              />
              <SectionAccordion
                name="Content"
                section={result.content}
                icon={<FileText className="w-4 h-4" />}
              />
              <SectionAccordion
                name="Structure"
                section={result.structure}
                icon={<Layout className="w-4 h-4" />}
              />
              <SectionAccordion
                name="Skills"
                section={result.skills}
                icon={<Zap className="w-4 h-4" />}
                defaultOpen
              />
            </div>

            <ATSCard score={result.atsScore} items={result.atsItems} />
            <KeywordGap result={result} />

            <div className="text-center py-4">
              <Link
                to="/"
                className="text-sm font-medium px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Analyse your own resume →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
