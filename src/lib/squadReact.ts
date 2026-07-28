import { fmtTimeOfDay } from './time';
import type { SquadReaction } from '../store';

export interface SquadReactContext {
  outcome: 'won' | 'missed';
  snoozeCount: number;
  streak: number;
  squadName: string;
  time: string;
}

const TIMEOUT_MS = 8000;

/**
 * Best-effort only: on any failure (no key configured, network, timeout,
 * refusal) resolves to null instead of throwing. Never blocks the morning flow.
 */
export async function fetchSquadReaction(ctx: SquadReactContext): Promise<SquadReaction | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch('/api/squad-react', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ctx),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { memberId?: string; text?: string };
    if (!data.memberId || !data.text) return null;
    return { id: `react-${Date.now()}`, memberId: data.memberId, text: data.text, time: fmtTimeOfDay(new Date()) };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
