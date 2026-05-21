# Stopwatch & Timer App

A polished, neumorphic-design time-tracking app built with React 19 and Vite. Features a real-time stopwatch with lap tracking, a countdown timer with presets, drift-free timing logic, Web Audio alarm, animated loading screen, and seamless light/dark theme toggle — all with zero CSS framework dependencies.

---


## Features

- **Stopwatch** — start, stop, resume, lap, and reset with centisecond precision
- **Lap tracking** — scrollable lap list; best lap highlighted green 🏆, worst lap in red
- **Countdown Timer** — set any H:M:S duration; four quick-set preset pills (1 min, 5 min, 10 min, 25 min)
- **SVG progress ring** — drains smoothly as the countdown progresses
- **Alarm sound** — three-tone Web Audio beep fires when the timer reaches zero (no external audio files needed)
- **Analog clock face** — SVG needle rotates in real time, synced to elapsed seconds
- **Neumorphic design** — soft extruded shadows, pastel palette, tactile button feel
- **Light / Dark theme** — one-click toggle; theme persists for the session
- **Animated splash screen** — full-screen loading animation appears before React mounts, fades out on app ready
- **Responsive layout** — mobile-first, also renders as a floating card on desktop (≥ 768 px)
- **Drift-free timers** — `Date.now()`-anchored intervals; pausing/resuming never loses time

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| UI framework | [React 19](https://react.dev) | Component model, hooks |
| Build tool | [Vite 8](https://vitejs.dev) | Dev server, HMR, production build |
| Styling | Custom CSS (no framework) | Neumorphic design system via CSS custom properties |
| Icons | [react-icons 5](https://react-icons.github.io/react-icons/) | Nav icons (`io5`), theme toggle icons (`bs`) |
| Audio | Web Audio API (browser native) | Timer alarm — no external files |
| Animation | CSS `@keyframes` | Splash needle spin, dot pulse, timer flash |

> Tailwind CSS is listed as a dev dependency (scaffolded by the Vite template) but is **not used** — all styles are in `src/index.css`.

---

## Folder & File Structure

```
stopwatch-and-timer-app/
│
├── index.html                  # Entry HTML — contains inline splash screen CSS + markup
├── vite.config.js              # Vite config (React plugin only)
├── eslint.config.js            # ESLint flat config
├── package.json
│
├── public/
│   ├── favicon.svg             # App favicon
│   └── icons.svg               # SVG sprite (reserved)
│
└── src/
    ├── main.jsx                # React root — mounts <App /> into #root
    ├── index.css               # Global styles: CSS tokens, neumorphic utilities,
    │                           #   layout, stopwatch, timer, nav, scrollbar
    ├── App.css                 # (unused — kept from Vite scaffold)
    │
    ├── App.jsx                 # Root component
    │                           #   • Tab state (stopwatch / timer / alarm / world)
    │                           #   • Dark/light theme toggle → html[data-theme]
    │                           #   • Splash screen dismiss on mount
    │                           #   • Bottom navigation bar
    │
    ├── components/
    │   ├── Stopwatch.jsx       # Analog SVG clock + digital display + lap list
    │   │                       #   Layout: static top section (clock, time, controls)
    │   │                       #           + independently scrollable lap section
    │   └── Timer.jsx           # Countdown ring + preset pills + H/M/S inputs
    │                           #   Web Audio alarm fires on finish
    │
    ├── hooks/
    │   ├── useStopwatch.js     # elapsed, running, laps — start/stop/reset/lap
    │   │                       #   Drift-free: accumulates time across pause/resume
    │   └── useTimer.js         # remaining, running, finished, progress — set/start/pause/reset
    │                           #   Drift-free: anchors to Date.now() + remaining on start
    │
    ├── utils/
    │   └── format.js           # formatStopwatch(ms) → "MM:SS.cs" or "HH:MM:SS.cs"
    │                           # formatTimer(ms)      → { h, m, s } padded strings
    │
    ├── context/
    │   └── ThemeContext.jsx    # (legacy — theme is now managed via html[data-theme])
    │
    └── assets/
        ├── hero.png            # (reserved)
        ├── react.svg           # Vite scaffold asset
        ├── vite.svg            # Vite scaffold asset
        └── previews/           # Add your own screenshots here (see Preview section)
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9 (or pnpm / yarn)

### Install

```bash
git clone <your-repo-url>
cd "StopWatch and Timer APP"
npm install
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build       # outputs to dist/
npm run preview     # serve the production build locally
```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with HMR on port 5173 |
| `npm run build` | TypeScript check + production bundle → `dist/` |
| `npm run preview` | Locally preview the production build |
| `npm run lint` | Run ESLint across the project |

---

## Design System

All visual tokens are CSS custom properties set on `:root` (light) and `html[data-theme="dark"]` (dark). Switching themes is a single attribute change: `document.documentElement.dataset.theme = 'dark'`.

### Tokens

| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| `--bg` | `#dce8f4` | `#2a2d3e` | Base surface color |
| `--sd` | `rgba(168,193,220,.72)` | `rgba(10,11,20,.92)` | Dark shadow |
| `--sl` | `rgba(255,255,255,.92)` | `rgba(60,68,100,.60)` | Light shadow |
| `--text` | `#4d6480` | `#c0cfde` | Primary text |
| `--text-muted` | `#8aaac8` | `#5e7898` | Secondary / label text |
| `--accent` | `#6b9fd4` | `#7b9fd4` | Highlight, ring, active |
| `--needle` | `rgba(255,255,255,.88)` | `rgba(255,255,255,.85)` | SVG clock needle |
| `--lap-good` | `#5bb89a` | `#4caf8a` | Best lap text |
| `--lap-bad` | `#d47070` | `#d46464` | Worst lap text |

### Neumorphic Utility Classes

```css
.neu-raised     /* extruded — element pops out of the surface  */
.neu-raised-sm  /* smaller extruded shadow — for buttons/pills */
.neu-inset      /* pressed in — for clock faces, input fields  */
.neu-inset-sm   /* smaller inset — for number inputs           */
.neu-flat       /* subtle raised — for lap rows                */
```

---

## Key Implementation Details

### Drift-free Stopwatch (`useStopwatch.js`)

Uses an `accumulatedRef` pattern. Each pause adds `Date.now() - startTime` to the accumulator, so elapsed time survives multiple pause/resume cycles without drift from `setInterval` jitter.

```js
// On start:
startTimeRef.current = Date.now();
setInterval(() => setElapsed(accumulatedRef.current + (Date.now() - startTimeRef.current)), 10);

// On pause:
accumulatedRef.current += Date.now() - startTimeRef.current;
```

### Drift-free Timer (`useTimer.js`)

Anchors to wall-clock time on every start rather than trusting interval ticks:

```js
endTimeRef.current = Date.now() + remaining;
setInterval(() => {
  const left = endTimeRef.current - Date.now();
  if (left <= 0) { /* finished */ } else setRemaining(left);
}, 50);
```

### Web Audio Alarm

Three oscillator tones played via the Web Audio API — no audio file required:

```js
[[0, 880], [0.4, 1100], [0.8, 880]].forEach(([t, freq]) => {
  const osc = ctx.createOscillator(), gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.frequency.value = freq;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.35);
  osc.start(ctx.currentTime + t);
});
```

### Timer SVG Ring

The progress ring uses `strokeDashoffset` to drain from full to empty:

```js
const circumference = 2 * Math.PI * R;          // total arc length
const progress      = (totalMs - remaining) / totalMs;  // 0 → 1
const strokeDashoffset = circumference * progress;       // drains ring
```

### Splash Screen

Embedded as raw HTML/CSS in `index.html` — visible **before React loads**. Dismissed by `App.jsx` on first mount:

```js
useEffect(() => {
  const splash = document.getElementById('splash');
  setTimeout(() => {
    splash.classList.add('sp-hide');      // CSS opacity: 0 transition
    setTimeout(() => splash.remove(), 600);
  }, 1400);
}, []);
```

### Scroll Architecture (Stopwatch)

The clock face and controls are in a `flex-shrink: 0` wrapper — only the lap list scrolls:

```
Stopwatch root  (flex: 1, overflow: hidden)
├── Static section  (flex-shrink: 0)   ← clock, time, buttons
└── Scroll section  (flex: 1, overflow-y: auto, min-height: 0)   ← laps only
```

---

## Roadmap

| Feature | Status |
|---------|--------|
| Stopwatch with laps | ✅ Done |
| Countdown timer | ✅ Done |
| Light / Dark theme | ✅ Done |
| Splash screen | ✅ Done |
| Alarm clock | 🚧 Coming soon |
| World clock | 🚧 Coming soon |

---

## License

MIT — free to use, modify, and distribute.
