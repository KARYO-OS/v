import { describe, it, expect, vi, afterEach } from 'vitest';
import { handleError } from '../../lib/handleError';
import { getMetricsSummary, resetMetrics } from '../../lib/metrics';

describe('handleError', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    resetMetrics();
  });

  it('returns the Error message when passed an Error instance', () => {
    const err = new Error('something went wrong');
    const result = handleError(err, 'Fallback pesan');
    expect(result).toBe('something went wrong');
  });

  it('returns fallback string when passed a non-Error value (string)', () => {
    const result = handleError('raw string error', 'Fallback pesan');
    expect(result).toBe('Fallback pesan');
  });

  it('returns fallback string when passed null', () => {
    const result = handleError(null, 'Fallback pesan');
    expect(result).toBe('Fallback pesan');
  });

  it('returns fallback string when passed undefined', () => {
    const result = handleError(undefined, 'Fallback pesan');
    expect(result).toBe('Fallback pesan');
  });

  it('returns fallback string when passed a plain object', () => {
    const result = handleError({ code: 500 }, 'Fallback pesan');
    expect(result).toBe('Fallback pesan');
  });

  it('returns fallback string when Error has empty message', () => {
    const err = new Error('');
    const result = handleError(err, 'Fallback pesan');
    // Empty string is falsy — falls back
    expect(result).toBe('Fallback pesan');
  });

  it('logs to console in DEV mode', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Vitest runs with import.meta.env.DEV = true in test mode
    handleError(new Error('dev error'), 'fallback');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('records to metrics when operation is provided', () => {
    handleError(new Error('network failure'), 'Fallback pesan', 'fetchTasks');
    const summary = getMetricsSummary();
    expect(summary.apiErrors).toHaveLength(1);
    expect(summary.apiErrors[0].operation).toBe('fetchTasks');
    expect(summary.apiErrors[0].count).toBe(1);
    expect(summary.apiErrors[0].lastMessage).toBe('network failure');
  });

  it('increments metrics count on repeated failure of same operation', () => {
    handleError(new Error('err1'), 'Fallback', 'fetchTasks');
    handleError(new Error('err2'), 'Fallback', 'fetchTasks');
    const summary = getMetricsSummary();
    expect(summary.apiErrors[0].count).toBe(2);
    expect(summary.apiErrors[0].lastMessage).toBe('err2');
  });

  it('does NOT record to metrics when operation is omitted', () => {
    handleError(new Error('silent error'), 'Fallback pesan');
    const summary = getMetricsSummary();
    expect(summary.apiErrors).toHaveLength(0);
  });
});
