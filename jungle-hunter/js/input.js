// input.js — Unified input: keyboard + mouse + touch (virtual joystick + fire button)
(function () {
  const Input = {
    move: { x: 0, y: 0 },          // unit vector roughly
    aim: { x: 0, y: 0 },           // world-space target offset from player
    aimAngle: 0,                   // radians
    shoot: false,                  // edge-triggered each frame
    shootHeld: false,
    reload: false,
    pause: false,
    hasMouse: false,
    isTouch: false,
  };

  const keys = {};
  let canvas = null;
  let mouseScreen = { x: 0, y: 0 };

  // ----- Keyboard -----
  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
    if (e.code === 'Space') Input.shoot = true;
    if (e.code === 'KeyR') Input.reload = true;
    if (e.code === 'Escape' || e.code === 'KeyP') Input.pause = true;
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  function updateKeyboardMove() {
    let x = 0, y = 0;
    if (keys['KeyA'] || keys['ArrowLeft']) x -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) x += 1;
    if (keys['KeyW'] || keys['ArrowUp']) y -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) y += 1;
    const mag = Math.hypot(x, y);
    if (mag > 0) { x /= mag; y /= mag; }
    // Only override if no joystick input is active
    if (!joyActive) {
      Input.move.x = x;
      Input.move.y = y;
    }
    Input.shootHeld = !!keys['Space'] || mouseDown || fireBtnDown;
  }

  // ----- Mouse -----
  function bindMouse(c) {
    canvas = c;
    c.addEventListener('mousemove', (e) => {
      const r = c.getBoundingClientRect();
      mouseScreen.x = e.clientX - r.left;
      mouseScreen.y = e.clientY - r.top;
      Input.hasMouse = true;
    });
    c.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        mouseDown = true;
        Input.shoot = true;
      }
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) mouseDown = false;
    });
  }

  let mouseDown = false;

  // Updated each frame by Game with player screen pos so we can compute aim
  function updateAimFromMouse(playerScreenX, playerScreenY) {
    if (!Input.hasMouse) return;
    const dx = mouseScreen.x - playerScreenX;
    const dy = mouseScreen.y - playerScreenY;
    Input.aimAngle = Math.atan2(dy, dx);
    Input.aim.x = dx;
    Input.aim.y = dy;
  }

  // ----- Touch: virtual joystick -----
  let joystickEl = null;
  let knobEl = null;
  let joyActive = false;
  let joyTouchId = null;
  let joyCenter = { x: 0, y: 0 };
  const joyRadius = 50;

  function bindJoystick(el, knob) {
    joystickEl = el;
    knobEl = knob;

    el.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      joyTouchId = t.identifier;
      const r = el.getBoundingClientRect();
      joyCenter.x = r.left + r.width / 2;
      joyCenter.y = r.top + r.height / 2;
      joyActive = true;
      Input.isTouch = true;
      updateJoystick(t.clientX, t.clientY);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (!joyActive) return;
      for (const t of e.changedTouches) {
        if (t.identifier === joyTouchId) {
          e.preventDefault();
          updateJoystick(t.clientX, t.clientY);
        }
      }
    }, { passive: false });

    const endJoy = (e) => {
      if (!joyActive) return;
      for (const t of e.changedTouches) {
        if (t.identifier === joyTouchId) {
          joyActive = false;
          joyTouchId = null;
          Input.move.x = 0;
          Input.move.y = 0;
          if (knobEl) knobEl.style.transform = 'translate(0,0)';
        }
      }
    };
    window.addEventListener('touchend', endJoy);
    window.addEventListener('touchcancel', endJoy);
  }

  function updateJoystick(cx, cy) {
    let dx = cx - joyCenter.x;
    let dy = cy - joyCenter.y;
    const dist = Math.hypot(dx, dy);
    const limited = Math.min(dist, joyRadius);
    if (dist > 0) {
      dx = (dx / dist) * limited;
      dy = (dy / dist) * limited;
    }
    if (knobEl) knobEl.style.transform = `translate(${dx}px, ${dy}px)`;
    Input.move.x = dx / joyRadius;
    Input.move.y = dy / joyRadius;
  }

  // ----- Touch: Fire / Reload buttons -----
  let fireBtnDown = false;
  function bindFireButton(btn) {
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      fireBtnDown = true;
      Input.shoot = true;
      Input.isTouch = true;
    }, { passive: false });
    btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      fireBtnDown = false;
    }, { passive: false });
    btn.addEventListener('touchcancel', () => { fireBtnDown = false; });
    // Also support mouse for testing
    btn.addEventListener('mousedown', () => { fireBtnDown = true; Input.shoot = true; });
    btn.addEventListener('mouseup', () => { fireBtnDown = false; });
    btn.addEventListener('mouseleave', () => { fireBtnDown = false; });
  }

  function bindReloadButton(btn) {
    const fire = (e) => { e.preventDefault(); Input.reload = true; };
    btn.addEventListener('touchstart', fire, { passive: false });
    btn.addEventListener('click', () => { Input.reload = true; });
  }

  // ----- Frame tick -----
  function tick() {
    updateKeyboardMove();
  }

  // Reset edge-triggered flags
  function endFrame() {
    Input.shoot = false;
    Input.reload = false;
    Input.pause = false;
  }

  window.Input = Input;
  window.InputBindings = {
    bindMouse, bindJoystick, bindFireButton, bindReloadButton,
    updateAimFromMouse, tick, endFrame,
  };
})();
