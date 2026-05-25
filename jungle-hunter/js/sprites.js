// sprites.js — Realistic procedural game art with detailed shading, textures, and anatomy.
// All drawn via Canvas 2D — no external image assets needed.
(function () {
  // === UTILITY HELPERS ===
  function withTransform(ctx, x, y, angle, scale, fn) {
    ctx.save();
    ctx.translate(x, y);
    if (angle) ctx.rotate(angle);
    if (scale && scale !== 1) ctx.scale(scale, scale);
    fn(ctx);
    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  // Seeded pseudo-random for deterministic decoration
  function seededRand(seed) {
    let s = seed;
    return function() {
      s = (s * 16807 + 0) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  // Gradient fill helper
  function gradFill(ctx, x1, y1, x2, y2, stops) {
    const g = ctx.createLinearGradient(x1, y1, x2, y2);
    stops.forEach(([offset, color]) => g.addColorStop(offset, color));
    return g;
  }

  function radGrad(ctx, cx, cy, r, stops) {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    stops.forEach(([offset, color]) => g.addColorStop(offset, color));
    return g;
  }

  // Soft shadow beneath any entity
  function drawGroundShadow(ctx, rx, ry, alpha = 0.4) {
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.beginPath();
    ctx.ellipse(0, ry * 0.3, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }


  // === ENVIRONMENT: TREES ===
  function drawTree(ctx, x, y, seed = 0, scale = 1) {
    withTransform(ctx, x, y, 0, scale, (c) => {
      const rng = seededRand(seed * 137 + 42);
      // Ground shadow
      drawGroundShadow(c, 28, 10, 0.35);

      // Trunk with bark texture
      const trunkW = 10 + rng() * 4;
      const trunkH = 22 + rng() * 10;
      const trunkGrad = gradFill(c, -trunkW/2, -trunkH, trunkW/2, 0,
        [[0, '#4a2f14'], [0.3, '#6b4423'], [0.7, '#5a3a1a'], [1, '#3d2510']]);
      c.fillStyle = trunkGrad;
      c.fillRect(-trunkW/2, -trunkH + 4, trunkW, trunkH);
      // Bark lines
      c.strokeStyle = 'rgba(0,0,0,0.3)';
      c.lineWidth = 0.8;
      for (let i = 0; i < 5; i++) {
        const bx = -trunkW/2 + rng() * trunkW;
        const by = -trunkH + 4 + rng() * trunkH;
        c.beginPath();
        c.moveTo(bx, by);
        c.lineTo(bx + (rng() - 0.5) * 3, by + 4 + rng() * 6);
        c.stroke();
      }
      // Root bulge
      c.fillStyle = '#3d2510';
      c.beginPath();
      c.ellipse(0, 2, trunkW * 0.7, 4, 0, 0, Math.PI * 2);
      c.fill();

      // Foliage - multiple layered clusters with gradient
      const baseY = -trunkH - 8;
      const foliageR = 20 + rng() * 12;
      const clusters = 4 + Math.floor(rng() * 3);
      const greens = ['#1b5e3a', '#237a4d', '#1a6e42', '#2d8f5f', '#155f3f', '#0f4a2d'];
      for (let i = 0; i < clusters; i++) {
        const cx = (rng() - 0.5) * foliageR * 1.2;
        const cy = baseY + (rng() - 0.5) * foliageR * 0.8;
        const cr = foliageR * (0.5 + rng() * 0.5);
        const col = greens[Math.floor(rng() * greens.length)];
        c.fillStyle = radGrad(c, cx - cr * 0.3, cy - cr * 0.3, cr * 1.2,
          [[0, col], [0.7, col], [1, 'rgba(0,30,15,0.8)']]);
        c.beginPath();
        c.arc(cx, cy, cr, 0, Math.PI * 2);
        c.fill();
      }
      // Highlight on top
      c.fillStyle = 'rgba(180,255,200,0.12)';
      c.beginPath();
      c.arc(-foliageR * 0.2, baseY - foliageR * 0.3, foliageR * 0.4, 0, Math.PI * 2);
      c.fill();
      // Leaf detail dots
      c.fillStyle = 'rgba(50,120,70,0.6)';
      for (let i = 0; i < 12; i++) {
        const lx = (rng() - 0.5) * foliageR * 2;
        const ly = baseY + (rng() - 0.5) * foliageR * 1.5;
        c.beginPath();
        c.arc(lx, ly, 1.5 + rng() * 2, 0, Math.PI * 2);
        c.fill();
      }
    });
  }


  // === ENVIRONMENT: BUSH ===
  function drawBush(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    drawGroundShadow(ctx, 18, 5, 0.3);
    // Multiple leaf clusters with gradients
    const clusters = [
      { cx: -8, cy: -2, r: 11 }, { cx: 7, cy: -1, r: 10 },
      { cx: 0, cy: -6, r: 13 }, { cx: -3, cy: 2, r: 8 },
    ];
    clusters.forEach(({cx, cy, r}) => {
      ctx.fillStyle = radGrad(ctx, cx - r*0.3, cy - r*0.3, r*1.3,
        [[0, '#2d8f5f'], [0.5, '#1a6e44'], [1, '#0d4a2a']]);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    });
    // Small berries
    ctx.fillStyle = '#c0392b';
    [[-4, -4], [3, -6], [6, -2]].forEach(([bx, by]) => {
      ctx.beginPath(); ctx.arc(bx, by, 1.8, 0, Math.PI * 2); ctx.fill();
    });
    // Highlight
    ctx.fillStyle = 'rgba(180,255,200,0.1)';
    ctx.beginPath(); ctx.arc(-3, -8, 5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // === ENVIRONMENT: ROCK ===
  function drawRock(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    drawGroundShadow(ctx, 16, 6, 0.4);
    // Main body with mineral gradient
    ctx.fillStyle = radGrad(ctx, -4, -4, 18,
      [[0, '#a0a5aa'], [0.4, '#7d8087'], [0.8, '#5a5d63'], [1, '#3a3d42']]);
    ctx.beginPath();
    ctx.moveTo(-12, 3); ctx.quadraticCurveTo(-14, -4, -8, -8);
    ctx.quadraticCurveTo(-2, -11, 6, -8);
    ctx.quadraticCurveTo(14, -5, 13, 2);
    ctx.quadraticCurveTo(12, 7, 4, 8);
    ctx.quadraticCurveTo(-6, 9, -12, 3);
    ctx.fill();
    // Cracks
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-3, -6); ctx.lineTo(1, -1); ctx.lineTo(-1, 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(5, -5); ctx.lineTo(7, 0);
    ctx.stroke();
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.ellipse(-4, -5, 5, 3, -0.3, 0, Math.PI * 2); ctx.fill();
    // Moss
    ctx.fillStyle = 'rgba(50,120,60,0.4)';
    ctx.beginPath(); ctx.ellipse(4, 4, 4, 2.5, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }


  // === ENVIRONMENT: WATER PATCH ===
  function drawWaterPatch(ctx, x, y, w, h, t) {
    ctx.save();
    const grad = gradFill(ctx, x, y, x, y + h,
      [[0, '#1a7a9e'], [0.3, '#12607d'], [0.7, '#0a4a5f'], [1, '#063040']]);
    ctx.fillStyle = grad;
    roundRect(ctx, x, y, w, h, 24);
    ctx.fill();
    // Depth shimmer
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    for (let i = 0; i < 4; i++) {
      const sx = x + (i * 97 + t * 20) % w;
      const sy = y + 10 + (i * 51) % (h - 20);
      ctx.beginPath();
      ctx.ellipse(sx, sy, 30 + Math.sin(t + i) * 8, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Ripples
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 8; i++) {
      const rx = x + (i * 73 + t * 35) % w;
      const ry = y + (i * 41 + 20) % (h - 20);
      const rr = 5 + Math.sin(t * 1.5 + i * 2) * 3;
      ctx.beginPath(); ctx.arc(rx, ry, rr, 0, Math.PI * 2); ctx.stroke();
    }
    // Lilypads
    ctx.fillStyle = '#2d8f5f';
    for (let i = 0; i < 3; i++) {
      const lx = x + 30 + (i * 127) % (w - 60);
      const ly = y + 20 + (i * 83) % (h - 40);
      ctx.beginPath(); ctx.ellipse(lx, ly, 8, 5, i * 0.7, 0, Math.PI * 1.7); ctx.fill();
    }
    ctx.restore();
  }

  // === ENVIRONMENT: HOUSE ===
  function drawHouse(ctx, x, y, looted = false) {
    withTransform(ctx, x, y, 0, 1, (c) => {
      drawGroundShadow(c, 42, 10, 0.45);
      // Walls with texture
      const wallCol = looted ? '#5a4a3a' : '#d4a86a';
      const wallDark = looted ? '#3a2a1a' : '#b08545';
      c.fillStyle = gradFill(c, -34, -12, 34, 30,
        [[0, wallCol], [1, wallDark]]);
      c.fillRect(-34, -12, 68, 42);
      // Brick pattern
      c.strokeStyle = looted ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.1)';
      c.lineWidth = 0.5;
      for (let row = 0; row < 7; row++) {
        const ry = -12 + row * 6;
        c.beginPath(); c.moveTo(-34, ry); c.lineTo(34, ry); c.stroke();
        const offset = row % 2 === 0 ? 0 : 8;
        for (let col = offset - 34; col < 34; col += 16) {
          c.beginPath(); c.moveTo(col, ry); c.lineTo(col, ry + 6); c.stroke();
        }
      }
      // Roof with tiles
      const roofCol = looted ? '#4a3a2a' : '#8b3a1f';
      c.fillStyle = gradFill(c, 0, -40, 0, -12,
        [[0, looted ? '#5a4a3a' : '#a04525'], [1, roofCol]]);
      c.beginPath();
      c.moveTo(-40, -12); c.lineTo(0, -40); c.lineTo(40, -12);
      c.closePath(); c.fill();
      // Roof tiles
      c.strokeStyle = 'rgba(0,0,0,0.2)';
      c.lineWidth = 0.6;
      for (let i = 0; i < 5; i++) {
        const ty = -12 - (i + 1) * 5.5;
        const hw = 40 - i * 8;
        c.beginPath(); c.moveTo(-hw, ty + 5.5); c.lineTo(hw, ty + 5.5); c.stroke();
      }
      // Door
      c.fillStyle = looted ? '#1a1008' : '#5a3a1f';
      roundRect(c, -9, 4, 18, 26, 3);
      c.fill();
      c.fillStyle = looted ? '#000' : '#b8860b';
      c.beginPath(); c.arc(6, 18, 1.5, 0, Math.PI * 2); c.fill(); // knob
      // Windows with glow
      const winCol = looted ? '#0a0a0a' : '#7ec8e8';
      [[-26, -2], [14, -2]].forEach(([wx, wy]) => {
        c.fillStyle = winCol;
        c.fillRect(wx, wy, 14, 14);
        c.strokeStyle = looted ? '#2a1a0a' : '#5a3a1f';
        c.lineWidth = 1.5; c.strokeRect(wx, wy, 14, 14);
        // Cross pane
        c.beginPath();
        c.moveTo(wx + 7, wy); c.lineTo(wx + 7, wy + 14);
        c.moveTo(wx, wy + 7); c.lineTo(wx + 14, wy + 7);
        c.stroke();
        if (!looted) {
          c.fillStyle = 'rgba(255,240,180,0.15)';
          c.fillRect(wx, wy, 14, 14);
        }
      });
      // Chimney
      c.fillStyle = '#6b4423';
      c.fillRect(16, -38, 8, 14);
      if (looted) {
        c.fillStyle = 'rgba(244, 196, 48, 0.9)';
        c.font = 'bold 11px sans-serif';
        c.textAlign = 'center';
        c.fillText('LOOTED', 0, 22);
      }
    });
  }


  // === ENVIRONMENT: CRATE ===
  function drawCrate(ctx, x, y) {
    withTransform(ctx, x, y, 0, 1, (c) => {
      drawGroundShadow(c, 18, 5, 0.4);
      // 3D box with wood grain
      c.fillStyle = gradFill(c, -14, -14, 14, 14,
        [[0, '#c4884e'], [0.5, '#a47148'], [1, '#7a5230']]);
      c.fillRect(-14, -14, 28, 28);
      // Wood grain horizontal
      c.strokeStyle = 'rgba(90,50,20,0.4)';
      c.lineWidth = 0.8;
      for (let i = -12; i < 14; i += 4) {
        c.beginPath(); c.moveTo(-14, i); c.lineTo(14, i); c.stroke();
      }
      // Metal bands
      c.fillStyle = '#555';
      c.fillRect(-15, -3, 30, 3);
      c.fillRect(-15, 8, 30, 3);
      // Rivets
      c.fillStyle = '#888';
      [[-12, -1.5], [12, -1.5], [-12, 9.5], [12, 9.5]].forEach(([rx, ry]) => {
        c.beginPath(); c.arc(rx, ry, 1.5, 0, Math.PI * 2); c.fill();
      });
      // Exclamation mark
      c.fillStyle = 'rgba(200,50,0,0.7)';
      c.font = 'bold 14px sans-serif';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('!', 0, -5);
      // Border
      c.strokeStyle = '#5a3a1f';
      c.lineWidth = 2;
      c.strokeRect(-14, -14, 28, 28);
    });
  }

  // === PICKUPS ===
  function drawCoin(ctx, x, y, t) {
    const bob = Math.sin(t * 0.005 + x * 0.1) * 3;
    ctx.save();
    ctx.translate(x, y + bob);
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(0, 10, 8, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    // Coin body with metallic gradient
    ctx.fillStyle = radGrad(ctx, -2, -2, 9,
      [[0, '#ffe066'], [0.5, '#f4c430'], [0.8, '#b8860b'], [1, '#8b6914']]);
    ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
    // Rim
    ctx.strokeStyle = '#8b6914';
    ctx.lineWidth = 1.5; ctx.stroke();
    // Inner circle
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(0, 0, 5.5, 0, Math.PI * 2); ctx.stroke();
    // Dollar sign
    ctx.fillStyle = '#8b6914';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 0.5);
    // Sparkle
    ctx.fillStyle = 'rgba(255,255,220,0.7)';
    const sparkAngle = t * 0.003;
    ctx.beginPath();
    ctx.arc(Math.cos(sparkAngle) * 4, Math.sin(sparkAngle) * 4 - 2, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawAmmoBox(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(0, 8, 12, 3, 0, 0, Math.PI * 2); ctx.fill();
    // Box body
    ctx.fillStyle = gradFill(ctx, -11, -9, 11, 7,
      [[0, '#4a6a4a'], [1, '#2a4a2a']]);
    roundRect(ctx, -11, -9, 22, 16, 3); ctx.fill();
    // Metal clasp
    ctx.fillStyle = '#888'; ctx.fillRect(-3, -10, 6, 2);
    // Label
    ctx.fillStyle = '#f4c430';
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('AMMO', 0, 0);
    // Bullet icons
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(-7, 4, 2, 4);
    ctx.fillRect(-3, 4, 2, 4);
    ctx.fillRect(1, 4, 2, 4);
    ctx.fillRect(5, 4, 2, 4);
    ctx.restore();
  }

  function drawHeart(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(0, 9, 9, 3, 0, 0, Math.PI * 2); ctx.fill();
    // Heart with glossy gradient
    ctx.fillStyle = radGrad(ctx, -3, -4, 14,
      [[0, '#ff6b6b'], [0.5, '#e3493a'], [1, '#8b1a1a']]);
    ctx.beginPath();
    ctx.moveTo(0, 7);
    ctx.bezierCurveTo(-12, -2, -12, -12, 0, -5);
    ctx.bezierCurveTo(12, -12, 12, -2, 0, 7);
    ctx.fill();
    // Glossy highlight
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.ellipse(-3, -6, 3, 2, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }


  // === PLAYER: ON FOOT ===
  function drawPlayerOnFoot(ctx, angle, walkPhase) {
    ctx.save(); ctx.rotate(angle);
    drawGroundShadow(ctx, 16, 8, 0.45);
    const legAnim = Math.sin(walkPhase) * 3;
    // Legs
    ctx.fillStyle = '#3a4a2a';
    ctx.fillRect(-4, -8 + legAnim, 4, 7);
    ctx.fillRect(-4, 4 - legAnim, 4, 7);
    // Boots
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(-5, -2 + legAnim, 5, 3);
    ctx.fillRect(-5, 9 - legAnim, 5, 3);
    // Torso with camo pattern
    ctx.fillStyle = radGrad(ctx, 0, 0, 13,
      [[0, '#6d7d5a'], [0.6, '#5d6d4a'], [1, '#4a5a3a']]);
    ctx.beginPath(); ctx.ellipse(0, 0, 10, 8, 0, 0, Math.PI * 2); ctx.fill();
    // Camo spots
    ctx.fillStyle = 'rgba(40,50,30,0.4)';
    [[-3,-3],[4,2],[-2,4],[5,-4]].forEach(([cx,cy]) => {
      ctx.beginPath(); ctx.ellipse(cx, cy, 2.5, 1.5, cx*0.3, 0, Math.PI * 2); ctx.fill();
    });
    // Belt
    ctx.fillStyle = '#4a3a1a'; ctx.fillRect(-8, -1, 16, 2);
    ctx.fillStyle = '#b8860b'; ctx.fillRect(-1, -1.5, 3, 3); // buckle
    // Backpack
    ctx.fillStyle = gradFill(ctx, -10, -5, -5, 5,
      [[0, '#8b6f47'], [1, '#5a4a2a']]);
    ctx.fillRect(-11, -5, 6, 10);
    ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 0.8;
    ctx.strokeRect(-11, -5, 6, 10);
    // Head
    ctx.fillStyle = radGrad(ctx, 5, -1, 7,
      [[0, '#e8c49a'], [0.8, '#d4a373'], [1, '#b8865a']]);
    ctx.beginPath(); ctx.arc(5, 0, 5, 0, Math.PI * 2); ctx.fill();
    // Safari hat
    ctx.fillStyle = '#3a2a0a';
    ctx.beginPath();
    ctx.ellipse(5, -3, 7, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(2, -6, 6, 4);
    // Gun - rifle with detail
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(9, -2.5, 20, 5); // barrel
    ctx.fillStyle = '#333';
    ctx.fillRect(8, -3.5, 6, 7); // receiver
    ctx.fillStyle = '#5a3a1f';
    ctx.fillRect(7, -2, 4, 4); // stock grip
    // Muzzle
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(28, -1.5, 3, 3);
    // Scope
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.ellipse(18, -4, 3, 1.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(100,180,255,0.4)';
    ctx.beginPath(); ctx.arc(19, -4, 1, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }


  // === PLAYER: ON BIKE ===
  function drawPlayerOnBike(ctx, angle) {
    ctx.save(); ctx.rotate(angle);
    drawGroundShadow(ctx, 26, 10, 0.45);
    // Wheels with spokes
    [[-16, 0], [16, 0]].forEach(([wx, wy]) => {
      ctx.fillStyle = '#0a0a0a';
      ctx.beginPath(); ctx.arc(wx, wy, 7, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#444'; ctx.lineWidth = 1.5; ctx.stroke();
      // Spokes
      ctx.strokeStyle = '#666'; ctx.lineWidth = 0.5;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wx + Math.cos(a) * 5.5, wy + Math.sin(a) * 5.5);
        ctx.stroke();
      }
      // Hub
      ctx.fillStyle = '#888';
      ctx.beginPath(); ctx.arc(wx, wy, 2, 0, Math.PI * 2); ctx.fill();
    });
    // Frame
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-16, 0); ctx.lineTo(-4, -4); ctx.lineTo(6, -4); ctx.lineTo(16, 0);
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-4, -4); ctx.lineTo(0, 2); ctx.lineTo(6, -4); ctx.stroke();
    // Engine block
    ctx.fillStyle = gradFill(ctx, -4, -2, 6, 4,
      [[0, '#444'], [1, '#222']]);
    ctx.fillRect(-4, -2, 10, 5);
    // Exhaust pipe
    ctx.fillStyle = '#555';
    ctx.fillRect(-14, 3, 10, 2);
    // Rider torso
    ctx.fillStyle = radGrad(ctx, 0, -5, 10,
      [[0, '#5d6d4a'], [1, '#3a4a2a']]);
    ctx.beginPath(); ctx.ellipse(0, -5, 7, 6, 0, 0, Math.PI * 2); ctx.fill();
    // Head
    ctx.fillStyle = '#d4a373';
    ctx.beginPath(); ctx.arc(3, -6, 4, 0, Math.PI * 2); ctx.fill();
    // Helmet
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(3, -7.5, 4.5, Math.PI, 0); ctx.fill();
    // Visor
    ctx.fillStyle = 'rgba(100,180,255,0.5)';
    ctx.fillRect(5, -8, 3, 3);
    // Gun mounted
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(8, -5, 16, 3);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(23, -4.5, 3, 2);
    ctx.restore();
  }

  // === PLAYER: IN CAR ===
  function drawPlayerInCar(ctx, angle) {
    ctx.save(); ctx.rotate(angle);
    drawGroundShadow(ctx, 34, 14, 0.5);
    // Car body with metallic paint
    ctx.fillStyle = gradFill(ctx, -30, -16, 30, 16,
      [[0, '#8b3a2a'], [0.3, '#a04530'], [0.7, '#7a3020'], [1, '#5a2015']]);
    roundRect(ctx, -30, -15, 60, 30, 6); ctx.fill();
    // Metal sheen
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(-28, -14, 56, 8);
    // Hood
    ctx.fillStyle = gradFill(ctx, 16, -13, 30, 13,
      [[0, '#6a2515'], [1, '#4a1510']]);
    ctx.fillRect(16, -13, 14, 26);
    // Windshield
    ctx.fillStyle = gradFill(ctx, 4, -11, 14, 11,
      [[0, 'rgba(140,220,255,0.7)'], [1, 'rgba(80,160,200,0.5)']]);
    ctx.fillRect(4, -11, 10, 22);
    // Side windows
    ctx.fillStyle = 'rgba(100,180,220,0.4)';
    ctx.fillRect(-14, -11, 14, 22);
    // Wheels with tread
    [[- 22, -17], [-22, 13], [14, -17], [14, 13]].forEach(([wx, wy]) => {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(wx, wy, 10, 5);
      ctx.fillStyle = '#333';
      ctx.fillRect(wx + 1, wy + 1, 8, 3);
    });
    // Headlights
    ctx.fillStyle = '#ffe066';
    ctx.beginPath(); ctx.arc(30, -8, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(30, 8, 2.5, 0, Math.PI * 2); ctx.fill();
    // Roof gun turret
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.arc(-2, 0, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(2, -2, 24, 4);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(25, -1.5, 4, 3);
    // Bumper
    ctx.fillStyle = '#444';
    ctx.fillRect(28, -14, 3, 28);
    ctx.restore();
  }


  // === PLAYER: IN BOAT ===
  function drawPlayerInBoat(ctx, angle) {
    ctx.save(); ctx.rotate(angle);
    drawGroundShadow(ctx, 32, 12, 0.4);
    // Hull with wood grain
    ctx.fillStyle = gradFill(ctx, -24, -12, 24, 12,
      [[0, '#a0703a'], [0.5, '#8b5a2b'], [1, '#6b4020']]);
    ctx.beginPath();
    ctx.moveTo(-24, -10); ctx.quadraticCurveTo(-28, 0, -24, 10);
    ctx.lineTo(22, 9); ctx.quadraticCurveTo(30, 0, 22, -9);
    ctx.closePath(); ctx.fill();
    // Hull outline
    ctx.strokeStyle = '#4a2a10'; ctx.lineWidth = 2; ctx.stroke();
    // Planks
    ctx.strokeStyle = 'rgba(60,30,10,0.35)'; ctx.lineWidth = 0.8;
    for (let i = -18; i < 22; i += 8) {
      ctx.beginPath(); ctx.moveTo(i, -9); ctx.lineTo(i, 9); ctx.stroke();
    }
    // Water line
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-22, 6); ctx.quadraticCurveTo(0, 8, 22, 6); ctx.stroke();
    // Rider
    ctx.fillStyle = radGrad(ctx, 0, -2, 9,
      [[0, '#5d6d4a'], [1, '#3a4a2a']]);
    ctx.beginPath(); ctx.ellipse(0, -1, 7, 6, 0, 0, Math.PI * 2); ctx.fill();
    // Head
    ctx.fillStyle = '#d4a373';
    ctx.beginPath(); ctx.arc(3, -2, 3.5, 0, Math.PI * 2); ctx.fill();
    // Hat
    ctx.fillStyle = '#2a1a0a';
    ctx.beginPath(); ctx.ellipse(3, -4, 5, 1.5, 0, 0, Math.PI * 2); ctx.fill();
    // Gun
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(7, -3, 18, 3);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(24, -2.5, 3, 2);
    // Motor at back
    ctx.fillStyle = '#444';
    ctx.fillRect(-24, -4, 5, 8);
    ctx.fillStyle = '#222';
    ctx.fillRect(-28, -2, 4, 4);
    ctx.restore();
  }


  // === ANIMALS: DEER ===
  function drawDeer(ctx, angle, runPhase) {
    ctx.save(); ctx.rotate(angle);
    drawGroundShadow(ctx, 20, 8, 0.4);
    const legAnim = Math.sin(runPhase) * 3;
    // Legs with joints
    ctx.fillStyle = '#7a4a2a';
    [[-8, -8], [8, -8], [-8, 5], [8, 5]].forEach(([lx, ly], i) => {
      const off = i < 2 ? legAnim : -legAnim;
      ctx.fillRect(lx, ly + off, 2.5, 8);
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(lx - 0.5, ly + off + 7, 3.5, 2); // hoof
      ctx.fillStyle = '#7a4a2a';
    });
    // Body with fur gradient
    ctx.fillStyle = radGrad(ctx, -2, -2, 16,
      [[0, '#c47a3a'], [0.5, '#a0622d'], [0.9, '#8a5020'], [1, '#6a3a15']]);
    ctx.beginPath(); ctx.ellipse(0, 0, 15, 8, 0, 0, Math.PI * 2); ctx.fill();
    // Belly lighter
    ctx.fillStyle = 'rgba(220,180,140,0.35)';
    ctx.beginPath(); ctx.ellipse(0, 3, 10, 4, 0, 0, Math.PI * 2); ctx.fill();
    // Fur texture
    ctx.fillStyle = 'rgba(60,30,10,0.2)';
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(-10 + i * 3, -3 + (i % 3) * 2, 1, 0, Math.PI * 2);
      ctx.fill();
    }
    // White spots (fawn)
    ctx.fillStyle = 'rgba(255,255,240,0.5)';
    [[-4,-3],[2,1],[6,-2],[-1,3],[4,-5]].forEach(([sx,sy]) => {
      ctx.beginPath(); ctx.arc(sx, sy, 1.3, 0, Math.PI * 2); ctx.fill();
    });
    // Neck
    ctx.fillStyle = '#a0622d';
    ctx.beginPath();
    ctx.ellipse(11, -1, 5, 4, -0.2, 0, Math.PI * 2); ctx.fill();
    // Head
    ctx.fillStyle = radGrad(ctx, 14, -2, 5,
      [[0, '#b87030'], [1, '#8a5020']]);
    ctx.beginPath(); ctx.ellipse(14, -1, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
    // Ear
    ctx.fillStyle = '#8a5020';
    ctx.beginPath();
    ctx.ellipse(12, -4, 2, 3.5, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(220,160,100,0.5)';
    ctx.beginPath();
    ctx.ellipse(12, -4, 1, 2, -0.5, 0, Math.PI * 2); ctx.fill();
    // Eye
    ctx.fillStyle = '#1a0a00';
    ctx.beginPath(); ctx.arc(16, -2, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.arc(16.3, -2.3, 0.4, 0, Math.PI * 2); ctx.fill();
    // Nose
    ctx.fillStyle = '#2a1a0a';
    ctx.beginPath(); ctx.ellipse(18, 0, 1.5, 1, 0, 0, Math.PI * 2); ctx.fill();
    // Antlers - branching
    ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(13, -4); ctx.lineTo(14, -9); ctx.lineTo(12, -12);
    ctx.moveTo(14, -9); ctx.lineTo(17, -11);
    ctx.moveTo(13, -4); ctx.lineTo(16, -7); ctx.lineTo(18, -10);
    ctx.stroke();
    // Tail
    ctx.fillStyle = '#f0e0c0';
    ctx.beginPath(); ctx.ellipse(-14, -1, 3, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // === ANIMALS: RABBIT ===
  function drawRabbit(ctx, angle, runPhase) {
    ctx.save(); ctx.rotate(angle);
    drawGroundShadow(ctx, 11, 5, 0.3);
    const hop = Math.abs(Math.sin(runPhase)) * 2;
    ctx.translate(0, -hop);
    // Hind legs
    ctx.fillStyle = '#c9a87c';
    ctx.beginPath(); ctx.ellipse(-5, 3, 4, 2.5, 0.3, 0, Math.PI * 2); ctx.fill();
    // Body
    ctx.fillStyle = radGrad(ctx, -1, -1, 10,
      [[0, '#e0c8a0'], [0.6, '#d2b48c'], [1, '#b89870']]);
    ctx.beginPath(); ctx.ellipse(0, 0, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
    // Fur fluff
    ctx.fillStyle = 'rgba(255,240,220,0.3)';
    ctx.beginPath(); ctx.ellipse(0, 2, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    // Head
    ctx.fillStyle = radGrad(ctx, 8, -1, 5,
      [[0, '#e0c8a0'], [1, '#c9a87c']]);
    ctx.beginPath(); ctx.arc(8, -1, 4.5, 0, Math.PI * 2); ctx.fill();
    // Ears - long and detailed
    ctx.fillStyle = '#c9a87c';
    ctx.beginPath();
    ctx.ellipse(7, -6, 1.8, 5, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.ellipse(9, -6.5, 1.8, 5, 0.2, 0, Math.PI * 2); ctx.fill();
    // Inner ear pink
    ctx.fillStyle = 'rgba(220,160,160,0.6)';
    ctx.beginPath();
    ctx.ellipse(7, -6, 0.8, 3.5, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.ellipse(9, -6.5, 0.8, 3.5, 0.2, 0, Math.PI * 2); ctx.fill();
    // Eye
    ctx.fillStyle = '#1a0a00';
    ctx.beginPath(); ctx.arc(10, -1.5, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath(); ctx.arc(10.3, -1.8, 0.4, 0, Math.PI * 2); ctx.fill();
    // Nose
    ctx.fillStyle = '#d4727a';
    ctx.beginPath(); ctx.ellipse(12, 0, 1, 0.7, 0, 0, Math.PI * 2); ctx.fill();
    // Whiskers
    ctx.strokeStyle = 'rgba(100,80,60,0.5)'; ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.moveTo(11, 0.5); ctx.lineTo(15, -0.5);
    ctx.moveTo(11, 1); ctx.lineTo(15, 1.5);
    ctx.stroke();
    // Tail puff
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-8, 0, 3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }


  // === ANIMALS: BOAR ===
  function drawBoar(ctx, angle) {
    ctx.save(); ctx.rotate(angle);
    drawGroundShadow(ctx, 20, 9, 0.45);
    // Legs
    ctx.fillStyle = '#2a1a0a';
    [[-9,-8],[9,-8],[-9,6],[9,6]].forEach(([lx,ly]) => {
      ctx.fillRect(lx, ly, 3, 6);
      ctx.fillRect(lx - 0.5, ly + 5, 4, 2); // hoof
    });
    // Body - dark bristly
    ctx.fillStyle = radGrad(ctx, -2, -2, 18,
      [[0, '#4a3520'], [0.5, '#3a2a1a'], [0.9, '#2a1a0a'], [1, '#1a0a05']]);
    ctx.beginPath(); ctx.ellipse(0, 0, 16, 9, 0, 0, Math.PI * 2); ctx.fill();
    // Bristle texture
    ctx.strokeStyle = 'rgba(80,50,20,0.5)'; ctx.lineWidth = 0.8;
    for (let i = -12; i <= 12; i += 2.5) {
      ctx.beginPath();
      ctx.moveTo(i, -9); ctx.lineTo(i + (i % 3 === 0 ? 1 : -1), -12 - Math.abs(i) * 0.1);
      ctx.stroke();
    }
    // Shoulder hump
    ctx.fillStyle = 'rgba(60,40,20,0.5)';
    ctx.beginPath(); ctx.ellipse(-4, -5, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
    // Head
    ctx.fillStyle = radGrad(ctx, 14, 0, 7,
      [[0, '#3a2a1a'], [1, '#1a0a05']]);
    ctx.beginPath(); ctx.ellipse(14, 0, 7, 5.5, 0, 0, Math.PI * 2); ctx.fill();
    // Snout
    ctx.fillStyle = '#5a4a3a';
    ctx.beginPath(); ctx.ellipse(19, 0.5, 3.5, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    // Nostrils
    ctx.fillStyle = '#1a0a05';
    ctx.beginPath(); ctx.arc(20, -0.5, 0.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(20, 1.5, 0.8, 0, Math.PI * 2); ctx.fill();
    // Tusks - curved ivory
    ctx.strokeStyle = '#fff8dc'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(18, -2.5); ctx.quadraticCurveTo(22, -4, 21, -6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(18, 2.5); ctx.quadraticCurveTo(22, 4, 21, 6); ctx.stroke();
    // Eye - angry red
    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.arc(16, -2.5, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a0a00';
    ctx.beginPath(); ctx.arc(16, -2.5, 0.7, 0, Math.PI * 2); ctx.fill();
    // Ears
    ctx.fillStyle = '#2a1a0a';
    ctx.beginPath();
    ctx.moveTo(10, -5); ctx.lineTo(11, -8); ctx.lineTo(13, -5); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(10, 5); ctx.lineTo(11, 8); ctx.lineTo(13, 5); ctx.fill();
    // Tail (small curly)
    ctx.strokeStyle = '#2a1a0a'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-15, 0); ctx.quadraticCurveTo(-18, -3, -16, -5); ctx.stroke();
    ctx.restore();
  }

  // === ANIMALS: DUCK ===
  function drawDuck(ctx, angle) {
    ctx.save(); ctx.rotate(angle);
    drawGroundShadow(ctx, 12, 5, 0.3);
    // Body
    ctx.fillStyle = radGrad(ctx, -1, -1, 11,
      [[0, '#f8f5ea'], [0.6, '#e8e2d0'], [1, '#cfc9b8']]);
    ctx.beginPath(); ctx.ellipse(0, 0, 10, 6.5, 0, 0, Math.PI * 2); ctx.fill();
    // Wing
    ctx.fillStyle = 'rgba(180,175,160,0.8)';
    ctx.beginPath(); ctx.ellipse(-2, 1, 7, 3.5, 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(100,95,80,0.4)'; ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(-6, 0); ctx.quadraticCurveTo(-2, 2, 3, 1); ctx.stroke();
    // Head - iridescent green
    ctx.fillStyle = radGrad(ctx, 9, -2, 5,
      [[0, '#2d8f5f'], [0.5, '#1a6e44'], [1, '#0d4a2a']]);
    ctx.beginPath(); ctx.arc(9, -1, 4.5, 0, Math.PI * 2); ctx.fill();
    // White neck ring
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(6, 0, 3, -1, 1); ctx.stroke();
    // Beak
    ctx.fillStyle = gradFill(ctx, 12, -1.5, 17, 1.5,
      [[0, '#f0a830'], [1, '#d48c10']]);
    ctx.beginPath();
    ctx.moveTo(12, -1); ctx.lineTo(17, -0.5); ctx.lineTo(17, 0.5);
    ctx.lineTo(12, 1.5); ctx.closePath(); ctx.fill();
    // Eye
    ctx.fillStyle = '#1a0a00';
    ctx.beginPath(); ctx.arc(11, -2, 1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.arc(11.3, -2.3, 0.3, 0, Math.PI * 2); ctx.fill();
    // Tail feathers
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(-9, -1); ctx.lineTo(-13, -2); ctx.lineTo(-12, 0);
    ctx.lineTo(-13, 2); ctx.lineTo(-9, 1); ctx.fill();
    ctx.restore();
  }


  // === ANIMALS: CROCODILE ===
  function drawCrocodile(ctx, angle) {
    ctx.save(); ctx.rotate(angle);
    drawGroundShadow(ctx, 32, 8, 0.5);
    // Tail
    ctx.fillStyle = '#3a5a2a';
    ctx.beginPath();
    ctx.moveTo(-22, -3); ctx.quadraticCurveTo(-30, 0, -34, 4);
    ctx.lineTo(-32, 0); ctx.quadraticCurveTo(-28, -2, -22, 3);
    ctx.fill();
    // Body
    ctx.fillStyle = radGrad(ctx, 0, -2, 26,
      [[0, '#4a6a3a'], [0.5, '#3a5a2a'], [0.9, '#2a4a1a'], [1, '#1a3a10']]);
    ctx.beginPath(); ctx.ellipse(0, 0, 24, 7.5, 0, 0, Math.PI * 2); ctx.fill();
    // Belly lighter
    ctx.fillStyle = 'rgba(180,200,140,0.25)';
    ctx.beginPath(); ctx.ellipse(0, 3, 18, 4, 0, 0, Math.PI * 2); ctx.fill();
    // Scales/ridges
    ctx.fillStyle = '#2a4a1a';
    for (let i = -16; i <= 14; i += 5) {
      ctx.beginPath();
      ctx.moveTo(i, -3); ctx.lineTo(i + 2.5, -8); ctx.lineTo(i + 5, -3);
      ctx.fill();
    }
    // Armored back texture
    ctx.strokeStyle = 'rgba(20,40,10,0.4)'; ctx.lineWidth = 0.6;
    for (let i = -18; i <= 16; i += 4) {
      for (let j = -4; j <= 4; j += 4) {
        ctx.strokeRect(i, j, 3, 3);
      }
    }
    // Legs
    ctx.fillStyle = '#2a4a1a';
    [[-12,-7],[-12,5],[10,-7],[10,5]].forEach(([lx,ly]) => {
      ctx.beginPath(); ctx.ellipse(lx, ly, 4, 2.5, ly < 0 ? -0.3 : 0.3, 0, Math.PI * 2); ctx.fill();
    });
    // Head/jaw - elongated
    ctx.fillStyle = gradFill(ctx, 20, -4, 38, 4,
      [[0, '#3a5a2a'], [1, '#2a4a1a']]);
    ctx.beginPath();
    ctx.moveTo(20, -5); ctx.lineTo(36, -2.5); ctx.lineTo(38, 0);
    ctx.lineTo(36, 2.5); ctx.lineTo(20, 5); ctx.closePath(); ctx.fill();
    // Jaw line
    ctx.strokeStyle = '#1a3a10'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(22, 0); ctx.lineTo(36, 0); ctx.stroke();
    // Teeth
    ctx.fillStyle = '#fff8dc';
    for (let i = 22; i < 35; i += 3) {
      ctx.beginPath();
      ctx.moveTo(i, -1.5); ctx.lineTo(i + 1, -3); ctx.lineTo(i + 2, -1.5); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(i, 1.5); ctx.lineTo(i + 1, 3); ctx.lineTo(i + 2, 1.5); ctx.fill();
    }
    // Eye - reptilian slit
    ctx.fillStyle = '#f4c430';
    ctx.beginPath(); ctx.ellipse(22, -3.5, 2, 1.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.fillRect(21.5, -4, 1, 3); // vertical slit
    // Nostril bumps
    ctx.fillStyle = '#2a4a1a';
    ctx.beginPath(); ctx.arc(35, -2, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(35, 2, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }


  // === ANIMALS: TIGER ===
  function drawTiger(ctx, angle) {
    ctx.save(); ctx.rotate(angle);
    drawGroundShadow(ctx, 22, 10, 0.5);
    // Tail
    ctx.strokeStyle = '#e08c2c'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-15, 0); ctx.quadraticCurveTo(-24, -6, -22, -14); ctx.stroke();
    ctx.strokeStyle = '#1a0a05'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-18, -4); ctx.lineTo(-19, -6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-21, -10); ctx.lineTo(-20, -12); ctx.stroke();
    // Body
    ctx.fillStyle = radGrad(ctx, -2, -2, 20,
      [[0, '#f0a030'], [0.4, '#e08c2c'], [0.8, '#c07020'], [1, '#a05a18']]);
    ctx.beginPath(); ctx.ellipse(0, 0, 18, 10, 0, 0, Math.PI * 2); ctx.fill();
    // White belly
    ctx.fillStyle = 'rgba(255,240,200,0.35)';
    ctx.beginPath(); ctx.ellipse(0, 4, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
    // Stripes - realistic curved
    ctx.strokeStyle = '#1a0a05'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    const stripes = [[-10,-8,-9,8],[-6,-9,-4,9],[-1,-9,1,9],[4,-9,6,9],[9,-8,10,8],[13,-6,14,6]];
    stripes.forEach(([x1,y1,x2,y2]) => {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo((x1+x2)/2+1, 0, x2, y2); ctx.stroke();
    });
    // Head
    ctx.fillStyle = radGrad(ctx, 16, -1, 8,
      [[0, '#f0a030'], [0.7, '#e08c2c'], [1, '#c07020']]);
    ctx.beginPath(); ctx.arc(16, 0, 7.5, 0, Math.PI * 2); ctx.fill();
    // Face stripes
    ctx.strokeStyle = '#1a0a05'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(13, -4); ctx.lineTo(11, -6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(13, 4); ctx.lineTo(11, 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(15, -5); ctx.lineTo(14, -7); ctx.stroke();
    // White cheeks
    ctx.fillStyle = 'rgba(255,240,220,0.5)';
    ctx.beginPath(); ctx.ellipse(18, -2, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(18, 2, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
    // Ears
    ctx.fillStyle = '#c07020';
    ctx.beginPath(); ctx.moveTo(12, -6); ctx.lineTo(13, -10); ctx.lineTo(15, -6); ctx.fill();
    ctx.beginPath(); ctx.moveTo(12, 6); ctx.lineTo(13, 10); ctx.lineTo(15, 6); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(13, -8, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(13, 8, 1.5, 0, Math.PI * 2); ctx.fill();
    // Eyes - fierce
    ctx.fillStyle = '#f4c430';
    ctx.beginPath(); ctx.ellipse(19, -2.5, 2, 1.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(19, 2.5, 2, 1.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(19.3, -2.5, 0.8, 1.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(19.3, 2.5, 0.8, 1.2, 0, 0, Math.PI * 2); ctx.fill();
    // Nose
    ctx.fillStyle = '#d47080';
    ctx.beginPath(); ctx.ellipse(22, 0, 1.5, 1, 0, 0, Math.PI * 2); ctx.fill();
    // Fangs
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(21, 1); ctx.lineTo(21.5, 3.5); ctx.lineTo(22, 1); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(21, -1); ctx.lineTo(21.5, -3.5); ctx.lineTo(22, -1); ctx.fill();
    ctx.restore();
  }


  // === ANIMALS: BEAR ===
  function drawBear(ctx, angle) {
    ctx.save(); ctx.rotate(angle);
    drawGroundShadow(ctx, 24, 12, 0.55);
    // Legs (thick)
    ctx.fillStyle = '#2a1a0a';
    [[-12,-11],[12,-11],[-12,8],[12,8]].forEach(([lx,ly]) => {
      ctx.fillRect(lx, ly, 5, 7);
      // Claws
      ctx.fillStyle = '#555';
      for (let c = 0; c < 3; c++) {
        ctx.fillRect(lx + c * 1.5, ly + 6, 1, 2);
      }
      ctx.fillStyle = '#2a1a0a';
    });
    // Body - massive
    ctx.fillStyle = radGrad(ctx, -3, -3, 22,
      [[0, '#5a4030'], [0.4, '#3a2a1a'], [0.8, '#2a1a0a'], [1, '#1a0a05']]);
    ctx.beginPath(); ctx.ellipse(0, 0, 20, 12, 0, 0, Math.PI * 2); ctx.fill();
    // Shoulder hump
    ctx.fillStyle = 'rgba(70,50,30,0.6)';
    ctx.beginPath(); ctx.ellipse(-5, -6, 10, 5, 0, 0, Math.PI * 2); ctx.fill();
    // Fur texture
    ctx.strokeStyle = 'rgba(100,70,40,0.3)'; ctx.lineWidth = 0.6;
    for (let i = 0; i < 20; i++) {
      const fx = -15 + i * 2;
      const fy = -8 + (i % 5) * 3;
      ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx + 1, fy - 2); ctx.stroke();
    }
    // Head
    ctx.fillStyle = radGrad(ctx, 16, 0, 9,
      [[0, '#4a3520'], [0.7, '#3a2a1a'], [1, '#2a1a0a']]);
    ctx.beginPath(); ctx.arc(16, 0, 9, 0, Math.PI * 2); ctx.fill();
    // Snout (lighter)
    ctx.fillStyle = '#6a5040';
    ctx.beginPath(); ctx.ellipse(22, 1, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
    // Nose
    ctx.fillStyle = '#1a0a00';
    ctx.beginPath(); ctx.ellipse(24, 0, 2, 1.5, 0, 0, Math.PI * 2); ctx.fill();
    // Mouth line
    ctx.strokeStyle = '#1a0a00'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(24, 1.5); ctx.lineTo(24, 3); ctx.lineTo(22, 4); ctx.stroke();
    // Ears
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath(); ctx.arc(12, -8, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(12, 8, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5a4030';
    ctx.beginPath(); ctx.arc(12, -8, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(12, 8, 1.8, 0, Math.PI * 2); ctx.fill();
    // Eyes - menacing
    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.arc(19, -3, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(19, 3, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(19.3, -3, 0.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(19.3, 3, 0.8, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // === ANIMALS: VILLAGER ===
  function drawVillager(ctx, angle, walkPhase) {
    ctx.save(); ctx.rotate(angle);
    drawGroundShadow(ctx, 10, 5, 0.35);
    const legAnim = Math.sin(walkPhase || 0) * 2;
    // Legs
    ctx.fillStyle = '#6a5040';
    ctx.fillRect(-3, -6 + legAnim, 2, 5);
    ctx.fillRect(-3, 3 - legAnim, 2, 5);
    // Body (lungi/shirt)
    ctx.fillStyle = radGrad(ctx, 0, 0, 9,
      [[0, '#c86040'], [1, '#8a3020']]);
    ctx.beginPath(); ctx.ellipse(0, 0, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
    // Lungi pattern
    ctx.strokeStyle = 'rgba(255,200,100,0.3)'; ctx.lineWidth = 0.6;
    for (let i = -5; i <= 5; i += 2.5) {
      ctx.beginPath(); ctx.moveTo(-6, i); ctx.lineTo(6, i); ctx.stroke();
    }
    // Head
    ctx.fillStyle = radGrad(ctx, 4, -1, 5,
      [[0, '#e8c49a'], [1, '#c49070']]);
    ctx.beginPath(); ctx.arc(4, 0, 4.5, 0, Math.PI * 2); ctx.fill();
    // Hair/headwrap
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(4, -2, 4, Math.PI, 0); ctx.fill();
    // Face
    ctx.fillStyle = '#1a0a00';
    ctx.beginPath(); ctx.arc(6.5, -0.5, 0.7, 0, Math.PI * 2); ctx.fill(); // eye
    // Mustache
    ctx.strokeStyle = '#2a1a0a'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(5, 1.5); ctx.quadraticCurveTo(7, 2.5, 8, 1.5); ctx.stroke();
    // Stick/lathi
    ctx.strokeStyle = '#5a3a1f'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(20, 0); ctx.stroke();
    // Angry indicator
    ctx.fillStyle = '#e3493a';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', 4, -9);
    ctx.restore();
  }


  // === EFFECTS ===
  function drawMuzzleFlash(ctx, x, y, angle, age) {
    const a = 1 - age;
    if (a <= 0) return;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(angle);
    ctx.globalAlpha = a;
    // Multiple layers for realism
    const grad1 = ctx.createRadialGradient(22, 0, 0, 22, 0, 16);
    grad1.addColorStop(0, 'rgba(255,255,240,1)');
    grad1.addColorStop(0.3, 'rgba(255,220,100,0.9)');
    grad1.addColorStop(0.6, 'rgba(255,120,20,0.6)');
    grad1.addColorStop(1, 'rgba(255,80,0,0)');
    ctx.fillStyle = grad1;
    ctx.beginPath(); ctx.arc(22, 0, 16, 0, Math.PI * 2); ctx.fill();
    // Sparks
    ctx.fillStyle = 'rgba(255,240,100,0.8)';
    for (let i = 0; i < 5; i++) {
      const sa = (i / 5) * Math.PI * 2 + age * 10;
      const sr = 8 + i * 2;
      ctx.beginPath();
      ctx.arc(22 + Math.cos(sa) * sr, Math.sin(sa) * sr * 0.5, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawBullet(ctx, x, y, angle) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(angle);
    // Tracer effect
    const grad = ctx.createLinearGradient(-8, 0, 6, 0);
    grad.addColorStop(0, 'rgba(255,200,50,0)');
    grad.addColorStop(0.5, 'rgba(255,220,100,0.6)');
    grad.addColorStop(1, 'rgba(255,240,180,1)');
    ctx.fillStyle = grad;
    ctx.fillRect(-8, -1.5, 14, 3);
    // Bullet head
    ctx.fillStyle = '#f4c430';
    ctx.beginPath();
    ctx.arc(6, 0, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,200,0.8)';
    ctx.beginPath();
    ctx.arc(6, -0.5, 0.8, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawParticle(ctx, p) {
    ctx.save();
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = alpha;
    // Soft particle with glow
    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
    grad.addColorStop(0, p.color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
    ctx.fill();
    // Core
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }


  // === BIOME BACKGROUNDS ===
  function drawForestBg(ctx, w, h, t, camX, camY) {
    // Multi-layer ground with depth
    const baseGrad = gradFill(ctx, 0, 0, 0, h,
      [[0, '#1a4a28'], [0.3, '#163d22'], [0.7, '#12321a'], [1, '#0e2814']]);
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, w, h);

    // Detailed grass patches (tiled, scrolling with camera)
    const tile = 60;
    const ox = Math.floor(camX / tile) * tile - camX;
    const oy = Math.floor(camY / tile) * tile - camY;
    for (let y = oy - tile; y < h + tile; y += tile) {
      for (let x = ox - tile; x < w + tile; x += tile) {
        const hash = ((x + camX) * 7 + (y + camY) * 13) & 0xFF;
        // Grass blades
        ctx.strokeStyle = `rgba(${30 + hash % 20}, ${80 + hash % 40}, ${40 + hash % 20}, 0.6)`;
        ctx.lineWidth = 1;
        for (let g = 0; g < 4; g++) {
          const gx = x + (hash * (g + 1) * 17) % tile;
          const gy = y + (hash * (g + 1) * 11) % tile;
          const sway = Math.sin(t * 0.8 + gx * 0.05) * 2;
          ctx.beginPath();
          ctx.moveTo(gx, gy);
          ctx.quadraticCurveTo(gx + sway, gy - 5, gx + sway * 0.5, gy - 8 - (hash % 4));
          ctx.stroke();
        }
        // Dirt patches
        if (hash % 7 === 0) {
          ctx.fillStyle = 'rgba(60,40,20,0.25)';
          ctx.beginPath();
          ctx.ellipse(x + 20, y + 20, 12, 6, hash * 0.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Dappled sunlight
    ctx.fillStyle = 'rgba(244, 200, 60, 0.04)';
    for (let i = 0; i < 5; i++) {
      const lx = (t * 6 + i * 180) % (w + 300) - 100;
      const ly = h * 0.3 + Math.sin(t * 0.3 + i) * h * 0.15;
      ctx.beginPath();
      ctx.ellipse(lx, ly, 120 + i * 30, 50 + i * 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Atmospheric fog at edges
    ctx.fillStyle = 'rgba(20,60,30,0.15)';
    ctx.fillRect(0, 0, w, 40);
    ctx.fillRect(0, h - 40, w, 40);
  }

  function drawRiverBg(ctx, w, h, t) {
    // Deep water gradient
    const grad = gradFill(ctx, 0, 0, 0, h,
      [[0, '#1a7a9e'], [0.2, '#12607d'], [0.5, '#0a4a5f'], [0.8, '#063040'], [1, '#042028']]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Underwater light rays
    ctx.fillStyle = 'rgba(100,200,220,0.04)';
    for (let i = 0; i < 6; i++) {
      const rx = (t * 15 + i * 150) % (w + 200) - 100;
      ctx.beginPath();
      ctx.moveTo(rx, 0);
      ctx.lineTo(rx + 40, h);
      ctx.lineTo(rx + 80, h);
      ctx.lineTo(rx + 30, 0);
      ctx.fill();
    }

    // Animated ripples
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 40; i++) {
      const rx = (i * 67 + t * 30) % (w + 80) - 40;
      const ry = (i * 43 + t * 8) % h;
      const rr = 5 + Math.sin(t * 1.2 + i * 2.5) * 3;
      ctx.beginPath(); ctx.arc(rx, ry, rr, 0, Math.PI * 2); ctx.stroke();
    }

    // Caustic light patches
    ctx.fillStyle = 'rgba(180,240,255,0.05)';
    for (let i = 0; i < 8; i++) {
      const cx = (i * 107 + Math.sin(t * 0.5 + i) * 40) % w;
      const cy = (i * 83 + Math.cos(t * 0.3 + i) * 30) % h;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 20 + Math.sin(t + i) * 8, 12, t * 0.1 + i, 0, Math.PI * 2);
      ctx.fill();
    }

    // Surface foam at top
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let i = 0; i < 15; i++) {
      const fx = (i * 89 + t * 20) % w;
      ctx.beginPath();
      ctx.ellipse(fx, 10 + Math.sin(t + i) * 3, 15 + i % 5 * 3, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawVillageBg(ctx, w, h, t, camX, camY) {
    // Dirt/mud ground
    const grad = gradFill(ctx, 0, 0, 0, h,
      [[0, '#4a3a28'], [0.5, '#3a2e22'], [1, '#2a2018']]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Dirt path texture
    const tile = 50;
    const ox = Math.floor(camX / tile) * tile - camX;
    const oy = Math.floor(camY / tile) * tile - camY;
    for (let y = oy - tile; y < h + tile; y += tile) {
      for (let x = ox - tile; x < w + tile; x += tile) {
        const hash = ((x + camX) * 11 + (y + camY) * 7) & 0xFF;
        // Dirt clumps
        ctx.fillStyle = `rgba(${70 + hash % 20}, ${50 + hash % 15}, ${30 + hash % 10}, 0.3)`;
        ctx.beginPath();
        ctx.arc(x + hash % tile, y + (hash * 3) % tile, 3 + hash % 4, 0, Math.PI * 2);
        ctx.fill();
        // Pebbles
        if (hash % 5 === 0) {
          ctx.fillStyle = 'rgba(120,110,90,0.4)';
          ctx.beginPath();
          ctx.ellipse(x + 10, y + 10, 2, 1.5, hash * 0.1, 0, Math.PI * 2);
          ctx.fill();
        }
        // Dry grass tufts
        if (hash % 8 === 0) {
          ctx.strokeStyle = 'rgba(120,100,50,0.4)';
          ctx.lineWidth = 0.8;
          const gx = x + (hash * 5) % tile;
          const gy = y + (hash * 3) % tile;
          ctx.beginPath();
          ctx.moveTo(gx, gy); ctx.lineTo(gx + 2, gy - 5);
          ctx.moveTo(gx + 2, gy); ctx.lineTo(gx + 4, gy - 4);
          ctx.stroke();
        }
      }
    }

    // Dusty atmosphere
    ctx.fillStyle = 'rgba(80,60,40,0.08)';
    ctx.fillRect(0, 0, w, h);
  }


  // === EXPORTS ===
  window.Sprites = {
    drawTree, drawBush, drawRock, drawWaterPatch, drawHouse, drawCrate, drawCoin, drawAmmoBox, drawHeart,
    drawPlayerOnFoot, drawPlayerOnBike, drawPlayerInCar, drawPlayerInBoat,
    drawDeer, drawRabbit, drawBoar, drawDuck, drawCrocodile, drawTiger, drawBear, drawVillager,
    drawMuzzleFlash, drawBullet, drawParticle,
    drawForestBg, drawRiverBg, drawVillageBg,
  };
})();
