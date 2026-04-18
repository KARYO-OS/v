import { describe, it, expect } from 'vitest';
import { normalizeScannedQrToken } from '../../utils/gatepass';

describe('normalizeScannedQrToken', () => {
  it('returns raw token unchanged', () => {
    expect(normalizeScannedQrToken('abc123')).toBe('abc123');
  });

  it('trims whitespace around token', () => {
    expect(normalizeScannedQrToken('  abc123  ')).toBe('abc123');
  });

  it('extracts token from prefixed payload', () => {
    expect(normalizeScannedQrToken('POS_JAGA: abc123')).toBe('abc123');
    expect(normalizeScannedQrToken('GATEPASS| xyz789')).toBe('xyz789');
  });

  it('extracts token from URL query parameter', () => {
    const token = normalizeScannedQrToken('https://example.com/scan?token=abc123');
    expect(token).toBe('abc123');
  });

  it('falls back to last path segment for URL without query token', () => {
    const token = normalizeScannedQrToken('https://example.com/pos-jaga/abc123');
    expect(token).toBe('abc123');
  });
});
