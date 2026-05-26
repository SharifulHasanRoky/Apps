// effects.js — Environmental effects: fog, floating particles, dynamic shadows,
// water reflections, weather, screen shake, dust trails, exhaust smoke.
(function () {
  // === PARTICLE POOL for environment ===
  const ENV_PARTICLES = [];
  const MAX_ENV = 120;

  function spawnEnv(type, x, y, vx, vy, life, size, color, alpha) {
    if (ENV_PARTICLES.length >= MAX_ENV) ENV_PARTICLES.shift();
    ENV_PARTICLES.push({ type, x, y, vx, vy, life, maxLife: life, size, color, alpha: alpha || 1 });
  }

  function updateEnvParticles(dt) {
    for (let i = ENV_PARTICLES.length - 1; i >= 0; i--) {
      const p = ENV_PARTICLES[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.type === 'leaf') {
        p.x += Math.sin(p.life * 3 + p.y * 0.01) * 15 * dt;
        p.vy += 8 * dt; // gravity
      }
      if (p.type === 'firefly') {
        p.x += Math.sin(p.life * 5) * 20 * dt;
        p.y += Math.cos(p.life * 4) * 15 * dt;
      }
      if (p.life <= 0) ENV_PARTICLES.splice(i, 1);
    }
  }

  function renderEnvParticles(ctx, camX, camY) {
    for (const p of ENV_PARTICLES) {
      const sx = p.x - camX;
      const sy = p.y - camY;
      const alpha = Math.max(0, (p.life / p.maxLife)) * p.alpha;
      ctx.save();
      ctx.globalAlpha = alpha;
      if (p.type === 'leaf') {
        ctx.translate(sx, sy);
        ctx.rotate(p.life * 2);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'dust') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size * (1 + (1 - p.life / p.maxLife) * 0.5), 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'firefly') {
        const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, p.size * 3);
        glow.addColorStop(0, 'rgba(200,255,100,0.8)');
        glow.addColorStop(0.5, 'rgba(150,220,50,0.3)');
        glow.addColorStop(1, 'rgba(100,180,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'splash') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'smoke') {
        ctx.fillStyle = p.color;
        const s = p.size * (1 + (1 - p.life / p.maxLife) * 2);
        ctx.beginPath();
        ctx.arc(sx, sy, s, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }


  // === FOG SYSTEM ===
  function drawFog(ctx, w, h, t, biome) {
    if (biome === 'river') {
      // Thick misty fog for river
      ctx.fillStyle = 'rgba(180,220,240,0.06)';
      for (let i = 0; i < 4; i++) {
        const fx = (t * 8 + i * 220) % (w + 400) - 200;
        const fy = h * 0.2 + Math.sin(t * 0.2 + i) * 50;
        ctx.beginPath();
        ctx.ellipse(fx, fy, 250 + i * 40, 60 + i * 15, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (biome === 'forest') {
      // Ground fog wisps
      ctx.fillStyle = 'rgba(150,200,160,0.04)';
      for (let i = 0; i < 6; i++) {
        const fx = (t * 5 + i * 180) % (w + 300) - 150;
        const fy = h * (0.6 + i * 0.06) + Math.sin(t * 0.15 + i * 1.3) * 30;
        ctx.beginPath();
        ctx.ellipse(fx, fy, 180 + i * 30, 35 + i * 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (biome === 'village') {
      // Dusty haze
      ctx.fillStyle = 'rgba(140,120,80,0.04)';
      for (let i = 0; i < 3; i++) {
        const fx = (t * 10 + i * 280) % (w + 300) - 150;
        const fy = h * 0.4 + Math.sin(t * 0.25 + i) * 40;
        ctx.beginPath();
        ctx.ellipse(fx, fy, 200, 50, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // === AMBIENT PARTICLE SPAWNER ===
  // Call each frame; internally rate-limits spawning
  let leafTimer = 0;
  let fireflyTimer = 0;
  let dustTimer = 0;

  function spawnAmbient(dt, biome, camX, camY, viewW, viewH) {
    if (biome === 'forest') {
      // Falling leaves
      leafTimer += dt;
      if (leafTimer > 0.4) {
        leafTimer = 0;
        const lx = camX + Math.random() * viewW;
        const ly = camY - 20;
        const colors = ['#3a7a3a', '#5a9a3a', '#8a6a2a', '#6a5a1a', '#2a6a2a'];
        spawnEnv('leaf', lx, ly, 10 + Math.random() * 20, 20 + Math.random() * 30,
          4 + Math.random() * 3, 3 + Math.random() * 2,
          colors[Math.floor(Math.random() * colors.length)], 0.7);
      }
      // Fireflies (evening atmosphere)
      fireflyTimer += dt;
      if (fireflyTimer > 1.2) {
        fireflyTimer = 0;
        const fx = camX + Math.random() * viewW;
        const fy = camY + viewH * 0.3 + Math.random() * viewH * 0.5;
        spawnEnv('firefly', fx, fy, 0, 0, 5 + Math.random() * 3, 2, '#aaff44', 0.6);
      }
    } else if (biome === 'village') {
      // Dust motes
      dustTimer += dt;
      if (dustTimer > 0.3) {
        dustTimer = 0;
        const dx = camX + Math.random() * viewW;
        const dy = camY + Math.random() * viewH;
        spawnEnv('dust', dx, dy, 5 + Math.random() * 10, -3 + Math.random() * 6,
          3 + Math.random() * 2, 1.5 + Math.random(), 'rgba(160,140,100,0.4)', 0.5);
      }
    } else if (biome === 'river') {
      // Water droplets / mist
      dustTimer += dt;
      if (dustTimer > 0.5) {
        dustTimer = 0;
        const dx = camX + Math.random() * viewW;
        const dy = camY + Math.random() * viewH;
        spawnEnv('dust', dx, dy, Math.random() * 8, -10 - Math.random() * 5,
          2 + Math.random() * 2, 1 + Math.random(), 'rgba(180,220,255,0.35)', 0.5);
      }
    }
  }


  // === PLAYER TRAIL EFFECTS ===
  let trailTimer = 0;

  function spawnPlayerTrail(dt, player, biome) {
    const speed = Math.hypot(window.Input.move.x, window.Input.move.y);
    if (speed < 0.1) return;
    trailTimer += dt;
    const interval = player.vehicle === 'car' ? 0.06 :
                     player.vehicle === 'bike' ? 0.08 :
                     player.vehicle === 'boat' ? 0.05 : 0.12;
    if (trailTimer < interval) return;
    trailTimer = 0;

    const behind = Math.PI + player.angle;
    const bx = player.x + Math.cos(behind) * 12;
    const by = player.y + Math.sin(behind) * 12;

    if (player.vehicle === 'boat') {
      // Water splash wake
      for (let i = 0; i < 3; i++) {
        const a = behind + (Math.random() - 0.5) * 1.2;
        const s = 30 + Math.random() * 50;
        spawnEnv('splash', bx + Math.random() * 6 - 3, by + Math.random() * 6 - 3,
          Math.cos(a) * s, Math.sin(a) * s,
          0.6 + Math.random() * 0.3, 2 + Math.random() * 2,
          'rgba(180,230,255,0.6)', 0.7);
      }
    } else if (player.vehicle === 'car') {
      // Exhaust smoke
      spawnEnv('smoke', bx, by,
        Math.cos(behind) * 15 + (Math.random() - 0.5) * 10,
        Math.sin(behind) * 15 + (Math.random() - 0.5) * 10,
        1.2 + Math.random() * 0.5, 3 + Math.random() * 2,
        'rgba(80,80,80,0.3)', 0.5);
      // Dirt kick-up
      if (biome !== 'river') {
        for (let i = 0; i < 2; i++) {
          const a = behind + (Math.random() - 0.5) * 0.8;
          spawnEnv('dust', bx + Math.random() * 8 - 4, by + Math.random() * 8 - 4,
            Math.cos(a) * 40, Math.sin(a) * 40,
            0.5 + Math.random() * 0.3, 2 + Math.random() * 2,
            'rgba(120,90,50,0.5)', 0.6);
        }
      }
    } else if (player.vehicle === 'bike') {
      // Light dust
      spawnEnv('dust', bx, by,
        Math.cos(behind) * 25 + (Math.random() - 0.5) * 10,
        Math.sin(behind) * 25 + (Math.random() - 0.5) * 10,
        0.6 + Math.random() * 0.3, 2 + Math.random(),
        'rgba(100,80,50,0.4)', 0.5);
    } else {
      // Footstep dust (on foot)
      spawnEnv('dust', bx + (Math.random() - 0.5) * 6, by + (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15,
        0.5 + Math.random() * 0.2, 1.5 + Math.random(),
        biome === 'village' ? 'rgba(120,90,50,0.35)' : 'rgba(60,80,40,0.3)', 0.4);
    }
  }

  // === MUZZLE SMOKE (lingering after shots) ===
  function spawnMuzzleSmoke(player) {
    const mx = player.x + Math.cos(player.angle) * 28;
    const my = player.y + Math.sin(player.angle) * 28;
    for (let i = 0; i < 3; i++) {
      spawnEnv('smoke', mx, my,
        Math.cos(player.angle) * 20 + (Math.random() - 0.5) * 15,
        Math.sin(player.angle) * 20 + (Math.random() - 0.5) * 15 - 10,
        0.8 + Math.random() * 0.4, 2 + Math.random() * 2,
        'rgba(200,200,200,0.25)', 0.4);
    }
  }


  // === SCREEN SHAKE ===
  let shakeIntensity = 0;
  let shakeDecay = 0;
  let shakeOffsetX = 0;
  let shakeOffsetY = 0;

  function triggerShake(intensity) {
    shakeIntensity = Math.max(shakeIntensity, intensity);
    shakeDecay = 0.3;
  }

  function updateShake(dt) {
    if (shakeDecay > 0) {
      shakeDecay -= dt;
      const t = Math.max(0, shakeDecay / 0.3);
      const mag = shakeIntensity * t;
      shakeOffsetX = (Math.random() - 0.5) * mag * 2;
      shakeOffsetY = (Math.random() - 0.5) * mag * 2;
    } else {
      shakeIntensity = 0;
      shakeOffsetX = 0;
      shakeOffsetY = 0;
    }
  }

  function getShakeOffset() {
    return { x: shakeOffsetX, y: shakeOffsetY };
  }

  // === VIGNETTE OVERLAY ===
  function drawVignette(ctx, w, h) {
    const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.75);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.7, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  // === DAMAGE FLASH ===
  let damageFlashAlpha = 0;

  function triggerDamageFlash() {
    damageFlashAlpha = 0.4;
  }

  function updateDamageFlash(dt) {
    damageFlashAlpha = Math.max(0, damageFlashAlpha - dt * 1.5);
  }

  function drawDamageFlash(ctx, w, h) {
    if (damageFlashAlpha <= 0) return;
    ctx.fillStyle = `rgba(200,30,30,${damageFlashAlpha})`;
    ctx.fillRect(0, 0, w, h);
  }

  // === DYNAMIC SHADOW (per entity) ===
  function drawDynamicShadow(ctx, x, y, rx, ry, lightAngle, dist) {
    ctx.save();
    const ox = Math.cos(lightAngle) * dist * 0.3;
    const oy = Math.sin(lightAngle) * dist * 0.3 + ry * 0.5;
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(x + ox, y + oy, rx * 1.2, ry * 0.6, lightAngle * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // === EXPORTS ===
  window.Effects = {
    ENV_PARTICLES,
    updateEnvParticles,
    renderEnvParticles,
    drawFog,
    spawnAmbient,
    spawnPlayerTrail,
    spawnMuzzleSmoke,
    triggerShake,
    updateShake,
    getShakeOffset,
    drawVignette,
    triggerDamageFlash,
    updateDamageFlash,
    drawDamageFlash,
    drawDynamicShadow,
    spawnEnv,
  };
})();
