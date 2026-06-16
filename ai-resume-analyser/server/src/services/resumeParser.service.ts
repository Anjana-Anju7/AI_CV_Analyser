import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export function validateMime(mimeType: string): void {
  if (!ALLOWED_MIME.has(mimeType)) {
    throw new Error('INVALID_FILE_TYPE');
  }
}

export async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  validateMime(mimeType);

  if (mimeType === 'application/pdf') {
    const data = await pdfParse(buffer);
    const text = data.text.trim();
    if (!text || text.length < 50) throw new Error('EMPTY_PDF');
    return text;
  }

  const result = await mammoth.extractRawText({ buffer });
  if (!result.value || result.value.length < 50) throw new Error('EMPTY_DOCX');
  return result.value.trim();
}

export function sanitiseText(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[^\x20-\x7E\n]/g, ' ')
    .slice(0, 12_000)
    .trim();
}
