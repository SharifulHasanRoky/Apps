// sprites.js — All game art drawn procedurally onto canvas (no image assets).
// Exposed as window.Sprites.

(function () {
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

  // ============== ENVIRONMENT ==============
  function drawTree(ctx, x, y, seed = 0, scale = 1) {
    withTransform(ctx, x, y, 0, scale, (c) => {
      // shadow
      c.fillStyle = 'rgba(0,0,0,0.35)';
      c.beginPath();
      c.ellipse(2, 6, 22, 8, 0, 0, Math.PI * 2);
      c.fill();
      // trunk
      c.fillStyle = '#5a3a1f';
      c.fillRect(-4, -6, 8, 14);
      // foliage
      const variants = ['#1f7a52', '#2d8f5f', '#155f3f'];
      c.fillStyle = variants[seed % 3];
      c.beginPath();
      c.arc(0, -14, 22, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = 'rgba(255,255,255,0.08)';
      c.beginPath();
      c.arc(-6, -20, 10, 0, Math.PI * 2);
      c.fill();
    });
  }

  function drawBush(ctx, x, y) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x + 1, y + 4, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a6e44';
    ctx.beginPath();
    ctx.arc(x - 6, y, 9, 0, Math.PI * 2);
    ctx.arc(x + 6, y, 9, 0, Math.PI * 2);
    ctx.arc(x, y - 4, 11, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawRock(ctx, x, y) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(x + 1, y + 5, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7d8087';
    ctx.beginPath();
    ctx.ellipse(x, y, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.ellipse(x - 3, y - 3, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawWaterPatch(ctx, x, y, w, h, t) {
    ctx.save();
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, '#1f6f8a');
    grad.addColorStop(1, '#0f4255');
    ctx.fillStyle = grad;
    roundRect(ctx, x, y, w, h, 24);
    ctx.fill();
    // ripples
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      const rx = x + (i * 73 + t * 30) % w;
      const ry = y + (i * 41) % h;
      ctx.beginPath();
      ctx.arc(rx, ry, 6 + Math.sin(t + i) * 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawHouse(ctx, x, y, looted = false) {
    withTransform(ctx, x, y, 0, 1, (c) => {
      // shadow
      c.fillStyle = 'rgba(0,0,0,0.4)';
      c.beginPath();
      c.ellipse(2, 32, 38, 8, 0, 0, Math.PI * 2);
      c.fill();
      // body
      c.fillStyle = looted ? '#5a4a3a' : '#caa472';
      c.fillRect(-32, -10, 64, 40);
      // roof
      c.fillStyle = looted ? '#4a3a2a' : '#8b3a1f';
      c.beginPath();
      c.moveTo(-38, -10);
      c.lineTo(0, -36);
      c.lineTo(38, -10);
      c.closePath();
      c.fill();
      // door
      c.fillStyle = looted ? '#241b13' : '#5a3a1f';
      c.fillRect(-8, 6, 16, 24);
      // windows
      c.fillStyle = looted ? '#1a1a1a' : '#7ec0e0';
      c.fillRect(-26, 0, 12, 12);
      c.fillRect(14, 0, 12, 12);
      // outline
      c.strokeStyle = 'rgba(0,0,0,0.5)';
      c.lineWidth = 1;
      c.strokeRect(-32, -10, 64, 40);
      if (looted) {
        c.fillStyle = 'rgba(244, 196, 48, 0.9)';
        c.font = 'bold 12px sans-serif';
        c.textAlign = 'center';
        c.fillText('LOOTED', 0, 22);
      }
    });
  }

  function drawCrate(ctx, x, y) {
    withTransform(ctx, x, y, 0, 1, (c) => {
      c.fillStyle = 'rgba(0,0,0,0.4)';
      c.beginPath();
      c.ellipse(2, 14, 16, 4, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#a47148';
      c.fillRect(-14, -14, 28, 28);
      c.strokeStyle = '#5a3a1f';
      c.lineWidth = 2;
      c.strokeRect(-14, -14, 28, 28);
      c.beginPath();
      c.moveTo(-14, -14); c.lineTo(14, 14);
      c.moveTo(14, -14); c.lineTo(-14, 14);
      c.stroke();
    });
  }

  function drawCoin(ctx, x, y, t) {
    const bob = Math.sin(t * 0.006 + x) * 2;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 8, 8, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f4c430';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#fff8dc';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 0);
    ctx.restore();
  }

  function drawAmmoBox(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 8, 12, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a5a3a';
    roundRect(ctx, -10, -8, 20, 14, 2);
    ctx.fill();
    ctx.fillStyle = '#f4c430';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AMMO', 0, 0);
    ctx.restore();
  }

  function drawHeart(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 8, 9, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e3493a';
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.bezierCurveTo(-10, -4, -10, -10, 0, -4);
    ctx.bezierCurveTo(10, -10, 10, -4, 0, 6);
    ctx.fill();
    ctx.restore();
  }

  // ============== PLAYER + VEHICLES ==============
  function drawPlayerOnFoot(ctx, angle, walkPhase) {
    ctx.save();
    ctx.rotate(angle);
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    // body
    ctx.fillStyle = '#5d6d4a';
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();
    // backpack
    ctx.fillStyle = '#8b6f47';
    ctx.fillRect(-8, -3, 6, 6);
    // head
    ctx.fillStyle = '#d4a373';
    ctx.beginPath();
    ctx.arc(4, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    // hat
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(2, -6, 6, 3);
    ctx.fillRect(0, -3, 10, 1);
    // gun
    ctx.fillStyle = '#222';
    ctx.fillRect(8, -2, 18, 4);
    ctx.fillStyle = '#444';
    ctx.fillRect(7, -3, 4, 6);
    ctx.restore();
  }

  function drawPlayerOnBike(ctx, angle) {
    ctx.save();
    ctx.rotate(angle);
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    // bike frame
    ctx.fillStyle = '#222';
    ctx.fillRect(-18, -3, 36, 6);
    // wheels
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(-14, 0, 6, 0, Math.PI * 2);
    ctx.arc(14, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // rider
    ctx.fillStyle = '#5d6d4a';
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d4a373';
    ctx.beginPath();
    ctx.arc(2, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    // gun
    ctx.fillStyle = '#222';
    ctx.fillRect(8, -1.5, 14, 3);
    ctx.restore();
  }

  function drawPlayerInCar(ctx, angle) {
    ctx.save();
    ctx.rotate(angle);
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 32, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    // body
    ctx.fillStyle = '#7a3a2a';
    roundRect(ctx, -28, -14, 56, 28, 6);
    ctx.fill();
    ctx.strokeStyle = '#3a1a0a';
    ctx.lineWidth = 2;
    ctx.stroke();
    // hood
    ctx.fillStyle = '#5a2a1a';
    ctx.fillRect(14, -12, 14, 24);
    // windshield
    ctx.fillStyle = 'rgba(120, 200, 240, 0.5)';
    ctx.fillRect(2, -10, 10, 20);
    // windows
    ctx.fillStyle = 'rgba(120, 200, 240, 0.35)';
    ctx.fillRect(-14, -10, 12, 20);
    // wheels
    ctx.fillStyle = '#111';
    ctx.fillRect(-22, -16, 10, 4);
    ctx.fillRect(-22, 12, 10, 4);
    ctx.fillRect(12, -16, 10, 4);
    ctx.fillRect(12, 12, 10, 4);
    // gun on roof
    ctx.fillStyle = '#222';
    ctx.fillRect(0, -2, 22, 4);
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.arc(-2, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPlayerInBoat(ctx, angle) {
    ctx.save();
    ctx.rotate(angle);
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 30, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    // boat hull
    ctx.fillStyle = '#8b5a2b';
    ctx.beginPath();
    ctx.moveTo(-22, -10);
    ctx.lineTo(22, -8);
    ctx.lineTo(28, 0);
    ctx.lineTo(22, 8);
    ctx.lineTo(-22, 10);
    ctx.lineTo(-26, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#3a2010';
    ctx.lineWidth = 2;
    ctx.stroke();
    // planks
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-20, -3); ctx.lineTo(22, -3);
    ctx.moveTo(-20, 3); ctx.lineTo(22, 3);
    ctx.stroke();
    // person
    ctx.fillStyle = '#5d6d4a';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d4a373';
    ctx.beginPath();
    ctx.arc(2, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    // gun
    ctx.fillStyle = '#222';
    ctx.fillRect(6, -1.5, 16, 3);
    ctx.restore();
  }

  // ============== ANIMALS ==============
  function drawDeer(ctx, angle, runPhase) {
    ctx.save();
    ctx.rotate(angle);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // body
    ctx.fillStyle = '#a0522d';
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    // head
    ctx.beginPath();
    ctx.ellipse(11, 0, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // antlers
    ctx.strokeStyle = '#4a2a1a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(13, -3); ctx.lineTo(15, -7); ctx.lineTo(13, -8);
    ctx.moveTo(13, -3); ctx.lineTo(17, -5);
    ctx.moveTo(13, 3); ctx.lineTo(15, 7); ctx.lineTo(13, 8);
    ctx.stroke();
    // legs (animated)
    const legOffset = Math.sin(runPhase) * 2;
    ctx.fillStyle = '#5a2a1a';
    ctx.fillRect(-8, -7 + legOffset, 2, 6);
    ctx.fillRect(8, -7 - legOffset, 2, 6);
    ctx.fillRect(-8, 5 - legOffset, 2, 6);
    ctx.fillRect(8, 5 + legOffset, 2, 6);
    // spots
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(-3, -2, 1.2, 0, Math.PI * 2);
    ctx.arc(2, 2, 1.2, 0, Math.PI * 2);
    ctx.arc(5, -3, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawRabbit(ctx, angle, runPhase) {
    ctx.save();
    ctx.rotate(angle);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // body
    ctx.fillStyle = '#d2b48c';
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // head
    ctx.beginPath();
    ctx.arc(7, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    // ears
    ctx.fillStyle = '#b8956c';
    ctx.fillRect(7, -5, 2, 5);
    ctx.fillRect(7, 0, 2, 5);
    // tail
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(-7, 0, 2, 0, Math.PI * 2);
    ctx.fill();
    // eye
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(9, -1, 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawBoar(ctx, angle) {
    ctx.save();
    ctx.rotate(angle);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    // body
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // bristles
    ctx.strokeStyle = '#1a0a05';
    ctx.lineWidth = 1;
    for (let i = -10; i <= 10; i += 3) {
      ctx.beginPath();
      ctx.moveTo(i, -8);
      ctx.lineTo(i, -11);
      ctx.stroke();
    }
    // head
    ctx.fillStyle = '#2a1a0a';
    ctx.beginPath();
    ctx.ellipse(13, 0, 6, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // tusks
    ctx.fillStyle = '#fff8dc';
    ctx.fillRect(17, -3, 4, 1.5);
    ctx.fillRect(17, 1.5, 4, 1.5);
    // legs
    ctx.fillStyle = '#1a0a05';
    ctx.fillRect(-8, -9, 2, 4);
    ctx.fillRect(8, -9, 2, 4);
    ctx.fillRect(-8, 7, 2, 4);
    ctx.fillRect(8, 7, 2, 4);
    // eye
    ctx.fillStyle = '#e3493a';
    ctx.beginPath();
    ctx.arc(15, -2, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawDuck(ctx, angle) {
    ctx.save();
    ctx.rotate(angle);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // body
    ctx.fillStyle = '#f4f1e8';
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // head
    ctx.fillStyle = '#1f7a52';
    ctx.beginPath();
    ctx.arc(8, -1, 4, 0, Math.PI * 2);
    ctx.fill();
    // beak
    ctx.fillStyle = '#f4c430';
    ctx.beginPath();
    ctx.moveTo(11, 0); ctx.lineTo(15, -1); ctx.lineTo(11, -2);
    ctx.fill();
    // wing
    ctx.fillStyle = '#cfc9b8';
    ctx.beginPath();
    ctx.ellipse(-2, 0, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawCrocodile(ctx, angle) {
    ctx.save();
    ctx.rotate(angle);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 28, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // body
    ctx.fillStyle = '#3a5a2a';
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    // back ridges
    ctx.fillStyle = '#2a4a1a';
    for (let i = -18; i <= 12; i += 6) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 3, -8);
      ctx.lineTo(i + 6, 0);
      ctx.fill();
    }
    // head/jaw
    ctx.fillStyle = '#2a4a1a';
    ctx.beginPath();
    ctx.moveTo(20, -4);
    ctx.lineTo(34, -2);
    ctx.lineTo(34, 2);
    ctx.lineTo(20, 4);
    ctx.fill();
    // teeth
    ctx.fillStyle = 'white';
    for (let i = 22; i < 33; i += 3) {
      ctx.beginPath();
      ctx.moveTo(i, -1); ctx.lineTo(i + 1, 1); ctx.lineTo(i + 2, -1);
      ctx.fill();
    }
    // eye
    ctx.fillStyle = '#f4c430';
    ctx.beginPath();
    ctx.arc(20, -3, 1.5, 0, Math.PI * 2);
    ctx.fill();
    // tail
    ctx.fillStyle = '#3a5a2a';
    ctx.beginPath();
    ctx.moveTo(-22, -3); ctx.lineTo(-32, 0); ctx.lineTo(-22, 3);
    ctx.fill();
    ctx.restore();
  }

  function drawTiger(ctx, angle) {
    ctx.save();
    ctx.rotate(angle);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    // body
    ctx.fillStyle = '#e08c2c';
    ctx.beginPath();
    ctx.ellipse(0, 0, 17, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    // stripes
    ctx.strokeStyle = '#1a0a05';
    ctx.lineWidth = 1.6;
    for (let i = -12; i <= 12; i += 4) {
      ctx.beginPath();
      ctx.moveTo(i, -9);
      ctx.lineTo(i + 1, 9);
      ctx.stroke();
    }
    // head
    ctx.fillStyle = '#e08c2c';
    ctx.beginPath();
    ctx.arc(15, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    // ears
    ctx.fillStyle = '#a05c1c';
    ctx.beginPath();
    ctx.moveTo(12, -7); ctx.lineTo(14, -10); ctx.lineTo(16, -6); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(12, 7); ctx.lineTo(14, 10); ctx.lineTo(16, 6); ctx.fill();
    // eyes
    ctx.fillStyle = '#f4c430';
    ctx.beginPath();
    ctx.arc(18, -2, 1.2, 0, Math.PI * 2);
    ctx.arc(18, 2, 1.2, 0, Math.PI * 2);
    ctx.fill();
    // teeth/mouth
    ctx.fillStyle = 'white';
    ctx.fillRect(20, -1, 3, 2);
    // tail
    ctx.strokeStyle = '#e08c2c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-15, 0); ctx.quadraticCurveTo(-26, -8, -22, -14);
    ctx.stroke();
    ctx.restore();
  }

  function drawBear(ctx, angle) {
    ctx.save();
    ctx.rotate(angle);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    // body
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    // head
    ctx.beginPath();
    ctx.arc(15, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    // snout
    ctx.fillStyle = '#5a3a2a';
    ctx.beginPath();
    ctx.arc(20, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    // ears
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath();
    ctx.arc(12, -7, 3, 0, Math.PI * 2);
    ctx.arc(12, 7, 3, 0, Math.PI * 2);
    ctx.fill();
    // eyes
    ctx.fillStyle = '#e3493a';
    ctx.beginPath();
    ctx.arc(18, -2, 1.2, 0, Math.PI * 2);
    ctx.arc(18, 2, 1.2, 0, Math.PI * 2);
    ctx.fill();
    // claws (front legs)
    ctx.fillStyle = '#1a0a05';
    ctx.fillRect(-12, -12, 4, 5);
    ctx.fillRect(-12, 7, 4, 5);
    ctx.restore();
  }

  function drawVillager(ctx, angle, walkPhase) {
    ctx.save();
    ctx.rotate(angle);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // body
    ctx.fillStyle = '#b56c4f';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    // head
    ctx.fillStyle = '#d4a373';
    ctx.beginPath();
    ctx.arc(3, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    // stick (defensive)
    ctx.strokeStyle = '#5a3a1f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(6, 0); ctx.lineTo(16, 0);
    ctx.stroke();
    // angry indicator
    ctx.fillStyle = '#e3493a';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', 0, -10);
    ctx.restore();
  }

  // ============== EFFECTS ==============
  function drawMuzzleFlash(ctx, x, y, angle, age) {
    const a = 1 - age;
    if (a <= 0) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha = a;
    const grad = ctx.createRadialGradient(20, 0, 0, 20, 0, 12);
    grad.addColorStop(0, 'rgba(255,240,180,1)');
    grad.addColorStop(0.6, 'rgba(255,150,40,0.7)');
    grad.addColorStop(1, 'rgba(255,150,40,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(20, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawBullet(ctx, x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = '#fff8dc';
    ctx.fillRect(-4, -1, 8, 2);
    ctx.fillStyle = '#f4c430';
    ctx.fillRect(2, -1, 4, 2);
    ctx.restore();
  }

  function drawParticle(ctx, p) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ============== BIOMES ==============
  function drawForestBg(ctx, w, h, t, camX, camY) {
    // base ground
    ctx.fillStyle = '#1a3a22';
    ctx.fillRect(0, 0, w, h);
    // grass tufts (deterministic pattern from camera offset)
    ctx.fillStyle = '#246934';
    const tile = 80;
    const ox = Math.floor(camX / tile) * tile - camX;
    const oy = Math.floor(camY / tile) * tile - camY;
    for (let y = oy - tile; y < h + tile; y += tile) {
      for (let x = ox - tile; x < w + tile; x += tile) {
        const sx = x + ((y * 13) % 30);
        const sy = y + ((x * 7) % 30);
        ctx.beginPath();
        ctx.arc(sx, sy, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // dappled light
    ctx.fillStyle = 'rgba(244, 196, 48, 0.05)';
    for (let i = 0; i < 3; i++) {
      const lx = (t * 8 + i * 200) % (w + 200);
      ctx.beginPath();
      ctx.ellipse(lx, h / 2, 200, 80, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawRiverBg(ctx, w, h, t) {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#1f6f8a');
    grad.addColorStop(0.5, '#0f4255');
    grad.addColorStop(1, '#082530');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    // ripples
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 30; i++) {
      const rx = (i * 73 + t * 40) % (w + 100) - 50;
      const ry = (i * 41 + t * 10) % h;
      ctx.beginPath();
      ctx.arc(rx, ry, 8 + Math.sin(t * 0.01 + i) * 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawVillageBg(ctx, w, h, t, camX, camY) {
    ctx.fillStyle = '#3a2e22';
    ctx.fillRect(0, 0, w, h);
    // dirt path texture
    ctx.fillStyle = '#4a3a2a';
    const tile = 60;
    const ox = Math.floor(camX / tile) * tile - camX;
    const oy = Math.floor(camY / tile) * tile - camY;
    for (let y = oy - tile; y < h + tile; y += tile) {
      for (let x = ox - tile; x < w + tile; x += tile) {
        ctx.fillRect(x + ((y * 5) % 20), y + ((x * 3) % 20), 6, 6);
      }
    }
  }

  // ============== EXPORTS ==============
  window.Sprites = {
    drawTree, drawBush, drawRock, drawWaterPatch, drawHouse, drawCrate, drawCoin, drawAmmoBox, drawHeart,
    drawPlayerOnFoot, drawPlayerOnBike, drawPlayerInCar, drawPlayerInBoat,
    drawDeer, drawRabbit, drawBoar, drawDuck, drawCrocodile, drawTiger, drawBear, drawVillager,
    drawMuzzleFlash, drawBullet, drawParticle,
    drawForestBg, drawRiverBg, drawVillageBg,
  };
})();
