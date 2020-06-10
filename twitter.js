//モジュールの読み込み
const twitter = require('twitter')
const fs = require('fs')
const dotenv = require('dotenv')
const { promisify } = require('util')
const { modify } = require('./p5js/modify')
const { p5save } = require('./p5js/p5save')

dotenv.config()

const client = new twitter({
    consumer_key        : `${process.env.CONSUMER_KEY}`,
    consumer_secret     : `${process.env.CONSUMER_SECRET}`,
    access_token_key    : `${process.env.ACCESS_TOKEN}`,
    access_token_secret : `${process.env.ACCESS_TOKEN_SECRET}`,
});

// 各ツイートへのリプライ, 保存
const action = async (tweet) => {
  // リプライ先が #p5js を含むツイートか調べる
  const mentionedTweet = await client.get('statuses/show', {
    'id': tweet.in_reply_to_status_id_str,
    'tweet_mode': 'extended',
    'trim_user': true,
    'include_entities': false,
  })

  if(mentionedTweet.full_text.indexOf('#p5js') === -1) return

  // 一部記号をアンエスケープする
  const fullText = mentionedTweet.full_text
    .replace(/(&lt;)/g, '<')
    .replace(/(&gt;)/g, '>')
    .replace(/(&quot;)/g, '"')
    .replace(/(&#39;)/g, "'")
    .replace(/(&amp;)/g, '&');

  // @メンションを消す
  console.log(tweet.text)
  const args = tweet.text.split(`@${user_data.screen_name} `).join('').split(' ')

  // スクリプトの書き換えを行う
  const modified = await modify(fullText, args)

  // 画像の作成を行う
  const res = await p5save()

  const RESULT_PATH = './p5js/result.png'
  // ツイート用画像のアップロードを行う
  const image = await promisify(fs.readFile)(RESULT_PATH)
  const uploadRes = await client.post('media/upload', {
    'media': image
  })

  // 画像を使ってリプライを送る
  await client.post('statuses/update', {
    'status': `@${tweet.user.screen_name}`,
    'in_reply_to_status_id': tweet.id_str,
    'media_ids': uploadRes.media_id_string,
  })

}

let user_data

const main = async () => {

  // ユーザーデータ (主に検索用のスクリーンネーム) を取得する
  user_data = await client.get('account/verify_credentials', {})

  // 自身に対するリプライを取得する
  const tweets = await client.get('search/tweets', {
    'q': `to:${user_data.screen_name}`,
  })

  // リプライ履歴の確認
  const HISTORY_PATH = './tweet_data/tweet.csv'
  const writeFileResult = await promisify(fs.appendFile)(HISTORY_PATH,'')
  const readResult = await promisify(fs.readFile)(HISTORY_PATH, 'utf-8')
  const memoryTweetIds = readResult.split(',')

  // 検索した全ツイートへのリプライ
  // TODO: リプライ済みのツイートか調べる処理が必要
  for(tweet of tweets.statuses){
    if(memoryTweetIds.findIndex(id => id === tweet.id_str) !== -1) continue
    const out = await promisify(fs.appendFile)(filePath, `${tweet.id_str},`)
    await action(tweet)
  }
}

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

(async () => {
  while(true){
    main()
    await sleep(1000*60)
  }
})()
