const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://localhost:3002';
const OUT_DIR = path.join(__dirname, 'clean_scenes_3002');

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--window-size=1920,1080', '--no-sandbox'],
    defaultViewport: { width: 1920, height: 1080 },
  });

  const page = await browser.newPage();
  console.log('Navigating to ' + URL);
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 35000 });

  // Hide any cookie banner or floating dev overlays
  await page.addStyleTag({
    content: `
      div[class*="cookie"], #cookie-banner, [role="dialog"], .cookie-banner { display: none !important; }
      * { -webkit-font-smoothing: antialiased; }
    `
  });

  // Wait 3.5s for initial preloader to fade
  await new Promise(r => setTimeout(r, 3500));

  // Permanently remove cookie banner and right floating widgets
  await page.evaluate(() => {
    localStorage.setItem("chaingpt_cookie_consent", "accepted");
    document.querySelectorAll('*').forEach(el => {
      if (el.textContent && el.textContent.includes('third-party cookies')) {
        el.closest('div[class*="fixed"]')?.remove() || el.remove();
      }
    });
  });

  // 1. Hero
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, '01_hero.jpg'), quality: 98 });
  console.log('Captured 01_hero.jpg');

  // 2. ChainHero / Supercharging Student Builders
  await page.evaluate(() => {
    const el = document.getElementById('incubation-hub');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    else window.scrollTo(0, 1080);
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT_DIR, '02_supercharging.jpg'), quality: 98 });
  console.log('Captured 02_supercharging.jpg');

  // 3. Student Incubator with Coin Capsule
  await page.evaluate(() => {
    const allSecs = Array.from(document.querySelectorAll('section'));
    for (const s of allSecs) {
      if (s.textContent.includes('STUDENT INCUBATOR') || s.textContent.includes('AUTONOMOUS INCUBATION POD')) {
        s.scrollIntoView({ behavior: 'instant', block: 'center' });
        break;
      }
    }
  });
  await new Promise(r => setTimeout(r, 1800));
  await page.screenshot({ path: path.join(OUT_DIR, '03_incubation_capsule.jpg'), quality: 98 });
  console.log('Captured 03_incubation_capsule.jpg');

  // 4. Team Grid
  await page.evaluate(() => {
    const el = document.getElementById('team');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    else window.scrollTo(0, 5200);
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT_DIR, '04_team.jpg'), quality: 98 });
  console.log('Captured 04_team.jpg');

  // 5. Footer Manifesto
  await page.evaluate(() => window.scrollTo(0, 10000));
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT_DIR, '05_manifesto.jpg'), quality: 98 });
  console.log('Captured 05_manifesto.jpg');

  await browser.close();
})();

