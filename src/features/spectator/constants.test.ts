import { describe, it, expect } from 'vitest';
import { canPredict, estimatedReturn, parseOdds, PREDICTION_TYPE_OPTIONS } from './constants';

describe('PREDICTION_TYPE_OPTIONS — single-runner bet types', () => {
  it('offers exactly WIN/PLACE/SHOW', () => {
    expect(PREDICTION_TYPE_OPTIONS.map((o) => o.value)).toEqual(['WIN', 'PLACE', 'SHOW']);
  });
  it('excludes multi-runner bet types this UI cannot express', () => {
    const values = PREDICTION_TYPE_OPTIONS.map((o) => o.value);
    expect(values).not.toContain('EXACTA');
    expect(values).not.toContain('QUINELLA');
  });
});

describe('canPredict — betting-pool gating', () => {
  it('allows predictions only for SCHEDULED/OPEN races', () => {
    expect(canPredict('OPEN')).toBe(true);
    expect(canPredict('SCHEDULED')).toBe(true);
  });
  it('blocks predictions once the pool is closed / race started', () => {
    expect(canPredict('CLOSED')).toBe(false);
    expect(canPredict('RUNNING')).toBe(false);
    expect(canPredict('FINISHED')).toBe(false);
    expect(canPredict('OFFICIAL')).toBe(false);
    expect(canPredict('CANCELLED')).toBe(false);
    expect(canPredict(null)).toBe(false);
    expect(canPredict(undefined)).toBe(false);
  });
});

describe('parseOdds', () => {
  it('parses a decimal odds string to a multiplier', () => {
    expect(parseOdds('3.5')).toBe(3.5);
    expect(parseOdds('2.00')).toBe(2);
  });
  it('parses fractional odds a/b to (a/b + 1)', () => {
    expect(parseOdds('5/1')).toBe(6);
    expect(parseOdds('7/2')).toBe(4.5);
  });
  it('returns null for missing/invalid odds', () => {
    expect(parseOdds(null)).toBeNull();
    expect(parseOdds('')).toBeNull();
    expect(parseOdds('abc')).toBeNull();
  });
});

describe('estimatedReturn — client-side preview', () => {
  it('multiplies stake by the odds multiplier', () => {
    expect(estimatedReturn(100, 2.5)).toBe(250);
    expect(estimatedReturn(50, 3)).toBe(150);
  });
  it('is 0 for a non-positive stake', () => {
    expect(estimatedReturn(0, 3)).toBe(0);
    expect(estimatedReturn(-10, 3)).toBe(0);
  });
});
