//モジュールの読み込み
const twitter = require('twitter')
const fs = require('fs')
const dotenv = require('dotenv')
const { promisify } = require('util')
const { modify } = require('./p5js/modify')
const { p5save } = require('./p5js/p5save')
const { p5saveMovie } = require('./p5js/p5save-movie')

dotenv.config()

let userData

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

  let tweetFrag
  if(mentionedTweet.full_text.indexOf('#p5js mov') !== -1) {
    tweetFrag = 'mov'
  } else if(mentionedTweet.full_text.indexOf('#p5js') !== -1) {
    tweetFrag = 'img'
  } else {
    return
  }

  // 一部記号をアンエスケープする
  const fullText = mentionedTweet.full_text
    .replace(/(&lt;)/g, '<')
    .replace(/(&gt;)/g, '>')
    .replace(/(&quot;)/g, '"')
    .replace(/(&#39;)/g, "'")
    .replace(/(&amp;)/g, '&');

  // @メンションを消す
  console.log(tweet.text)
  const args = tweet.text.split(`@${userData.screen_name} `).join('').split(' ')

  // スクリプトの書き換えを行う
  const modified = await modify(fullText, args)

  // 実行結果の作成を行う
  let media
  let RESULT_PATH
  let uploadRes
  let mediaID
  switch (tweetFrag) {
    case 'img':
      console.log('img')
      await p5save()

      RESULT_PATH = './p5js/result.png'
      media = await promisify(fs.readFile)(RESULT_PATH)
      uploadRes = await client.post('media/upload', {
        'media': media
      })
      mediaID = uploadRes.media_id_string
      break
    case 'mov':
      console.log('movie')
      await p5saveMovie()

      RESULT_PATH = './p5js/movie/dst.mp4'
      const mediaData = await promisify(fs.readFile)(RESULT_PATH)
      const mediaSize = (await promisify(fs.stat)(RESULT_PATH)).size
      console.log('movie uploading')

      // INIT Phase
      const uploadRes = await client.post('media/upload', {
        'command': 'INIT',
        'total_bytes': mediaSize,
        'media_type': 'video/mp4',
        'media_category': 'tweet_video',
      }).catch((error) => {
        console.log('INIT failed')
        console.log(error)
      })
      mediaID = uploadRes.media_id_string

      const chunkSize = 500000
      const chunkNum = Math.ceil(mediaSize / chunkSize)
      for(let index=0; index < chunkNum; index++){
        await client.post('media/upload', {
          'command': 'APPEND',
          'media_id': mediaID,
          'media': mediaData.slice(chunkSize * index, chunkSize * (index + 1)),
          'segment_index': index,
        }).catch((error) => {
          console.log(`fail APPEND index:${index}`)
        })
      }

      await client.post('media/upload', {
        'command': 'FINALIZE',
        'media_id': mediaID,
      }).catch((error) => {
        console.log('fail FINALIZE')
      })

      while (true) {
        const status = await client.get('media/upload', {
          'command': 'STATUS',
          'media_id': mediaID,
        }).catch((error) => {
          console.log('fail STATUS')
        })

        if(status.processing_info.state === 'succeeded'){
          break
        } else if (status.processing_info.statu === 'failed') {
          throw new Error(status.processing_info.error.message)
        } else {
          await sleep((status.processing_info.check_after_secs + 1)*1000)
        }
      }

      console.log('finish upload')
  }

  // 画像を使ってリプライを送る
  await client.post('statuses/update', {
    'status': `@${tweet.user.screen_name}`,
    'in_reply_to_status_id': tweet.id_str,
    'media_ids': mediaID,
  }).catch((error) => {
    console.log(error)
    client.post('statuses/update', {
      'status': `@${tweet.user.screen_name} エラーが発生したので画像を作成できませんでした`,
      'in_reply_to_status_id': tweet.id_str,
    })
  })
}

const getUserData = async () => {
  // ユーザーデータ (主に検索用のスクリーンネーム) を取得する
  return await client.get('account/verify_credentials', {})
}

const main = async () => {
  // 自身に対するリプライを取得する
  const tweets = await client.get('search/tweets', {
    'q': `to:${userData.screen_name}`,
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
    const out = await promisify(fs.appendFile)(HISTORY_PATH, `${tweet.id_str},`)
    await action(tweet)
  }
}

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

(async () => {
  userData = await getUserData()

  while(true){
    await main()
    await sleep(1000*60)
  }
})()
