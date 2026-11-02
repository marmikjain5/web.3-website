const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://localhost:3001';
const OUT_DIR = path.join(__dirname, 'captures_clean');

const scenes = [
  { name: 'scene1_hero',        scroll: 0,    wait: 3000 },
  { name: 'scene2_chainhero',    scroll: 1080, wait: 3000 },
  { name: 'scene3_incubation',   scroll: 2074, wait: 3000 },
  { name: 'scene4_incubator2',   scroll: 3200, wait: 3000 },
  { name: 'scene5_team',         scroll: 5560, wait: 3000 },
  { name: 'scene6_footer',       scroll: 99999, wait: 3000 },
];

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--window-size=1920,1080', '--no-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1920, height: 1080 },
  });

  const page = await browser.newPage();
  
  console.log('Loading page...');
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 });
  
  // The loading screen has class "fixed inset-0 z-[9999]" and fades opacity to 0
  // Wait for it by watching for the main content to appear
  console.log('Waiting for loading screen to finish...');
  
  // Wait up to 30 seconds for the loader to disappear
  let loaderGone = false;
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 500));
    const opacity = await page.evaluate(() => {
      const loaders = document.querySelectorAll('div[class*="fixed"]');
      for (const loader of loaders) {
        const cls = loader.className || '';
        if (cls.includes('inset-0') && cls.includes('z-')) {
          const style = window.getComputedStyle(loader);
          return parseFloat(style.opacity);
        }
      }
      return 0; // no loader found
    });
    console.log(`  Loader opacity: ${opacity}`);
    if (opacity <= 0.01) {
      loaderGone = true;
      break;
    }
  }
  
  if (!loaderGone) {
    console.log('  Loader still visible, forcing removal...');
    await page.evaluate(() => {
      document.querySelectorAll('div[class*="fixed"]').forEach(el => {
        if ((el.className || '').includes('inset-0')) {
          el.style.display = 'none';
        }
      });
    });
  }
  
  // Wait extra for animations to settle
  console.log('Waiting for animations to settle...');
  await new Promise(r => setTimeout(r, 5000));
  
  // Dismiss cookie banner
  console.log('Dismissing cookie banner...');
  await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const btn of btns) {
      if (btn.textContent.trim().toUpperCase() === 'ACCEPT') {
        btn.click();
        console.log('Clicked ACCEPT');
        break;
      }
    }
  });
  await new Promise(r => setTimeout(r, 1500));
  
  // Remove cookie banner and social dock
  await page.evaluate(() => {
    // Remove cookie banner entirely
    document.querySelectorAll('div').forEach(el => {
      const text = (el.textContent || '').toLowerCase();
      if (text.includes('third-party cookies') && text.includes('personalize')) {
        el.remove();
      }
    });
    
    // Hide social sidebar dock
    document.querySelectorAll('div, aside, nav').forEach(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      if (style.position === 'fixed' && rect.right >= window.innerWidth - 5 && rect.width < 80 && rect.height > 100) {
        el.style.display = 'none';
      }
    });
  });
  await new Promise(r => setTimeout(r, 500));
  
  // Test capture at current position first
  console.log('Test capture at current scroll...');
  const testPath = path.join(OUT_DIR, 'test.jpg');
  await page.screenshot({ path: testPath, type: 'jpeg', quality: 95 });
  const testSize = fs.statSync(testPath).size;
  console.log(`  Test capture: ${(testSize / 1024).toFixed(1)} KB`);
  
  if (testSize < 30000) {
    console.log('  WARNING: Test capture seems blank. Loading screen may still be active.');
    // Force hide all fixed overlays
    await page.evaluate(() => {
      document.querySelectorAll('*').forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.position === 'fixed' && style.zIndex > 999) {
          el.style.display = 'none';
        }
      });
    });
    await new Promise(r => setTimeout(r, 2000));
  }
  
  // Capture each scene
  for (const scene of scenes) {
    console.log(`\nCapturing ${scene.name} at scroll=${scene.scroll}...`);
    
    if (scene.scroll === 99999) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    } else {
      await page.evaluate((y) => window.scrollTo(0, y), scene.scroll);
    }
    
    // Wait for scroll to settle and new content to render
    await new Promise(r => setTimeout(r, scene.wait));
    
    // Force any in-view scramble text to settle
    await page.evaluate(() => {
      // Wait a beat for intersection observers to fire
    });
    await new Promise(r => setTimeout(r, 1000));
    
    const outPath = path.join(OUT_DIR, `${scene.name}.jpg`);
    await page.screenshot({ path: outPath, type: 'jpeg', quality: 95 });
    
    const stats = fs.statSync(outPath);
    console.log(`  -> ${scene.name}.jpg (${(stats.size / 1024).toFixed(1)} KB)`);
    
    if (stats.size < 30000) {
      console.log(`  WARNING: ${scene.name} seems too small!`);
    }
  }
  
  await browser.close();
  console.log('\nAll scenes captured!');
})();
