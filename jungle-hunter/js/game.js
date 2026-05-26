// game.js — Main Game class with state machine, world generation, update/render loop
(function () {
  const { Player, Bullet, Animal, House, Crate, Pickup, Particle, ANIMAL_TYPES, spawnBlood, spawnSplinters } = window.Entities;

  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.state = 'menu'; // 'menu' | 'playing' | 'paused' | 'levelComplete' | 'gameOver'
      this.t = 0;
      this.lastFrame = 0;
      this.levelIdx = 0;
      this.level = null;
      this.world = { w: 0, h: 0 };
      this.cam = { x: 0, y: 0 };
      this.player = null;
      this.bullets = [];
      this.animals = [];
      this.houses = [];
      this.crates = [];
      this.pickups = [];
      this.particles = [];
      this.decorations = []; // {type, x, y, seed}
      this.killed = 0;
      this.looted = 0;
      this.timeLeft = 0;
      this.toastTimer = 0;
      this.onStateChange = null;
      this.onHud = null;
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.canvas.style.width = w + 'px';
      this.canvas.style.height = h + 'px';
      this.canvas.width = Math.floor(w * this.dpr);
      this.canvas.height = Math.floor(h * this.dpr);
      this.viewW = w;
      this.viewH = h;
    }

    setState(s) {
      this.state = s;
      if (this.onStateChange) this.onStateChange(s);
    }

    // ============== Level start ==============
    startLevel(idx) {
      this.levelIdx = idx;
      this.level = window.LEVELS[idx];
      this.world.w = this.level.worldW;
      this.world.h = this.level.worldH;
      this.cam.x = 0;
      this.cam.y = 0;
      this.bullets = [];
      this.animals = [];
      this.houses = [];
      this.crates = [];
      this.pickups = [];
      this.particles = [];
      this.decorations = [];
      this.killed = 0;
      this.looted = 0;
      this.timeLeft = this.level.timeLimit;

      const px = this.world.w / 2;
      const py = this.world.h / 2;
      this.player = new Player(px, py, this.level.vehicle);
      this.player.maxAmmo = this.level.ammoStart;
      this.player.ammo = this.level.ammoStart;

      // Decorations
      const dec = this.level.decorations || {};
      const placeAround = (count, type) => {
        for (let i = 0; i < count; i++) {
          let x, y, ok = false, attempts = 0;
          while (!ok && attempts++ < 30) {
            x = 100 + Math.random() * (this.world.w - 200);
            y = 100 + Math.random() * (this.world.h - 200);
            if (Math.hypot(x - px, y - py) > 120) ok = true;
          }
          this.decorations.push({ type, x, y, seed: Math.floor(Math.random() * 7) });
        }
      };
      if (dec.trees) placeAround(dec.trees, 'tree');
      if (dec.bushes) placeAround(dec.bushes, 'bush');
      if (dec.rocks) placeAround(dec.rocks, 'rock');

      // Animals
      for (const [type, count] of Object.entries(this.level.spawn || {})) {
        for (let i = 0; i < count; i++) {
          let x, y, ok = false, attempts = 0;
          while (!ok && attempts++ < 30) {
            x = 100 + Math.random() * (this.world.w - 200);
            y = 100 + Math.random() * (this.world.h - 200);
            if (Math.hypot(x - px, y - py) > 200) ok = true;
          }
          this.animals.push(new Animal(type, x, y));
        }
      }

      // Houses + crates for village
      if (this.level.objective === 'loot') {
        const housesCount = this.level.houses || 6;
        const margin = 200;
        for (let i = 0; i < housesCount; i++) {
          let hx, hy, ok = false, attempts = 0;
          while (!ok && attempts++ < 50) {
            hx = margin + Math.random() * (this.world.w - margin * 2);
            hy = margin + Math.random() * (this.world.h - margin * 2);
            ok = true;
            if (Math.hypot(hx - px, hy - py) < 200) ok = false;
            for (const h of this.houses) {
              if (Math.hypot(h.x - hx, h.y - hy) < 160) { ok = false; break; }
            }
          }
          this.houses.push(new House(hx, hy));
        }
        const crates = this.level.crates || 10;
        for (let i = 0; i < crates; i++) {
          let cx, cy, ok = false, attempts = 0;
          while (!ok && attempts++ < 30) {
            cx = 100 + Math.random() * (this.world.w - 200);
            cy = 100 + Math.random() * (this.world.h - 200);
            if (Math.hypot(cx - px, cy - py) > 100) ok = true;
          }
          this.crates.push(new Crate(cx, cy));
        }
      }

      // Initial pickups
      const pickupCount = 6;
      for (let i = 0; i < pickupCount; i++) {
        const types = ['ammo', 'coin', 'coin', 'heart'];
        const type = types[Math.floor(Math.random() * types.length)];
        const x = 100 + Math.random() * (this.world.w - 200);
        const y = 100 + Math.random() * (this.world.h - 200);
        this.pickups.push(new Pickup(type, x, y));
      }

      this.setState('playing');
    }

    // ============== Update ==============
    update(dt) {
      if (this.state !== 'playing') return;
      this.t += dt;
      this.timeLeft = Math.max(0, this.timeLeft - dt);

      // Player input
      window.InputBindings.tick();
      // Sync mouse aim
      const screenX = (this.player.x - this.cam.x);
      const screenY = (this.player.y - this.cam.y);
      window.InputBindings.updateAimFromMouse(screenX, screenY);

      // Auto-aim for touch devices: aim at nearest target
      if (window.Input.isTouch) {
        const target = this.findNearestTarget();
        if (target) {
          this.player.angle = Math.atan2(target.y - this.player.y, target.x - this.player.x);
        }
      }

      this.player.update(dt);
      // Clamp player to world bounds
      this.player.x = Math.max(20, Math.min(this.world.w - 20, this.player.x));
      this.player.y = Math.max(20, Math.min(this.world.h - 20, this.player.y));

      // Camera follow
      const targetCamX = this.player.x - this.viewW / 2;
      const targetCamY = this.player.y - this.viewH / 2;
      this.cam.x += (targetCamX - this.cam.x) * Math.min(1, dt * 6);
      this.cam.y += (targetCamY - this.cam.y) * Math.min(1, dt * 6);
      this.cam.x = Math.max(0, Math.min(this.world.w - this.viewW, this.cam.x));
      this.cam.y = Math.max(0, Math.min(this.world.h - this.viewH, this.cam.y));

      // Effects: ambient particles + player trails
      if (window.Effects) {
        window.Effects.spawnAmbient(dt, this.level.biome, this.cam.x, this.cam.y, this.viewW, this.viewH);
        window.Effects.spawnPlayerTrail(dt, this.player, this.level.biome);
        window.Effects.updateEnvParticles(dt);
        window.Effects.updateShake(dt);
        window.Effects.updateDamageFlash(dt);
      }

      // Shoot
      const wantShoot = window.Input.shoot || window.Input.shootHeld;
      if (wantShoot && this.player.canShoot()) {
        this.bullets.push(this.player.fire());
        window.SFX.playGunshot();
        if (window.Effects) {
          window.Effects.triggerShake(4);
          window.Effects.spawnMuzzleSmoke(this.player);
        }
      } else if (wantShoot && this.player.ammo === 0 && this.player.shootCd <= 0) {
        window.SFX.playEmpty();
        this.player.shootCd = 0.2;
        this.showToast('Press R / RELOAD');
      }
      if (window.Input.reload) {
        this.player.reload();
        window.SFX.playReload();
        this.showToast('Reloaded');
      }
      if (window.Input.pause) {
        this.setState('paused');
      }

      // Bullets
      for (const b of this.bullets) {
        b.update(dt);
        if (b.x < 0 || b.x > this.world.w || b.y < 0 || b.y > this.world.h) b.dead = true;
      }
      // Bullet vs animals
      for (const b of this.bullets) {
        if (b.dead) continue;
        for (const a of this.animals) {
          if (a.dead) continue;
          if (Math.hypot(a.x - b.x, a.y - b.y) < a.r) {
            a.takeHit(b.damage);
            b.dead = true;
            spawnBlood(this.particles, b.x, b.y);
            if (a.dead) {
              this.player.score += a.def.points;
              this.killed++;
              window.SFX.playKill();
              // Drop chance
              if (Math.random() < 0.3) {
                const types = ['coin', 'ammo'];
                const t = types[Math.floor(Math.random() * types.length)];
                this.pickups.push(new Pickup(t, a.x, a.y));
              }
            } else {
              window.SFX.playHit();
            }
            break;
          }
        }
        if (b.dead) continue;
        // Bullet vs crates
        for (const c of this.crates) {
          if (c.dead) continue;
          if (Math.hypot(c.x - b.x, c.y - b.y) < c.r) {
            c.takeHit(b.damage);
            b.dead = true;
            spawnSplinters(this.particles, b.x, b.y);
            if (c.dead) {
              this.player.score += 10;
              window.SFX.playCoin();
              this.pickups.push(new Pickup('coin', c.x, c.y));
            }
            break;
          }
        }
      }

      // Animals
      for (const a of this.animals) {
        if (a.dead) continue;
        a.update(dt, this.player);
        a.x = Math.max(20, Math.min(this.world.w - 20, a.x));
        a.y = Math.max(20, Math.min(this.world.h - 20, a.y));
      }

      // Houses (loot)
      for (const h of this.houses) {
        const wasLooted = h.looted;
        h.update(dt, this.player);
        if (!wasLooted && h.looted) {
          this.looted++;
          this.player.score += 50;
          window.SFX.playCoin();
          this.showToast('+50 House Looted');
          // Drop loot
          for (let i = 0; i < 3; i++) {
            const a = Math.random() * Math.PI * 2;
            const r = 30 + Math.random() * 20;
            this.pickups.push(new Pickup('coin', h.x + Math.cos(a) * r, h.y + Math.sin(a) * r));
          }
        }
      }

      // Pickups
      for (const p of this.pickups) p.update(dt, this.player);

      // Particles
      for (const p of this.particles) p.update(dt);

      // Cleanup
      this.bullets = this.bullets.filter(b => !b.dead);
      this.animals = this.animals.filter(a => !a.dead);
      this.crates = this.crates.filter(c => !c.dead);
      this.pickups = this.pickups.filter(p => !p.dead);
      this.particles = this.particles.filter(p => !p.dead);

      // Win/lose
      if (this.player.hp <= 0) {
        this.setState('gameOver');
        window.SFX.playDamage();
      } else if (this.player.hp < this._lastHp) {
        // Player took damage - trigger flash
        if (window.Effects) window.Effects.triggerDamageFlash();
        this._lastHp = this.player.hp;
      }
      this._lastHp = this.player.hp;
      if (this.timeLeft <= 0) {
        this.setState('gameOver');
        this.gameOverReason = 'Time ran out';
      } else if (this.level.objective === 'kill' && this.killed >= this.level.target) {
        this.completeLevel();
      } else if (this.level.objective === 'loot' && this.looted >= this.level.target) {
        this.completeLevel();
      }

      this.toastTimer = Math.max(0, this.toastTimer - dt);

      window.InputBindings.endFrame();

      if (this.onHud) this.onHud(this.getHud());
    }

    findNearestTarget() {
      let best = null, bestD = Infinity;
      const candidates = [...this.animals];
      if (this.level && this.level.objective === 'loot') candidates.push(...this.crates);
      for (const a of candidates) {
        if (a.dead) continue;
        const d = Math.hypot(a.x - this.player.x, a.y - this.player.y);
        if (d < bestD && d < 360) { bestD = d; best = a; }
      }
      return best;
    }

    completeLevel() {
      window.SFX.playLevelClear();
      const baseScore = this.player.score;
      const timeBonus = Math.floor(this.timeLeft) * 2;
      const hpBonus = Math.floor(this.player.hp);
      this.lastResult = {
        score: baseScore,
        bonus: timeBonus + hpBonus,
        total: baseScore + timeBonus + hpBonus,
      };
      this.player.score += timeBonus + hpBonus;
      this.setState('levelComplete');
    }

    // ============== Render ==============
    render() {
      const ctx = this.ctx;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, this.viewW, this.viewH);

      if (this.state === 'menu') {
        ctx.fillStyle = '#0a1f15';
        ctx.fillRect(0, 0, this.viewW, this.viewH);
        return;
      }

      if (!this.level) return;

      // Apply screen shake
      const shake = window.Effects ? window.Effects.getShakeOffset() : { x: 0, y: 0 };

      // Background by biome
      if (this.level.biome === 'forest') {
        window.Sprites.drawForestBg(ctx, this.viewW, this.viewH, this.t, this.cam.x, this.cam.y);
      } else if (this.level.biome === 'river') {
        window.Sprites.drawRiverBg(ctx, this.viewW, this.viewH, this.t * 60);
      } else if (this.level.biome === 'village') {
        window.Sprites.drawVillageBg(ctx, this.viewW, this.viewH, this.t, this.cam.x, this.cam.y);
      }

      // World transform with shake
      ctx.save();
      ctx.translate(-this.cam.x + shake.x, -this.cam.y + shake.y);

      // Decorations sorted by y for depth
      const drawables = [];
      for (const d of this.decorations) drawables.push({ y: d.y, draw: () => this.drawDecoration(d) });
      for (const h of this.houses) drawables.push({ y: h.y, draw: () => h.render(ctx) });
      for (const c of this.crates) drawables.push({ y: c.y, draw: () => c.render(ctx) });
      for (const p of this.pickups) drawables.push({ y: p.y, draw: () => p.render(ctx) });
      for (const a of this.animals) drawables.push({ y: a.y, draw: () => a.render(ctx) });
      drawables.push({ y: this.player.y, draw: () => this.player.render(ctx) });
      for (const b of this.bullets) drawables.push({ y: b.y, draw: () => b.render(ctx) });
      drawables.sort((a, b) => a.y - b.y);
      for (const d of drawables) d.draw();

      // Particles on top
      for (const p of this.particles) p.render(ctx);

      // Environmental particles (leaves, dust, fireflies, smoke)
      if (window.Effects) {
        window.Effects.renderEnvParticles(ctx, this.cam.x - shake.x, this.cam.y - shake.y);
      }

      // World border
      ctx.strokeStyle = 'rgba(244, 196, 48, 0.25)';
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, this.world.w, this.world.h);

      ctx.restore();

      // Post-processing overlays (screen-space)
      if (window.Effects) {
        window.Effects.drawFog(ctx, this.viewW, this.viewH, this.t, this.level.biome);
        window.Effects.drawVignette(ctx, this.viewW, this.viewH);
        window.Effects.drawDamageFlash(ctx, this.viewW, this.viewH);
      }

      // Minimap
      this.drawMinimap(ctx);
    }

    drawDecoration(d) {
      const ctx = this.ctx;
      if (d.type === 'tree') window.Sprites.drawTree(ctx, d.x, d.y, d.seed);
      else if (d.type === 'bush') window.Sprites.drawBush(ctx, d.x, d.y);
      else if (d.type === 'rock') window.Sprites.drawRock(ctx, d.x, d.y);
    }

    drawMinimap(ctx) {
      const size = 110;
      const m = 14;
      const x = this.viewW - size - m;
      const y = this.viewH - size - m;
      ctx.save();
      ctx.fillStyle = 'rgba(10, 31, 21, 0.78)';
      ctx.strokeStyle = 'rgba(244, 196, 48, 0.35)';
      ctx.lineWidth = 1;
      ctx.fillRect(x, y, size, size);
      ctx.strokeRect(x, y, size, size);
      const sx = size / this.world.w;
      const sy = size / this.world.h;
      // animals
      ctx.fillStyle = '#e3493a';
      for (const a of this.animals) {
        ctx.fillRect(x + a.x * sx - 1, y + a.y * sy - 1, 2, 2);
      }
      // houses
      ctx.fillStyle = '#caa472';
      for (const h of this.houses) {
        if (!h.looted) ctx.fillRect(x + h.x * sx - 2, y + h.y * sy - 2, 4, 4);
      }
      // player
      ctx.fillStyle = '#f4c430';
      ctx.beginPath();
      ctx.arc(x + this.player.x * sx, y + this.player.y * sy, 3, 0, Math.PI * 2);
      ctx.fill();
      // viewport
      ctx.strokeStyle = 'rgba(244, 196, 48, 0.6)';
      ctx.strokeRect(x + this.cam.x * sx, y + this.cam.y * sy, this.viewW * sx, this.viewH * sy);
      ctx.restore();
    }

    showToast(msg) {
      this.toastMsg = msg;
      this.toastTimer = 1.5;
      if (this.onToast) this.onToast(msg);
    }

    getHud() {
      if (!this.player || !this.level) return null;
      return {
        level: this.levelIdx + 1,
        levelName: this.level.name,
        score: this.player.score,
        hpPct: this.player.hp / this.player.maxHp,
        ammo: this.player.ammo,
        ammoMax: this.player.maxAmmo,
        ammoPct: this.player.ammo / this.player.maxAmmo,
        target: this.level.objective === 'kill' ? this.killed : this.looted,
        targetMax: this.level.target,
        objective: this.level.objective,
        timeLeft: this.timeLeft,
      };
    }
  }

  window.Game = Game;
})();
