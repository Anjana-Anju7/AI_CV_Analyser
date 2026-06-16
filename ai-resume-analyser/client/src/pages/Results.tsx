import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageShell } from '../components/layout/PageShell';
import { ScoreGauge } from '../components/analysis/ScoreGauge';
import { SectionAccordion } from '../components/analysis/SectionAccordion';
import { ATSCard } from '../components/analysis/ATSCard';
import { KeywordGap } from '../components/analysis/KeywordGap';
import { SuggestionCard } from '../components/analysis/SuggestionCard';
import { analysisService } from '../services/analysis.service';
import type { AnalysisResult } from '../types';
import {
  Download,
  Share2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  FileText,
  Layout,
  Zap,
} from 'lucide-react';

const seniorityStyles = {
  'good fit': 'bg-emerald-50 text-emerald-700',
  'too junior': 'bg-amber-50 text-amber-700',
};

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!id) return;
    analysisService
      .getOne(id)
      .then((data) => {
        if (data.result) setResult(data.result as AnalysisResult);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleShare() {
    if (!id) return;
    setSharing(true);
    try {
      const data = await analysisService.share(id);
      setShareUrl(data.shareUrl);
      navigator.clipboard.writeText(data.shareUrl).catch(() => {});
    } finally {
      setSharing(false);
    }
  }

  async function handleExport() {
    if (!id) return;
    setExporting(true);
    try {
      await analysisService.exportPDF(id);
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      </PageShell>
    );
  }

  if (!result) {
    return (
      <PageShell>
        <div className="max-w-md mx-auto text-center py-24">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">Analysis not found</p>
          <Link to="/analyse" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">
            ← Back to analyse
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/history"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All analyses
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Export PDF
            </button>
            <button
              onClick={handleShare}
              disabled={sharing}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {sharing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : shareUrl ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              {shareUrl ? 'Copied!' : 'Share'}
            </button>
          </div>
        </div>

        {shareUrl && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 text-sm text-emerald-700 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            Share link copied: <span className="font-mono text-xs truncate">{shareUrl}</span>
          </div>
        )}

        {/* Score card */}
        <div className="bg-white rounded-2xl border p-6">
          <h1 className="text-lg font-bold text-gray-900 mb-5">Resume Review</h1>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ScoreGauge score={result.overallScore} />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-gray-900">Your Resume Score</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                This score is calculated based on the variables listed below.
              </p>
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">{result.summary}</p>
              <span
                className={`mt-3 inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                  seniorityStyles[result.seniorityMatch]
                }`}
              >
                {result.seniorityMatch}
              </span>
            </div>
          </div>
        </div>

        {/* Section breakdown accordion */}
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

        {/* ATS card */}
        <ATSCard score={result.atsScore} items={result.atsItems} />

        {/* Keywords */}
        <KeywordGap result={result} />

        {/* Rewrite suggestions */}
        {result.rewriteSuggestions.length > 0 && id && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Rewrite suggestions</h3>
            <div className="space-y-4">
              {result.rewriteSuggestions.map((s, i) => (
                <SuggestionCard key={i} suggestion={s} analysisId={id} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Re-upload CTA */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-indigo-900">Ready to improve your score?</p>
            <p className="text-xs text-indigo-600 mt-0.5">
              Apply the suggestions above to your resume, then re-upload to see your new score.
            </p>
          </div>
          <Link
            to="/analyse"
            className="flex-shrink-0 text-sm font-medium px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Re-analyse
          </Link>
        </div>

      </div>
    </PageShell>
  );
}
