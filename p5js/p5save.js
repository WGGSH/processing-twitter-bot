const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/p5js/');
  await page.screenshot({ path: './p5js/result.png' });

  await browser.close();
})();

