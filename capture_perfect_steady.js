const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--window-size=1920,1080', '--no-sandbox'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('hasLoadedBefore', 'true');
    localStorage.setItem('chaingpt_cookie_consent', 'accepted');
  });

  await page.goto('http://localhost:3002/', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.addStyleTag({
    content: `
      div[class*="cookie"], #cookie-banner, [role="dialog"], .cookie-banner { display: none !important; }
    `
  });

  await page.evaluate(() => {
    // Find section with STUDENT INCUBATOR
    const allSecs = Array.from(document.querySelectorAll('section'));
    for (const s of allSecs) {
      if (s.textContent.includes('AUTONOMOUS INCUBATION POD') || s.textContent.includes('STUDENT INCUBATOR')) {
        s.scrollIntoView({ behavior: 'instant', block: 'center' });
        break;
      }
    }
  });

  // Wait 3.5s for scramble to finish
  await new Promise(r => setTimeout(r, 3500));
  await page.screenshot({ path: path.join(__dirname, 'clean_scenes_3002', '03_capsule_unscrambled.jpg'), quality: 98 });
  console.log('Saved 03_capsule_unscrambled.jpg');

  await browser.close();
})();
