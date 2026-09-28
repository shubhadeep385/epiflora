import puppeteer from 'puppeteer';
import path from 'node:path';
import fs from 'node:fs';

const OUT_DIR = path.resolve(process.cwd(), 'docs/screenshots');

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log('🚀 Launching headless browser for high-resolution screenshot capture...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--use-gl=angle'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  const BASE_URL = 'http://localhost:5173';

  // 1. Homepage Hero
  console.log('📸 Capturing 01_hero_flagship.png...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUT_DIR, '01_hero_flagship.png') });

  // 2. Multispectral Signals Section
  console.log('📸 Capturing 02_multispectral_signals.png...');
  await page.evaluate(() => {
    const el = document.getElementById('signals');
    if (el) el.scrollIntoView();
  });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, '02_multispectral_signals.png') });

  // 3. Crop Doctor Workspace
  console.log('📸 Capturing 03_crop_doctor_diagnostic.png...');
  await page.goto(`${BASE_URL}/diagnose`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT_DIR, '03_crop_doctor_diagnostic.png') });

  // 4. Voice Copilot Workspace
  console.log('📸 Capturing 04_voice_copilot_kisan.png...');
  await page.goto(`${BASE_URL}/ask`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT_DIR, '04_voice_copilot_kisan.png') });

  // 5. Weather & Disease Radar Workspace
  console.log('📸 Capturing 05_weather_disease_radar.png...');
  await page.goto(`${BASE_URL}/weather`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT_DIR, '05_weather_disease_radar.png') });

  // 6. Living Soil & Liebig Engine Workspace
  console.log('📸 Capturing 06_living_soil_liebig.png...');
  await page.goto(`${BASE_URL}/soil`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT_DIR, '06_living_soil_liebig.png') });

  // 7. BRICS 3D Sovereign Earth Network
  console.log('📸 Capturing 07_brics_sovereign_earth.png...');
  await page.goto(`${BASE_URL}/network`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 2500));
  await page.screenshot({ path: path.join(OUT_DIR, '07_brics_sovereign_earth.png') });

  // 8. System Architecture Workspace
  console.log('📸 Capturing 08_system_architecture.png...');
  await page.goto(`${BASE_URL}/architecture`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT_DIR, '08_system_architecture.png') });

  // 9. Agronomy Dashboard Workspace
  console.log('📸 Capturing 09_agronomy_dashboard.png...');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT_DIR, '09_agronomy_dashboard.png') });

  // 10. Hackathon Honors & DPG Footer
  console.log('📸 Capturing 10_hackathon_honors.png...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight - 1200);
  });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT_DIR, '10_hackathon_honors.png') });

  await browser.close();
  console.log('✅ All 10 high-resolution screenshots successfully captured in docs/screenshots/');
}

main().catch((err) => {
  console.error('❌ Failed to capture screenshots:', err);
  process.exit(1);
});
