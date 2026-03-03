# Promotional Video

A **30-second** promotional video for the System Design Simulator, created with **Remotion** and full-size screenshots captured via **Google Chrome** (1920×1080).

## Features

- **30-second duration** – Extended intro, build sequence, and outro
- **3D device showcase** – Laptop/computer mockup with perspective, diagonal angles, zoom in/out
- **Build progression** – Step-by-step story showing drag & drop:
  1. Empty canvas
  2. Place Load Balancer
  3. Add API Server
  4. Connect LB → API
  5. Full design (Cache, DB)
  6. Simulation results
- **Varying angles** – Each scene has a different `rotateY` (diagonal) and `rotateX` for dynamic feel
- **Zoom animations** – Zoom in at scene start, subtle floating motion

## Quick Start

### 1. Capture screenshots (full-size Chrome)

```bash
# Terminal 1: Start the app
npm run dev

# Terminal 2: Capture (use app's URL if different port)
APP_URL=http://localhost:5173 npm run video:capture
# or: npm run video:capture
```

Screenshots are saved to `public/screenshots/` at **1920×1080** using Google Chrome.

### 2. Render the video

```bash
npm run video:render
```

Output: `out/promotional.mp4` (1920×1080, 30 seconds, 30fps)

If the render times out (large screenshots), run with a longer timeout:
```bash
npx remotion render remotion/index.ts PromotionalVideo out/promotional.mp4 --timeout=120000
```

### 3. Preview in Remotion Studio

```bash
npm run video:studio
```

## Screenshots

The capture script uses **Google Chrome** (not Cursor's limited browser) for full-size, high-quality screenshots. If Chrome isn't installed, it falls back to bundled Chromium.

| Scene | URL | Description |
|-------|-----|-------------|
| empty | `?demo=1&scene=empty` | Blank canvas |
| step1-lb | `?demo=1&scene=step1-lb` | Load Balancer placed |
| step2-api | `?demo=1&scene=step2-api` | LB + API Server |
| step3-connect | `?demo=1&scene=step3-connect` | LB → API connected |
| design | `?demo=1&scene=design` | Full architecture |
| results | `?demo=1&scene=results` | Simulation results |

## Demo Mode

The app supports URL params for demo states. See `src/data/demoStates.ts` for the full list.
