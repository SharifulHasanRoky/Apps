# Jungle Hunter — শিকার অভিযান

A polished, offline-capable HTML5 hunting game with 5 levels, multiple vehicles
(foot, bike, car, boat), animals to hunt, and a village raid. Designed to run
in any modern browser **and** to be installed as an Android app (APK or PWA).

## Features

- 5 hand-tuned levels, each with its own biome and gameplay twist
  - **Forest Hunt** — on foot, beginner level (rabbits, deer, boars)
  - **Bike Hunt** — faster movement, denser forest
  - **River Hunt** — boat across water, ducks and crocodiles
  - **Deep Jungle** — armed car, dangerous tigers and bears
  - **Village Raid** — loot houses, smash crates, dodge angry villagers
- 8 distinct creatures with unique behaviour (passive flee vs. aggressive charge)
- Smooth top-down 2D combat with bullets, particles, and screen-shake-free flow
- Procedural sound effects (no audio assets needed)
- Mobile-first controls: virtual joystick + FIRE / RELOAD buttons + auto-aim
- Full keyboard + mouse support on desktop (WASD, mouse aim, click to shoot)
- HUD with HP, ammo, score, level objective, and a live mini-map
- Pause / resume, level select, persistent best score & unlocked levels
- PWA-ready: manifest + service worker → works offline once loaded
- Zero dependencies, all art drawn procedurally on `<canvas>`

## How to Play (locally)

The game is pure static files. Any static server works.

```bash
# from the jungle-hunter folder
python3 -m http.server 8080
# then open http://localhost:8080
```

> Service workers and the PWA install prompt require `http(s)://` — opening
> `index.html` directly with `file://` will play but won't install as an app.

## Controls

| Action  | Desktop                  | Mobile                       |
|---------|--------------------------|------------------------------|
| Move    | WASD / Arrow keys        | Left virtual joystick        |
| Aim     | Mouse pointer            | Auto-aim at nearest target   |
| Shoot   | Space or Left Click      | FIRE button (red, right)     |
| Reload  | R                        | RELOAD button (blue)         |
| Pause   | P or Esc                 | II button in the HUD         |

## How to get it as an Android APK

You have two solid paths. Both work without writing any native code.

### Option A — Install as a PWA (instant, no build)

1. Host the `jungle-hunter/` folder on any static host
   (GitHub Pages, Netlify, Vercel, Cloudflare Pages, etc.).
2. Open the URL in **Chrome on Android**.
3. Tap the menu → **Install app** (or "Add to Home screen").
4. The game appears as a full-screen app on the home screen, runs offline.

This is the fastest "ready-to-play" path.

### Option B — Build a real `.apk` with PWA Builder (recommended)

[PWA Builder](https://www.pwabuilder.com/) is free and runs entirely in the
browser — no Android Studio required.

1. Deploy the `jungle-hunter/` folder to a public HTTPS URL.
2. Go to https://www.pwabuilder.com/ and paste your URL.
3. Click **Package For Stores → Android**.
4. Download the generated `.apk` (or `.aab` for Play Store).
5. Sideload the APK onto your phone.

PWA Builder uses Google's official Bubblewrap tooling and produces a Trusted
Web Activity APK that runs the game full-screen.

### Option C — Capacitor (native shell, more control)

If you want to publish on Play Store with native plugins later, wrap with
[Capacitor](https://capacitorjs.com/):

```bash
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Jungle Hunter" "com.example.junglehunter" --web-dir=.
npx cap add android
npx cap copy android
npx cap open android   # opens Android Studio → Build APK
```

You will need Android Studio + JDK 17 installed locally for this option.

## Project structure

```
jungle-hunter/
├── index.html          # Page shell, menus, HUD, canvas
├── manifest.json       # PWA manifest
├── sw.js               # Service worker (offline cache)
├── css/style.css       # All styles, dark green theme
├── icons/
│   ├── icon.svg
│   ├── icon-192.png
│   ├── icon-512.png
│   └── _make_icons.py  # Pure-stdlib icon generator (no deps)
└── js/
    ├── sprites.js      # Procedural canvas drawing for everything
    ├── audio.js        # Procedural SFX via WebAudio
    ├── input.js        # Keyboard, mouse, touch joystick + buttons
    ├── entities.js     # Player, Animal, Bullet, House, Crate, Pickup
    ├── levels.js       # 5 level definitions
    ├── game.js         # Game class, world, update/render loop
    └── main.js         # Entry, menu wiring, persistence
```

## Tweaking gameplay

- **Add a level** → append to `LEVELS` in `js/levels.js`. Every field is
  documented in existing entries.
- **Add an animal** → add an entry to `ANIMAL_TYPES` in `js/entities.js`
  with `{ hp, points, speed, r, aggro, draw, dmg? }` and add a matching
  `drawXxx` function in `js/sprites.js`.
- **Tune difficulty** → adjust `target`, `timeLimit`, `ammoStart`, and
  `spawn` counts per level.

## License

MIT — do whatever you like. Have fun hunting.
