import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../components/layout/PageShell';
import { DropZone } from '../components/upload/DropZone';
import { ProcessingStatus } from '../components/analysis/ProcessingStatus';
import { useAnalysis } from '../hooks/useAnalysis';
import { useAnalysisStatus } from '../hooks/useSSE';
import { useAuth } from '../hooks/useAuth';
import { Loader2, BookOpen } from 'lucide-react';
import { jdService } from '../services/analysis.service';
import type { SavedJD, AnalysisStatus } from '../types';

export default function Analyse() {
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState('');
  const [savedJDs, setSavedJDs] = useState<SavedJD[]>([]);
  const [showJDLibrary, setShowJDLibrary] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { submitting, error, submit } = useAnalysis();
  const { accessToken } = useAuth();
  const { status, result } = useAnalysisStatus(activeId, accessToken);
  const navigate = useNavigate();

  useEffect(() => {
    jdService.getAll().then(setSavedJDs).catch(() => {});
  }, []);

  useEffect(() => {
    if (status === 'COMPLETE' && result && activeId) {
      navigate(`/results/${activeId}`);
    }
  }, [status, result, activeId, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    const id = await submit(file, jd);
    if (id) setActiveId(id);
  }

  if (activeId && status !== 'COMPLETE') {
    return (
      <PageShell>
        <div className="max-w-xl mx-auto bg-white rounded-2xl border p-8">
          <ProcessingStatus status={status as AnalysisStatus} />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Analyse your resume</h1>
        <p className="text-sm text-gray-500 mb-8">
          Upload your CV and paste the job description to get your AI-powered score.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Resume (PDF or DOCX)
            </label>
            <DropZone onFile={setFile} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Job description
              </label>
              <button
                type="button"
                onClick={() => setShowJDLibrary(!showJDLibrary)}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:underline"
              >
                <BookOpen className="w-3 h-3" />
                {showJDLibrary ? 'Hide' : 'Load from library'}
              </button>
            </div>

            {showJDLibrary && savedJDs.length > 0 && (
              <div className="mb-3 bg-white border rounded-xl divide-y max-h-48 overflow-y-auto">
                {savedJDs.map((jdItem) => (
                  <button
                    key={jdItem.id}
                    type="button"
                    onClick={() => {
                      setJd(jdItem.description);
                      setShowJDLibrary(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900">{jdItem.title}</p>
                    {jdItem.company && (
                      <p className="text-xs text-gray-400">{jdItem.company}</p>
                    )}
                  </button>
                ))}
              </div>
            )}

            {showJDLibrary && savedJDs.length === 0 && (
              <p className="text-xs text-gray-400 mb-3 px-1">
                No saved job descriptions yet. Save one in the Job Library.
              </p>
            )}

            <textarea
              required
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              rows={10}
              placeholder="Paste the full job description here (at least 50 characters)…"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!file || !jd.trim() || submitting}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Uploading…' : 'Analyse resume'}
          </button>
        </form>
      </div>
    </PageShell>
  );
}
