import { describe, expect, it } from 'vitest';
import { answerFor, makeProblems } from './wakeCheck';

describe('makeProblems', () => {
  it('generates the requested number of problems', () => {
    expect(makeProblems(3)).toHaveLength(3);
    expect(makeProblems(5)).toHaveLength(5);
    expect(makeProblems(0)).toHaveLength(0);
  });

  it('keeps operands two-digit so answers need real math, not reflex', () => {
    for (const p of makeProblems(100)) {
      expect(p.a).toBeGreaterThanOrEqual(11);
      expect(p.a).toBeLessThanOrEqual(49);
      expect(p.b).toBeGreaterThanOrEqual(11);
      expect(p.b).toBeLessThanOrEqual(49);
    }
  });

  it('is deterministic under a seeded random source', () => {
    const rand = () => 0.5;
    expect(makeProblems(2, rand)).toEqual([
      { a: 30, b: 30 },
      { a: 30, b: 30 },
    ]);
  });

  it('hits the range edges at the random extremes', () => {
    expect(makeProblems(1, () => 0)[0]).toEqual({ a: 11, b: 11 });
    expect(makeProblems(1, () => 0.999999)[0]).toEqual({ a: 49, b: 49 });
  });
});

describe('answerFor', () => {
  it('sums the operands', () => {
    expect(answerFor({ a: 17, b: 26 })).toBe(43);
  });
});
