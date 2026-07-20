export interface Problem {
  a: number;
  b: number;
}

export const WAKE_CHECK_STALL_SECONDS = 30;

export function makeProblems(count: number, rand: () => number = Math.random): Problem[] {
  return Array.from({ length: count }, () => ({
    a: 11 + Math.floor(rand() * 39),
    b: 11 + Math.floor(rand() * 39),
  }));
}

export function answerFor(p: Problem): number {
  return p.a + p.b;
}
