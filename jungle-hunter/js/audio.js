// audio.js — Procedural sound effects via WebAudio. No external assets.
(function () {
  let ctx = null;
  let masterGain = null;
  let muted = false;

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.5;
      masterGain.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function envelope(gain, vol, attack, decay) {
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);
  }

  function noiseBuffer(duration) {
    const len = Math.floor(ctx.sampleRate * duration);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  function playGunshot() {
    if (!ensureCtx() || muted) return;
    // noise burst with band-pass + low thump
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer(0.2);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1800;
    bp.Q.value = 0.7;
    const ng = ctx.createGain();
    envelope(ng, 0.55, 0.001, 0.16);
    noise.connect(bp).connect(ng).connect(masterGain);
    noise.start();
    noise.stop(ctx.currentTime + 0.25);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.12);
    const og = ctx.createGain();
    envelope(og, 0.35, 0.001, 0.12);
    osc.connect(og).connect(masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  }

  function playHit() {
    if (!ensureCtx() || muted) return;
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);
    const g = ctx.createGain();
    envelope(g, 0.25, 0.001, 0.08);
    osc.connect(g).connect(masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  }

  function playKill() {
    if (!ensureCtx() || muted) return;
    // descending arpeggio
    const notes = [440, 330, 220];
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = f;
      const g = ctx.createGain();
      const start = ctx.currentTime + i * 0.06;
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.18, start + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);
      osc.connect(g).connect(masterGain);
      osc.start(start);
      osc.stop(start + 0.16);
    });
  }

  function playCoin() {
    if (!ensureCtx() || muted) return;
    [880, 1320].forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = f;
      const g = ctx.createGain();
      const start = ctx.currentTime + i * 0.05;
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.14, start + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
      osc.connect(g).connect(masterGain);
      osc.start(start);
      osc.stop(start + 0.14);
    });
  }

  function playSplash() {
    if (!ensureCtx() || muted) return;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer(0.3);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(800, ctx.currentTime);
    bp.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.25);
    const g = ctx.createGain();
    envelope(g, 0.3, 0.005, 0.25);
    noise.connect(bp).connect(g).connect(masterGain);
    noise.start();
    noise.stop(ctx.currentTime + 0.35);
  }

  function playClick() {
    if (!ensureCtx() || muted) return;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 660;
    const g = ctx.createGain();
    envelope(g, 0.15, 0.001, 0.06);
    osc.connect(g).connect(masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  function playDamage() {
    if (!ensureCtx() || muted) return;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.2);
    const g = ctx.createGain();
    envelope(g, 0.3, 0.001, 0.2);
    osc.connect(g).connect(masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  }

  function playEmpty() {
    if (!ensureCtx() || muted) return;
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 130;
    const g = ctx.createGain();
    envelope(g, 0.15, 0.001, 0.05);
    osc.connect(g).connect(masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.07);
  }

  function playReload() {
    if (!ensureCtx() || muted) return;
    [220, 330, 440].forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = f;
      const g = ctx.createGain();
      const start = ctx.currentTime + i * 0.08;
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.12, start + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 0.06);
      osc.connect(g).connect(masterGain);
      osc.start(start);
      osc.stop(start + 0.08);
    });
  }

  function playLevelClear() {
    if (!ensureCtx() || muted) return;
    const notes = [523, 659, 784, 1047]; // C E G C
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = f;
      const g = ctx.createGain();
      const start = ctx.currentTime + i * 0.12;
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.2, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 0.3);
      osc.connect(g).connect(masterGain);
      osc.start(start);
      osc.stop(start + 0.32);
    });
  }

  function setMuted(v) { muted = !!v; }

  window.SFX = {
    playGunshot, playHit, playKill, playCoin, playSplash,
    playClick, playDamage, playEmpty, playReload, playLevelClear,
    setMuted, ensureCtx,
  };
})();
