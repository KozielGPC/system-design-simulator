#!/usr/bin/env node
/**
 * Captures full-size screenshots using Chrome (not Cursor's limited browser).
 * Run with: node scripts/capture-screenshots.mjs
 *
 * Prerequisites:
 * 1. Start the app: npm run dev
 * 2. Ensure app is running on the URL below (default: http://localhost:5173)
 *
 * Uses Google Chrome in 1920x1080 for high-quality screenshots.
 */

import puppeteer from 'puppeteer';
import { mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'public', 'screenshots');

const APP_URL = process.env.APP_URL || 'http://localhost:5173';

// Demo scenes to capture - includes build progression for drag/drop story
const SCENES = [
  { id: 'empty', label: 'Empty canvas' },
  { id: 'step1-lb', label: 'After placing Load Balancer' },
  { id: 'step2-api', label: 'After placing API Server' },
  { id: 'step3-connect', label: 'After connecting LB → API' },
  { id: 'design', label: 'Full design with Cache & DB' },
  { id: 'results', label: 'Simulation results' },
];

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Use Chrome if available (full size, better rendering)
  const chromePath =
    process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : process.platform === 'win32'
        ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        : '/usr/bin/google-chrome';

  const launchOptions = {
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1920,1080',
      '--force-device-scale-factor=1',
    ],
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    },
  };

  // Try Chrome first (full size), fallback to bundled Chromium
  if (existsSync(chromePath)) {
    launchOptions.executablePath = chromePath;
    console.log('Using Google Chrome for full-size 1920x1080 capture');
  } else {
    console.log('Chrome not found, using bundled Chromium (install Chrome for best results)');
  }

  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();

  // Set viewport explicitly for consistency
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  for (const scene of SCENES) {
    const url = `${APP_URL}/?demo=1&scene=${scene.id}`;
    console.log(`Capturing: ${scene.label} (${scene.id})...`);

    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 15000,
    });

    // Wait for React to render
    await page.waitForSelector('[data-testid="canvas"], .react-flow, .bg-canvas', {
      timeout: 5000,
    }).catch(() => {});

    await new Promise((r) => setTimeout(r, 500));

    const screenshotPath = join(OUTPUT_DIR, `screenshot-${scene.id}.png`);
    await page.screenshot({
      path: screenshotPath,
      type: 'png',
    });

    console.log(`  → ${screenshotPath}`);
  }

  await browser.close();
  console.log('\nDone! Screenshots saved to public/screenshots/');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
