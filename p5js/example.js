VAL1=$1
VAL2=$2

function setup(){
  createCanvas(w=600,w)
  w/=2
  noLoop()
}

function draw(){
  background(0)

  translate(w,w)

  beginShape()
  noFill()
  stroke(255)
  for(i=0;i<360;i++){
    vertex(w*cos(TAU/360*i*VAL1),w*sin(TAU/360*i*VAL2))
  }
  endShape(CLOSE)
}
