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
  let body: Partial<RequestBody>;
  try {
    body = await context.request.json();
  } catch {
    return new Response('bad request', { status: 400 });
  }

  const { outcome, snoozeCount, streak, squadName, time } = body;
  if (!outcome || typeof snoozeCount !== 'number' || typeof streak !== 'number' || !squadName || !time) {
    return new Response('bad request', { status: 400 });
  }

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
