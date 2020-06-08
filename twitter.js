//モジュールの読み込み
const twitter = require('twitter');
const fs = require('fs')
const dotenv = require('dotenv')

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

  // 各ツイートへのリプライ
  const reply = async (tweet) => {
    await client.post('statuses/update', {
      'status': 'test_reply',
      'in_reply_to_status_id': tweet.id_str,
    })
  }

  // 検索した全ツイートへのリプライ
  // TODO: リプライ済みのツイートか調べる処理が必要
  const allReply= async () => {
    await Promise.all(tweets.statuses.map(async tweet => await reply(tweet)))
  }
  // allReply()
}

main()
