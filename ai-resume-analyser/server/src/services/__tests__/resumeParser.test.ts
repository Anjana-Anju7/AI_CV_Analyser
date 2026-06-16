import { describe, it, expect } from "@jest/globals";
import { sanitiseText, validateMime } from '../resumeParser.service';

describe('sanitiseText', () => {
  it('collapses excessive blank lines', () => {
    const input = 'line1\n\n\n\n\nline2';
    expect(sanitiseText(input)).toBe('line1\n\nline2');
  });

  it('truncates at 12000 chars', () => {
    const long = 'a'.repeat(15_000);
    expect(sanitiseText(long).length).toBe(12_000);
  });

  it('normalises windows line endings', () => {
    expect(sanitiseText('foo\r\nbar')).toBe('foo\nbar');
  });

  it('strips non-printable characters', () => {
    expect(sanitiseText('hello\x01world')).toBe('hello world');
  });
});

describe('validateMime', () => {
  it('accepts PDF', () => {
    expect(() => validateMime('application/pdf')).not.toThrow();
  });

  it('accepts DOCX', () => {
    expect(() =>
      validateMime(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      )
    ).not.toThrow();
  });

  it('rejects image/png', () => {
    expect(() => validateMime('image/png')).toThrow('INVALID_FILE_TYPE');
  });

  it('rejects text/plain', () => {
    expect(() => validateMime('text/plain')).toThrow('INVALID_FILE_TYPE');
  });
});
