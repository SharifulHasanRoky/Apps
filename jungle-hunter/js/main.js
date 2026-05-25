// main.js — entry: boot game, wire menus, HUD, persistence.
(function () {
  const STORAGE_KEYS = {
    best: 'jh_best_score_v1',
    progress: 'jh_progress_v1',
  };

  function loadJSON(k, def) {
    try { const v = localStorage.getItem(k); return v == null ? def : JSON.parse(v); }
    catch (e) { return def; }
  }
  function saveJSON(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
  }

  const state = {
    bestScore: loadJSON(STORAGE_KEYS.best, 0),
    progress: loadJSON(STORAGE_KEYS.progress, { unlocked: 1 }),
  };

  // DOM refs
  const $ = (id) => document.getElementById(id);
  const canvas = $('game');
  const hudEl = $('hud');
  const menuEl = $('menu');
  const levelSelectEl = $('levelSelect');
  const howToEl = $('howTo');
  const pauseEl = $('pauseMenu');
  const lcEl = $('levelComplete');
  const goEl = $('gameOver');
  const toastEl = $('toast');

  const hud = {
    level: $('hudLevel'),
    score: $('hudScore'),
    target: $('hudTarget'),
    hpFill: $('hpFill'),
    ammoFill: $('ammoFill'),
    ammoText: $('ammoText'),
  };

  $('bestScore').textContent = state.bestScore.toString();

  // ------ Game ------
  const game = new window.Game(canvas);

  // Bind input
  window.InputBindings.bindMouse(canvas);
  window.InputBindings.bindJoystick($('joystick'), $('joystickKnob'));
  window.InputBindings.bindFireButton($('fireBtn'));
  window.InputBindings.bindReloadButton($('reloadBtn'));

  // ------ Helpers to show/hide overlays ------
  function showOverlay(el) {
    [menuEl, levelSelectEl, howToEl, pauseEl, lcEl, goEl].forEach(e => e.classList.add('hidden'));
    if (el) el.classList.remove('hidden');
    hudEl.classList.toggle('hidden', el !== null);
  }

  // Toast
  let toastT = 0;
  game.onToast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.remove('hidden');
    toastT = 1.5;
  };

  // HUD update
  game.onHud = (h) => {
    if (!h) return;
    hud.level.textContent = h.level;
    hud.score.textContent = h.score;
    hud.target.textContent = `${h.target}/${h.targetMax}`;
    const hpPct = Math.max(0, h.hpPct) * 100;
    hud.hpFill.style.width = hpPct + '%';
    hud.hpFill.classList.toggle('low', hpPct < 35);
    hud.ammoFill.style.width = Math.max(0, h.ammoPct) * 100 + '%';
    hud.ammoText.textContent = `${h.ammo}/${h.ammoMax}`;
  };

  game.onStateChange = (s) => {
    if (s === 'playing') {
      showOverlay(null);
    } else if (s === 'paused') {
      showOverlay(pauseEl);
    } else if (s === 'levelComplete') {
      const r = game.lastResult || { score: 0, bonus: 0, total: 0 };
      $('lcScore').textContent = r.score;
      $('lcBonus').textContent = r.bonus;
      $('lcTotal').textContent = r.total;
      // Persist progress
      const next = game.levelIdx + 1;
      if (next < window.LEVELS.length) {
        state.progress.unlocked = Math.max(state.progress.unlocked, next + 1);
        saveJSON(STORAGE_KEYS.progress, state.progress);
      }
      // Best score
      if (game.player.score > state.bestScore) {
        state.bestScore = game.player.score;
        saveJSON(STORAGE_KEYS.best, state.bestScore);
        $('bestScore').textContent = state.bestScore;
      }
      // Hide "Next" if last level
      $('btnNext').style.display = next < window.LEVELS.length ? '' : 'none';
      showOverlay(lcEl);
    } else if (s === 'gameOver') {
      $('goReason').textContent = game.gameOverReason || (game.player.hp <= 0 ? 'You ran out of HP' : 'You failed the hunt');
      $('goScore').textContent = game.player.score;
      if (game.player.score > state.bestScore) {
        state.bestScore = game.player.score;
        saveJSON(STORAGE_KEYS.best, state.bestScore);
      }
      $('goBest').textContent = state.bestScore;
      showOverlay(goEl);
    } else if (s === 'menu') {
      showOverlay(menuEl);
    }
  };

  // ------ Wire menu buttons ------
  $('btnPlay').onclick = () => {
    window.SFX.ensureCtx();
    window.SFX.playClick();
    game.startLevel(0);
  };

  $('btnLevels').onclick = () => {
    window.SFX.playClick();
    renderLevelGrid();
    showOverlay(levelSelectEl);
  };

  $('btnHowTo').onclick = () => {
    window.SFX.playClick();
    showOverlay(howToEl);
  };

  document.querySelectorAll('[data-back="menu"]').forEach(b => {
    b.onclick = () => { window.SFX.playClick(); showOverlay(menuEl); };
  });

  $('pauseBtn').onclick = () => { window.Input.pause = true; };

  $('btnResume').onclick = () => {
    window.SFX.playClick();
    game.setState('playing');
  };
  $('btnRestart').onclick = () => {
    window.SFX.playClick();
    game.startLevel(game.levelIdx);
  };
  $('btnQuit').onclick = () => {
    window.SFX.playClick();
    game.setState('menu');
  };

  $('btnNext').onclick = () => {
    window.SFX.playClick();
    const next = game.levelIdx + 1;
    if (next < window.LEVELS.length) game.startLevel(next);
    else game.setState('menu');
  };
  $('btnReplay').onclick = () => {
    window.SFX.playClick();
    game.startLevel(game.levelIdx);
  };
  $('btnLcMenu').onclick = () => {
    window.SFX.playClick();
    game.setState('menu');
  };

  $('btnRetry').onclick = () => {
    window.SFX.playClick();
    game.startLevel(game.levelIdx);
  };
  $('btnGoMenu').onclick = () => {
    window.SFX.playClick();
    game.setState('menu');
  };

  // ------ Level grid ------
  function renderLevelGrid() {
    const grid = $('levelGrid');
    grid.innerHTML = '';
    const unlocked = state.progress.unlocked || 1;
    window.LEVELS.forEach((lvl, i) => {
      const tile = document.createElement('button');
      tile.className = 'level-tile' + (i + 1 > unlocked ? ' locked' : '');
      tile.innerHTML = `
        <div class="lvl-num">${String(i + 1).padStart(2, '0')}</div>
        <div class="lvl-icon">${lvl.icon}</div>
        <div class="lvl-name">${lvl.name}</div>
        <div class="lvl-stars">${i + 1 <= unlocked ? '★'.repeat(Math.min(3, unlocked - i)) : '🔒'}</div>
      `;
      if (i + 1 <= unlocked) {
        tile.onclick = () => {
          window.SFX.playClick();
          game.startLevel(i);
        };
      }
      grid.appendChild(tile);
    });
  }

  // ------ Main loop ------
  function loop(now) {
    const dt = Math.min(0.05, (now - (game.lastFrame || now)) / 1000);
    game.lastFrame = now;
    game.update(dt);
    game.render();

    // Toast lifecycle
    if (toastT > 0) {
      toastT -= dt;
      if (toastT <= 0) toastEl.classList.add('hidden');
    }

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // ------ Show menu initially ------
  showOverlay(menuEl);

  // Resume audio context on first user interaction (for mobile)
  const wakeAudio = () => {
    window.SFX.ensureCtx();
    document.removeEventListener('touchstart', wakeAudio);
    document.removeEventListener('click', wakeAudio);
  };
  document.addEventListener('touchstart', wakeAudio);
  document.addEventListener('click', wakeAudio);

  // Disable double-tap zoom on iOS
  let lastTap = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTap < 300) e.preventDefault();
    lastTap = now;
  }, { passive: false });
})();
