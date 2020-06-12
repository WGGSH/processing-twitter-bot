const puppeteer = require('puppeteer');
const dotenv = require('dotenv')

dotenv.config()

exports.p5save = async() => {
  const P5_URL = 'http://localhost:3000/p5js/'
  const RESULT_IMAGE_PATH = './p5js/result.png'
  const browser = await puppeteer.launch({
    executablePath: `${process.env.CHROMIUM_PATH}`,
    headless: true,
  });
  const page = await browser.newPage()
  await page.goto(P5_URL)
  await page.screenshot({ path: RESULT_IMAGE_PATH, clip: {x: 0, y: 0, width: 600, height: 600} })
  await browser.close()
  console.log('close')
}
