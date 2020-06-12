const puppeteer = require('puppeteer');
const dotenv = require('dotenv')
const { promisify } = require('util')
const { exec } = require('child_process')

dotenv.config()

exports.p5saveMovie = async() => {
  const P5_URL = 'http://localhost:3000/p5js/movie.html'
  const RESULT_IMAGE_PATH = './p5js/result.png'
  const browser = await puppeteer.launch({
    executablePath: `${process.env.CHROMIUM_PATH}`,
    headless: true,
  });
  const page = await browser.newPage()
  const downloadPath = './p5js/movie/'
  await page._client.send(
    'Page.setDownloadBehavior',
    { behavior: 'allow', downloadPath: downloadPath }
  );
  await page.goto(P5_URL)
  console.log('capture start')
  await page.waitFor(1000*30) // 30秒ぐらい待つ
  console.log('capture finish')
  await browser.close()

  // gif化する
  console.log('start convert gif')
  let time = await promisify(exec)('time convert -delay 6 -loop 0 ./p5js/movie/frame_*.png ./p5js/movie/dst.gif').catch((err) => {
    console.log(err)
  })
  console.log('finish convert gif')
  console.log(time)
  console.log('remove buffer file')
  let removeRes = await promisify(exec)('rm ./p5js/movie/*.png')
  console.log('finish remove buffer file')
}
