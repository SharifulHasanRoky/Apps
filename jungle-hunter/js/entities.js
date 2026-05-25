// entities.js — Player, Animal, Bullet, House, Pickup, Particle, Villager
(function () {
  // ============ Player ============
  class Player {
    constructor(x, y, vehicle = 'foot') {
      this.x = x; this.y = y;
      this.vehicle = vehicle;
      this.angle = 0;
      this.hp = 100;
      this.maxHp = 100;
      this.ammo = 30;
      this.maxAmmo = 30;
      this.score = 0;
      this.shootCd = 0;
      this.muzzleAge = 1; // 1 = invisible
      this.walkPhase = 0;
      this.invuln = 0;
      this.r = 14;
    }

    get speed() {
      switch (this.vehicle) {
        case 'bike': return 240;
        case 'car':  return 280;
        case 'boat': return 200;
        default:     return 160;
      }
    }

    get fireRate() {
      return this.vehicle === 'car' ? 0.12 : 0.22;
    }

    update(dt) {
      const mx = window.Input.move.x;
      const my = window.Input.move.y;
      const mag = Math.hypot(mx, my);
      if (mag > 0.05) {
        this.x += mx * this.speed * dt;
        this.y += my * this.speed * dt;
        this.walkPhase += dt * 12;
        // body angle follows movement if no mouse aim
        if (!window.Input.hasMouse) {
          this.angle = Math.atan2(my, mx);
        }
      }
      // Aim angle (mouse or auto)
      if (window.Input.hasMouse && (window.Input.aim.x !== 0 || window.Input.aim.y !== 0)) {
        this.angle = window.Input.aimAngle;
      }
      this.shootCd = Math.max(0, this.shootCd - dt);
      this.muzzleAge = Math.min(1, this.muzzleAge + dt * 8);
      this.invuln = Math.max(0, this.invuln - dt);
    }

    canShoot() {
      return this.shootCd <= 0 && this.ammo > 0;
    }

    fire() {
      this.shootCd = this.fireRate;
      this.ammo--;
      this.muzzleAge = 0;
      const speed = 900;
      const ox = Math.cos(this.angle) * 22;
      const oy = Math.sin(this.angle) * 22;
      return new Bullet(this.x + ox, this.y + oy, Math.cos(this.angle) * speed, Math.sin(this.angle) * speed);
    }

    reload() {
      this.ammo = this.maxAmmo;
    }

    takeDamage(amount) {
      if (this.invuln > 0) return;
      this.hp = Math.max(0, this.hp - amount);
      this.invuln = 0.6;
    }

    render(ctx) {
      const flash = this.invuln > 0 && Math.floor(this.invuln * 20) % 2 === 0;
      if (flash) ctx.globalAlpha = 0.5;
      ctx.save();
      ctx.translate(this.x, this.y);
      switch (this.vehicle) {
        case 'bike': window.Sprites.drawPlayerOnBike(ctx, this.angle); break;
        case 'car':  window.Sprites.drawPlayerInCar(ctx, this.angle); break;
        case 'boat': window.Sprites.drawPlayerInBoat(ctx, this.angle); break;
        default:     window.Sprites.drawPlayerOnFoot(ctx, this.angle, this.walkPhase); break;
      }
      ctx.restore();
      if (this.muzzleAge < 1) {
        window.Sprites.drawMuzzleFlash(ctx, this.x, this.y, this.angle, this.muzzleAge);
      }
      ctx.globalAlpha = 1;
    }
  }

  // ============ Bullet ============
  class Bullet {
    constructor(x, y, vx, vy) {
      this.x = x; this.y = y;
      this.vx = vx; this.vy = vy;
      this.life = 0.7;
      this.dead = false;
      this.angle = Math.atan2(vy, vx);
      this.damage = 1;
    }
    update(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.life -= dt;
      if (this.life <= 0) this.dead = true;
    }
    render(ctx) {
      window.Sprites.drawBullet(ctx, this.x, this.y, this.angle);
    }
  }

  // ============ Animal ============
  // type defines stats + draw fn
  const ANIMAL_TYPES = {
    rabbit:   { hp: 1, points: 5,  speed: 140, r: 10, aggro: false, score: 5,  draw: 'drawRabbit' },
    deer:     { hp: 2, points: 10, speed: 110, r: 14, aggro: false, score: 10, draw: 'drawDeer' },
    boar:     { hp: 3, points: 15, speed: 90,  r: 15, aggro: true,  score: 15, draw: 'drawBoar', dmg: 12 },
    duck:     { hp: 1, points: 8,  speed: 95,  r: 10, aggro: false, score: 8,  draw: 'drawDuck' },
    crocodile:{ hp: 4, points: 20, speed: 105, r: 18, aggro: true,  score: 20, draw: 'drawCrocodile', dmg: 18 },
    tiger:    { hp: 5, points: 30, speed: 160, r: 17, aggro: true,  score: 30, draw: 'drawTiger', dmg: 22 },
    bear:     { hp: 6, points: 35, speed: 95,  r: 19, aggro: true,  score: 35, draw: 'drawBear', dmg: 28 },
    villager: { hp: 2, points: 0,  speed: 90,  r: 12, aggro: true,  score: 0,  draw: 'drawVillager', dmg: 10 },
  };

  class Animal {
    constructor(type, x, y) {
      const def = ANIMAL_TYPES[type];
      this.type = type;
      this.def = def;
      this.x = x; this.y = y;
      this.hp = def.hp;
      this.r = def.r;
      this.angle = Math.random() * Math.PI * 2;
      this.vx = 0; this.vy = 0;
      this.dead = false;
      this.runPhase = Math.random() * 10;
      this.aiTimer = 0;
      this.state = 'wander';
      this.attackCd = 0;
      this.alertRange = def.aggro ? 200 : 240; // aggressive ones charge; passive flee
      this.fleeTimer = 0;
    }

    update(dt, player) {
      this.aiTimer -= dt;
      this.attackCd = Math.max(0, this.attackCd - dt);
      this.runPhase += dt * 16;

      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (this.def.aggro) {
        // Charge player when close
        if (dist < this.alertRange) {
          this.state = 'attack';
          this.angle = Math.atan2(dy, dx);
          this.vx = Math.cos(this.angle) * this.def.speed;
          this.vy = Math.sin(this.angle) * this.def.speed;
          // attack on contact
          if (dist < this.r + player.r && this.attackCd <= 0) {
            player.takeDamage(this.def.dmg || 10);
            this.attackCd = 0.6;
          }
        } else {
          this.wander(dt);
        }
      } else {
        // Flee if hit or close
        if (this.fleeTimer > 0 || dist < 140) {
          this.state = 'flee';
          const fleeAngle = Math.atan2(-dy, -dx);
          this.angle = fleeAngle;
          this.vx = Math.cos(fleeAngle) * this.def.speed * 1.2;
          this.vy = Math.sin(fleeAngle) * this.def.speed * 1.2;
          this.fleeTimer = Math.max(0, this.fleeTimer - dt);
        } else {
          this.wander(dt);
        }
      }

      this.x += this.vx * dt;
      this.y += this.vy * dt;
    }

    wander(dt) {
      if (this.aiTimer <= 0) {
        this.aiTimer = 1 + Math.random() * 2;
        this.angle = Math.random() * Math.PI * 2;
        const s = this.def.speed * 0.4;
        this.vx = Math.cos(this.angle) * s;
        this.vy = Math.sin(this.angle) * s;
      }
    }

    takeHit(damage) {
      this.hp -= damage;
      this.fleeTimer = 3;
      if (this.hp <= 0) this.dead = true;
    }

    render(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      window.Sprites[this.def.draw](ctx, this.angle, this.runPhase);
      // health pip if damaged
      if (this.hp < this.def.hp) {
        const w = 24;
        const pct = this.hp / this.def.hp;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(-w/2, -this.r - 10, w, 4);
        ctx.fillStyle = pct > 0.5 ? '#4ade80' : pct > 0.25 ? '#f59e0b' : '#ef4444';
        ctx.fillRect(-w/2, -this.r - 10, w * pct, 4);
      }
      ctx.restore();
    }
  }

  // ============ House (Village raid) ============
  class House {
    constructor(x, y) {
      this.x = x; this.y = y;
      this.r = 36;
      this.looted = false;
      this.lootProgress = 0; // 0..1 -> looted when 1
      this.lootRequired = 1.5; // seconds of standing close
    }
    update(dt, player) {
      if (this.looted) return;
      const d = Math.hypot(player.x - this.x, player.y - this.y);
      if (d < this.r + player.r + 8) {
        this.lootProgress += dt;
        if (this.lootProgress >= this.lootRequired) {
          this.looted = true;
        }
      } else {
        this.lootProgress = Math.max(0, this.lootProgress - dt * 0.5);
      }
    }
    render(ctx) {
      window.Sprites.drawHouse(ctx, this.x, this.y, this.looted);
      if (!this.looted && this.lootProgress > 0) {
        const w = 60;
        const pct = this.lootProgress / this.lootRequired;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(this.x - w/2, this.y - 50, w, 6);
        ctx.fillStyle = '#f4c430';
        ctx.fillRect(this.x - w/2, this.y - 50, w * pct, 6);
      }
    }
  }

  // ============ Crate (smashable) ============
  class Crate {
    constructor(x, y) {
      this.x = x; this.y = y;
      this.r = 18;
      this.hp = 2;
      this.dead = false;
    }
    update() {}
    takeHit(d) {
      this.hp -= d;
      if (this.hp <= 0) this.dead = true;
    }
    render(ctx) {
      window.Sprites.drawCrate(ctx, this.x, this.y);
    }
  }

  // ============ Pickup ============
  class Pickup {
    constructor(type, x, y) {
      this.type = type; // 'coin' | 'ammo' | 'heart'
      this.x = x; this.y = y;
      this.r = 12;
      this.dead = false;
      this.t = Math.random() * 1000;
    }
    update(dt, player) {
      this.t += dt * 1000;
      const d = Math.hypot(player.x - this.x, player.y - this.y);
      if (d < this.r + player.r) {
        this.dead = true;
        if (this.type === 'coin') {
          player.score += 5;
          window.SFX.playCoin();
        } else if (this.type === 'ammo') {
          player.ammo = Math.min(player.maxAmmo, player.ammo + 15);
          window.SFX.playReload();
        } else if (this.type === 'heart') {
          player.hp = Math.min(player.maxHp, player.hp + 25);
          window.SFX.playCoin();
        }
      }
    }
    render(ctx) {
      if (this.type === 'coin') window.Sprites.drawCoin(ctx, this.x, this.y, this.t);
      else if (this.type === 'ammo') window.Sprites.drawAmmoBox(ctx, this.x, this.y);
      else if (this.type === 'heart') window.Sprites.drawHeart(ctx, this.x, this.y);
    }
  }

  // ============ Particle ============
  class Particle {
    constructor(x, y, vx, vy, life, color, size = 2) {
      this.x = x; this.y = y; this.vx = vx; this.vy = vy;
      this.life = life; this.maxLife = life;
      this.color = color; this.size = size;
      this.dead = false;
    }
    update(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vx *= 0.92;
      this.vy *= 0.92;
      this.life -= dt;
      if (this.life <= 0) this.dead = true;
    }
    render(ctx) {
      window.Sprites.drawParticle(ctx, this);
    }
  }

  function spawnBlood(particles, x, y) {
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 60 + Math.random() * 120;
      particles.push(new Particle(x, y, Math.cos(a) * s, Math.sin(a) * s, 0.4 + Math.random() * 0.3, '#a83236', 2 + Math.random() * 2));
    }
  }

  function spawnSplinters(particles, x, y) {
    for (let i = 0; i < 10; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 80 + Math.random() * 140;
      particles.push(new Particle(x, y, Math.cos(a) * s, Math.sin(a) * s, 0.4 + Math.random() * 0.3, '#a47148', 2 + Math.random() * 2));
    }
  }

  window.Entities = {
    Player, Bullet, Animal, House, Crate, Pickup, Particle,
    ANIMAL_TYPES, spawnBlood, spawnSplinters,
  };
})();
