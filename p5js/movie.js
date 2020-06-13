// ref: http://zombiebook.seesaa.net/article/117986453.html
function onChangeValue(obj, nam, cbf, _tm){
  if(!_tm) _tm = 100;
  var f = function (o, n){
    var v = o[n]
    var t = setTimeout(
      function (){
        clearTimeout(t)
        if(v != o[n]){
          if(cbf(o, n)){
            f(o, n)
          }
        }else{
          f(o, n)
        }
      },
      _tm
    );
  }
  f(obj, nam)
}

let isFirst = true

function callBack(o, n){
  if(isFirst){
    frameRate(10)
    isFirst=false
  }

  if(o[n] > 100){
  }
  if(o[n] >= 1 && o[n] < 90){
    save(`frame_${String(o[n]).padStart(3,'0')}.png`)
  }
  return true
}

onChangeValue(window, 'frameCount', callBack)
