import Anthropic from '@anthropic-ai/sdk';

interface Env {
  ANTHROPIC_API_KEY: string;
}

interface RequestBody {
  outcome: 'won' | 'missed';
  snoozeCount: number;
  streak: number;
  squadName: string;
  time: string;
}

const MODEL = 'claude-opus-5';

/**
 * This endpoint is public and every call it makes costs money, so the request
 * body is bounded before anything reaches the model. A legitimate body is ~95
 * bytes; the caps below are generous headroom, not tight fits.
 */
export const LIMITS = {
  bodyBytes: 4096,
  squadName: 64,
  time: 16,
  snoozeCount: 100,
  streak: 10_000,
} as const;

const OUTCOMES = ['won', 'missed'] as const;

function boundedString(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= max;
}

function boundedCount(value: unknown, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= max;
}

/**
 * Returns the validated body, or null if it should be rejected. Every field is
 * length- or range-bounded: an unbounded string here becomes an unbounded
 * prompt, and a 1M-token prompt costs ~$5 per request.
 */
export function validateBody(body: unknown): RequestBody | null {
  if (typeof body !== 'object' || body === null) return null;
  const { outcome, snoozeCount, streak, squadName, time } = body as Partial<RequestBody>;

  if (!OUTCOMES.includes(outcome as (typeof OUTCOMES)[number])) return null;
  if (!boundedString(squadName, LIMITS.squadName)) return null;
  if (!boundedString(time, LIMITS.time)) return null;
  if (!boundedCount(snoozeCount, LIMITS.snoozeCount)) return null;
  if (!boundedCount(streak, LIMITS.streak)) return null;

  return { outcome: outcome as 'won' | 'missed', snoozeCount, streak, squadName, time };
}

const SQUAD_VOICES = `- tiah: competitive, chipper, a little smug about being up early
- larry: laid-back, always has a mild excuse
- yazmin: dry, deadpan, not a morning person but shows up anyway`;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    memberId: { type: 'string', enum: ['tiah', 'larry', 'yazmin'] },
    text: { type: 'string' },
  },
  required: ['memberId', 'text'],
  additionalProperties: false,
};

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  // Cheap reject before parsing. A sender using chunked encoding can omit this
  // header, so it's a fast path only: validateBody below is the real bound.
  const declaredLength = Number(context.request.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > LIMITS.bodyBytes) {
    return new Response('bad request', { status: 400 });
  }

  let raw: unknown;
  try {
    raw = await context.request.json();
  } catch {
    return new Response('bad request', { status: 400 });
  }

  const body = validateBody(raw);
  if (!body) {
    return new Response('bad request', { status: 400 });
  }
  const { outcome, snoozeCount, streak, squadName, time } = body;

  const client = new Anthropic({ apiKey: context.env.ANTHROPIC_API_KEY });

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 800,
      thinking: { type: 'adaptive' },
      output_config: {
        effort: 'low',
        format: { type: 'json_schema', schema: RESPONSE_SCHEMA },
      },
      system: `You write one-line reactions for a squad chat in "snoozeulose," a social alarm app: wake on the first ring, or the squad finds out.

Squad members who can react:
${SQUAD_VOICES}

Voice rules: lowercase, dry, terse, a little roast-y. Under 15 words. No emoji, no hashtags, no exclamation points.

Examples of the app's existing voice:
"still snoozing… ×3. someone go knock."
"up on the first ring. day 4. good morning."
"finally up. do not perceive me."

Pick whichever squad member would most plausibly react to this outcome, and write their line reacting to the real user's morning.`,
      messages: [
        {
          role: 'user',
          content: `squad: ${squadName}. user's outcome: ${outcome}, snoozed ${snoozeCount}x, streak now ${streak}, time ${time}.`,
        },
      ],
    });

    if (response.stop_reason === 'refusal') {
      throw new Error('refused');
    }

    const block = response.content.find((b) => b.type === 'text');
    if (!block || block.type !== 'text') {
      throw new Error('no text block in response');
    }

    const parsed = JSON.parse(block.text);
    return Response.json(parsed);
  } catch (err) {
    console.error('squad-react failed', err);
    return new Response('failed', { status: 500 });
  }
}
