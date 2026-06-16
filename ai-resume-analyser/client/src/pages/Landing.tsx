import { Link } from 'react-router-dom';
import { FileText, Zap, BarChart2, Target, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: <FileText className="w-6 h-6 text-indigo-500" />,
    title: 'Instant Parsing',
    desc: 'Upload PDF or DOCX — we extract and clean the text automatically.',
  },
  {
    icon: <Zap className="w-6 h-6 text-indigo-500" />,
    title: 'GPT-4o Analysis',
    desc: 'Deep AI analysis against the specific job description you paste.',
  },
  {
    icon: <BarChart2 className="w-6 h-6 text-indigo-500" />,
    title: 'Radar Dashboard',
    desc: 'Five-axis score breakdown: keywords, experience, skills, formatting, ATS.',
  },
  {
    icon: <Target className="w-6 h-6 text-indigo-500" />,
    title: 'Rewrite Engine',
    desc: 'AI-powered bullet-point rewrites using STAR format with metrics.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 h-14 flex items-center justify-between max-w-6xl mx-auto">
        <span className="font-bold text-indigo-600 text-lg flex items-center gap-2">
          <FileText className="w-5 h-5" /> ResumeAI
        </span>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-gray-600 hover:text-indigo-600">Log in</Link>
          <Link
            to="/register"
            className="text-sm px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full mb-6">
          AI-Powered Resume Analysis
        </span>
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          Know exactly how your resume<br />
          <span className="text-indigo-600">scores against any job</span>
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
          Upload your CV, paste the job description, and get a detailed ATS score, keyword gap
          analysis, and AI rewrite suggestions in under 30 seconds.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-xl text-base font-semibold hover:bg-indigo-700 transition-colors shadow-md"
        >
          Analyse my resume <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Everything you need to land more interviews
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl border p-6">
                <div className="mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to get a better score?</h2>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-xl text-base font-semibold hover:bg-indigo-700 transition-colors"
        >
          Start for free <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
