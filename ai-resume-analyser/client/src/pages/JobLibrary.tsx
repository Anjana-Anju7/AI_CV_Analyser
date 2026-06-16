import { useEffect, useState, FormEvent } from 'react';
import { PageShell } from '../components/layout/PageShell';
import { jdService } from '../services/analysis.service';
import type { SavedJD } from '../types';
import { Loader2, Trash2, Plus, BookOpen } from 'lucide-react';

export default function JobLibrary() {
  const [jds, setJds] = useState<SavedJD[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    return jdService.getAll().then(setJds).catch(console.error);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await jdService.create(title, description, company || undefined);
      setTitle('');
      setCompany('');
      setDescription('');
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await jdService.delete(id);
    setJds((prev) => prev.filter((jd) => jd.id !== id));
  }

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Job description library</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add JD
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl border p-6 space-y-4"
          >
            <h2 className="text-sm font-semibold text-gray-900">Save a job description</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job title <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Senior Software Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Acme Corp"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job description <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                placeholder="Paste the full job description…"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-sm px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 text-sm px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
          </div>
        ) : jds.length === 0 ? (
          <div className="bg-white rounded-2xl border p-12 text-center">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              No saved job descriptions yet. Add one to quickly reuse it when analysing.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border divide-y divide-gray-100">
            {jds.map((jd) => (
              <div key={jd.id} className="flex items-start gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{jd.title}</p>
                  {jd.company && (
                    <p className="text-xs text-gray-400">{jd.company}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {jd.description.slice(0, 120)}…
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(jd.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
