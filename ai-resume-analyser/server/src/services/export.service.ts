import PDFDocument from 'pdfkit';
import type { AnalysisResult } from '../types';

const LABEL_COLOR: Record<string, string> = {
  Strong: '#10b981',
  'Good Start': '#f59e0b',
  'Needs Work': '#f97316',
  Poor: '#ef4444',
};

export function generateAnalysisPDF(result: AnalysisResult, jobTitle: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const buffers: Buffer[] = [];
    const doc = new PDFDocument({ margin: 50 });

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Title
    doc.fontSize(20).font('Helvetica-Bold').text('Resume Analysis Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').text(`Role: ${jobTitle}`);
    doc.text(`Overall score: ${result.overallScore}/100`);
    doc.text(`Seniority match: ${result.seniorityMatch}`);
    doc.moveDown();

    // Summary
    doc.fontSize(14).font('Helvetica-Bold').text('Summary');
    doc.fontSize(11).font('Helvetica').text(result.summary);
    doc.moveDown();

    // Section scores
    doc.fontSize(14).font('Helvetica-Bold').text('Section Scores');
    const sections: Array<[string, typeof result.toneAndStyle]> = [
      ['Tone & Style', result.toneAndStyle],
      ['Content', result.content],
      ['Structure', result.structure],
      ['Skills', result.skills],
    ];
    sections.forEach(([name, section]) => {
      const color = LABEL_COLOR[section.label] ?? '#6b7280';
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor(color)
        .text(`${name}: ${section.score}/100 — ${section.label}`);
      section.highlights.forEach((h) => {
        const bullet = h.type === 'positive' ? '✓' : '△';
        doc.fontSize(10).font('Helvetica').fillColor('#374151').text(`  ${bullet} ${h.text}`);
      });
      doc.moveDown(0.3);
    });
    doc.fillColor('black');
    doc.moveDown(0.5);

    // ATS
    doc.fontSize(14).font('Helvetica-Bold').text(`ATS Score: ${result.atsScore}/100`);
    result.atsItems.forEach((item) => {
      const bullet = item.type === 'pass' ? '✓' : '⚠';
      doc.fontSize(10).font('Helvetica').text(`  ${bullet} ${item.message}`);
    });
    doc.moveDown();

    // Keywords
    doc.fontSize(14).font('Helvetica-Bold').text('Missing Keywords');
    doc.fontSize(11).font('Helvetica').text(result.missingKeywords.join(', ') || 'None');
    doc.moveDown();

    doc.fontSize(14).font('Helvetica-Bold').text('Present Keywords');
    doc.fontSize(11).font('Helvetica').text(result.presentKeywords.join(', ') || 'None');
    doc.moveDown();

    // Rewrite suggestions
    if (result.rewriteSuggestions.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').text('Rewrite Suggestions');
      result.rewriteSuggestions.slice(0, 3).forEach((s, i) => {
        doc.fontSize(11).font('Helvetica-Bold').text(`${i + 1}. Original:`);
        doc.font('Helvetica').text(s.original);
        doc.font('Helvetica-Bold').text('Suggested:');
        doc.font('Helvetica').text(s.suggested);
        doc.font('Helvetica-Oblique').text(`Why: ${s.reason}`);
        doc.moveDown(0.5);
      });
    }

    doc.end();
  });
}
