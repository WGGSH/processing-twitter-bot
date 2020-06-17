const puppeteer = require('puppeteer');
const dotenv = require('dotenv')
const { promisify } = require('util')
const { exec } = require('child_process')

dotenv.config()

exports.p5saveMovie = async() => {
  const P5_URL = 'http://localhost:3000/p5js/movie.html'
  const RESULT_IMAGE_PATH = './p5js/result.png'
  const MOVIE_DIR = './p5js/movie'
  const browser = await puppeteer.launch({
    executablePath: `${process.env.CHROMIUM_PATH}`,
    headless: true,
  });
  const page = await browser.newPage()
  await page._client.send(
    'Page.setDownloadBehavior',
    { behavior: 'allow', downloadPath: MOVIE_DIR}
  );
  await page.goto(P5_URL)
  console.log('capture start')
  await page.waitFor(1000*70) // キャプチャが終わるぐらいまで待つ
  console.log('capture finish')
  await browser.close()

  // 動画化する
  console.log('start convert')
  let time = await promisify(exec)(`ffmpeg -r 30 -i ${MOVIE_DIR}/frame_%03d.png -vcodec libx264 -pix_fmt yuv420p -r 60 ${MOVIE_DIR}/dst.mp4 -y`).catch((err) => {
    console.log(err)
  })
  console.log('finish convert')
  console.log(time)
  console.log('remove buffer file')
  let removeRes = await promisify(exec)(`rm ${MOVIE_DIR}/*.png`)
  console.log('finish remove buffer file')
}
