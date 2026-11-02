const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--window-size=1920,1080', '--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  
  console.log('Navigating to http://localhost:3001 ...');
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
  await page.waitForSelector('h1');

  // Trigger all elements to be visible (kill GSAP opacity:0)
  const revealPage = async () => {
    await page.evaluate(() => {
      // Hide cookie banner
      document.querySelectorAll('*').forEach(el => {
        if (el.textContent && (el.textContent.includes('third-party cookies') || el.textContent.includes('We use third-party cookies'))) {
          el.style.display = 'none';
        }
      });
      // Hide floating social dock on the right
      document.querySelectorAll('div, aside, nav').forEach(d => {
        const style = window.getComputedStyle(d);
        if (style.position === 'fixed' && (parseInt(style.right, 10) < 50 || parseInt(style.right, 10) === 0)) {
          if (!d.querySelector('header')) {
            d.style.display = 'none';
          }
        }
      });

      // Force GSAP elements to full opacity
      document.querySelectorAll('*').forEach(el => {
        if (el.style.opacity === '0') {
          el.style.opacity = '1';
        }
      });
    });
  };

  // 1. Hero (0)
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 1000));
  await revealPage();
  await page.screenshot({ path: 'captures/scene1_hero.jpg', quality: 95 });
  console.log('Captured scene1_hero.jpg');

  // 2. ChainHero (1080)
  await page.evaluate(() => window.scrollTo(0, 1080));
  await new Promise(r => setTimeout(r, 1000));
  await revealPage();
  await page.screenshot({ path: 'captures/scene2_chainhero.jpg', quality: 95 });
  console.log('Captured scene2_chainhero.jpg');

  // 3. Student Incubator (2074)
  await page.evaluate(() => window.scrollTo(0, 2074));
  await new Promise(r => setTimeout(r, 1000));
  await revealPage();
  await page.screenshot({ path: 'captures/scene3_incubation.jpg', quality: 95 });
  console.log('Captured scene3_incubation.jpg');

  // 4. Team Section (5560)
  await page.evaluate(() => window.scrollTo(0, 5560));
  await new Promise(r => setTimeout(r, 1000));
  await revealPage();
  await page.screenshot({ path: 'captures/scene4_team.jpg', quality: 95 });
  console.log('Captured scene4_team.jpg');

  // 5. Footer (Scroll to bottom)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 1500));
  await revealPage();
  await page.screenshot({ path: 'captures/scene5_footer.jpg', quality: 95 });
  console.log('Captured scene5_footer.jpg');

  console.log('All 5 scenes captured with full visibility!');
  await browser.close();
})();
