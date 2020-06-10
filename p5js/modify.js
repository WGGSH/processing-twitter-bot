const fs = require('fs')
const { promisify } = require('util')

// スクリプトの編集
exports.modify = async (script, arg) => {
  const RESULT_SCRIPT_PATH='./p5js/script.js'
  let modified_script = script
  arg.forEach((val, index) => {
    modified_script=modified_script.replace(`$${index+1}`, val)
  })
  return await promisify(fs.writeFile)(RESULT_SCRIPT_PATH, modified_script)
}
