const fs = require('fs')
const { promisify } = require('util')

// fs.readFile('./p5js/example.js', 'utf-8', (err_read, base_script) => {
//   if (err_read) {
//     throw err_read
//   }
//
//   // スクリプトの編集
//   let modified_script = base_script
//   for(let i=0;i<9;i++){
//     modified_script=modified_script.replace(`\$${i+1}`, i+3)
//   }
//
//   fs.writeFile('./p5js/script.js',modified_script, (err_write) => {
//     if (err_write) {
//       throw err_write
//     }
//   })
// })

exports.modify = async (script, arg) => {
  // fs.readFile('./p5js/example.js', 'utf-8', (err_read, base_script) => {
  //   if (err_read) {
  //     throw err_read
  //   }

  // スクリプトの編集
  // let modified_script = base_script
  let modified_script = script
  for(let i=0;i<9;i++){
    modified_script=modified_script.replace(`\$${i+1}`, arg[i])
  }
  const writeResult = await promisify(fs.writeFile)('./p5js/script.js', modified_script)
    // fs.writeFile('./p5js/script.js',modified_script, (err_write) => {
    //   if (err_write) {
    //     throw err_write
    //   }
    // })
  // })
}
