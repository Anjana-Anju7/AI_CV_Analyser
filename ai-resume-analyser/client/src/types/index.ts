export interface RewriteSuggestion {
  original: string;
  suggested: string;
  reason: string;
}

export interface SectionHighlight {
  type: 'positive' | 'improvement';
  text: string;
}

export interface SectionDetail {
  score: number;
  label: 'Strong' | 'Good Start' | 'Needs Work' | 'Poor';
  highlights: SectionHighlight[];
}

export interface ATSItem {
  type: 'pass' | 'warning';
  message: string;
}

export interface AnalysisResult {
  overallScore: number;
  toneAndStyle: SectionDetail;
  content: SectionDetail;
  structure: SectionDetail;
  skills: SectionDetail;
  atsScore: number;
  atsItems: ATSItem[];
  missingKeywords: string[];
  presentKeywords: string[];
  rewriteSuggestions: RewriteSuggestion[];
  seniorityMatch: 'too junior' | 'good fit';
  summary: string;
}

export interface AnalysisSummary {
  id: string;
  status: string;
  overallScore: number | null;
  jobDescription: string;
  createdAt: string;
  resumeUrl: string;
}

export interface SavedJD {
  id: string;
  title: string;
  company?: string;
  description: string;
  createdAt: string;
}

export type AnalysisStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETE' | 'FAILED';
