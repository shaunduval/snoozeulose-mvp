let ctx: AudioContext | null = null;
let nodes: { osc: OscillatorNode; lfo: OscillatorNode; master: GainNode } | null = null;

/** Two-tone square-wave klaxon, synthesized so we ship zero audio assets. */
export function startKlaxon(volume: number) {
  stopKlaxon();
  try {
    ctx = ctx ?? new AudioContext();
    void ctx.resume();
    const master = ctx.createGain();
    master.gain.value = clamp01(volume) * 0.35;
    master.connect(ctx.destination);

    const beat = ctx.createGain();
    beat.gain.value = 0.5;
    beat.connect(master);

    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 784;
    osc.connect(beat);

    const lfo = ctx.createOscillator();
    lfo.type = 'square';
    lfo.frequency.value = 3.5;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.5;
    lfo.connect(lfoGain);
    lfoGain.connect(beat.gain);

    osc.start();
    lfo.start();
    nodes = { osc, lfo, master };
  } catch {
    // no audio available (e.g. autoplay blocked before any gesture): ring silently
  }
}

export function setKlaxonVolume(volume: number) {
  if (nodes) nodes.master.gain.value = clamp01(volume) * 0.35;
}

export function stopKlaxon() {
  if (!nodes) return;
  try {
    nodes.osc.stop();
    nodes.lfo.stop();
    nodes.master.disconnect();
  } catch {
    // already stopped
  }
  nodes = null;
}

export function previewKlaxon(volume: number, ms = 1200) {
  startKlaxon(volume);
  setTimeout(stopKlaxon, ms);
}

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}
