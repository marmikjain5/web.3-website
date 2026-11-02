const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log("Launching headless Chrome at 1920x1080...");
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: [
      '--window-size=1920,1080',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--hide-scrollbars',
      '--disable-gpu',
    ],
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();
  
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('hasLoadedBefore', 'true');
    localStorage.setItem('chaingpt_cookie_consent', 'accepted');
  });

  console.log("Navigating to http://localhost:3002/ ...");
  await page.goto('http://localhost:3002/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Hide floating sidebar for clean cinematic film captures
  await page.evaluate(() => {
    const sidebars = document.querySelectorAll('aside, [class*="CyberSidebar"], [class*="fixed right-4"]');
    sidebars.forEach(el => el.style.display = 'none');
  });

  // 1. Hero
  await page.screenshot({ path: 'clean_scenes_3002/01_hero_pristine.jpg', quality: 100 });
  console.log("Captured 01_hero_pristine.jpg");

  // 2. Supercharging Student Builders
  await page.evaluate(() => {
    const el = document.getElementById('incubation-hub');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    else window.scrollTo({ top: 1040, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'clean_scenes_3002/02_supercharging_pristine.jpg', quality: 100 });
  console.log("Captured 02_supercharging_pristine.jpg");

  // 3. Student Incubator section
  await page.evaluate(() => {
    window.scrollTo({ top: 2060, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'clean_scenes_3002/03_incubation_pristine.jpg', quality: 100 });
  console.log("Captured 03_incubation_pristine.jpg");

  // 4. Dedicated Laboratory Page (AI Agent + Coin)
  console.log("Navigating to http://localhost:3002/laboratory ...");
  await page.goto('http://localhost:3002/laboratory', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => {
    const sidebars = document.querySelectorAll('aside, [class*="CyberSidebar"], [class*="fixed right-4"]');
    sidebars.forEach(el => el.style.display = 'none');
  });
  await page.screenshot({ path: 'clean_scenes_3002/04_laboratory_pristine.jpg', quality: 100 });
  console.log("Captured 04_laboratory_pristine.jpg");

  // 5. Manifesto / Grand Finale CTA
  await page.goto('http://localhost:3002/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const sidebars = document.querySelectorAll('aside, [class*="CyberSidebar"], [class*="fixed right-4"]');
    sidebars.forEach(el => el.style.display = 'none');
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'clean_scenes_3002/05_manifesto_pristine.jpg', quality: 100 });
  console.log("Captured 05_manifesto_pristine.jpg");

  await browser.close();
  console.log("All 5 pristine scenes captured flawlessly!");
})();
