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

const main = async () => {

  // ユーザーデータ (主に検索用のスクリーンネーム) を取得する
  const user_data = await client.get('account/verify_credentials', {})
  // console.log(user_data)

  // 自身に対するリプライを取得する
  const tweets = await client.get('search/tweets', {
    'q': `to:${user_data.screen_name}`,
  })

  // リプライ履歴の確認
  const filePath = './tweet_data/tweet.csv'
  const writeFileResult = await promisify(fs.appendFile)(filePath,'')
  const readResult = await promisify(fs.readFile)(filePath, 'utf-8')
  const memoryTweetIds = readResult.split(',')

  // 各ツイートへのリプライ, 保存
  const action = async (tweet) => {
    if(memoryTweetIds.findIndex(id => id === tweet.id_str) === -1) {
      const out = await promisify(fs.appendFile)(filePath, `${tweet.id_str},`)

      // ここに初めて観測したリプライに対して行う処理を書く
      // リプライ先が #p5js を含むツイートか調べる
      const mentionedTweet = await client.get('statuses/show', {
        'id': tweet.in_reply_to_status_id_str,
        'tweet_mode': 'extended',
        'trim_user': true,
        'include_entities': false,
      })

      if(mentionedTweet.full_text.indexOf('#p5js') !== -1){
        // 一部記号をアンエスケープする
        const fullText = mentionedTweet.full_text
          .replace(/(&lt;)/g, '<')
          .replace(/(&gt;)/g, '>')
          .replace(/(&quot;)/g, '"')
          .replace(/(&#39;)/g, "'")
          .replace(/(&amp;)/g, '&');

        // スクリプトの書き換えを行う
        const modified = await modify(fullText, tweet.text.split(' '))

        // 画像の作成を行う
        const res = await p5save()

        // ツイート用画像のアップロードを行う
        const image = await promisify(fs.readFile)('./p5js/result.png')
        const uploadRes = await client.post('media/upload', {
          'media': image
        })

        await client.post('statuses/update', {
          'status': '',
          'in_reply_to_status_id': tweet.id_str,
          'media_ids': uploadRes.media_id_string,
        })

        // 画像を使ってリプライを送る

      }
      // await client.post('statuses/update', {
      //   'status': 'test tweet',
      //   'in_reply_to_status_id': tweet.id_str,
      // })
    }
  }

  // 検索した全ツイートへのリプライ
  // TODO: リプライ済みのツイートか調べる処理が必要
  for(tweet of tweets.statuses){
    await action(tweet)
  }
  // const allReply= async () => {
  //   await Promise.all(tweets.statuses.map(async tweet => await action(tweet)))
  // }
  // allReply()
}

main()
