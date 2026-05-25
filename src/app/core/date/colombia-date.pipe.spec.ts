import { describe, expect, it } from 'vitest';
import { ColombiaDatePipe, normalizeApiDateString } from './colombia-date.pipe';

describe('ColombiaDatePipe', () => {
  const pipe = new ColombiaDatePipe();

  it('formats UTC ISO strings in Colombia timezone', () => {
    const result = pipe.transform('2026-05-25T05:09:00.000Z');
    expect(result).toBe('24/05/2026 00:09');
  });

  it('treats API dates without Z as UTC', () => {
    expect(normalizeApiDateString('2026-05-25T05:09:00')).toBe('2026-05-25T05:09:00Z');
    const result = pipe.transform('2026-05-25T05:09:00');
    expect(result).toBe('24/05/2026 00:09');
  });

  it('does not require DatePipe injection', () => {
    expect(() => new ColombiaDatePipe().transform('2026-05-25T05:09:00.000Z')).not.toThrow();
  });
});
