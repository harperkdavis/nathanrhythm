let gameStarted = false;

function setup() {
  getAudioContext().suspend();
  createCanvas(1, 1);
  windowResized();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
  
}

function mousePressed() {
  if (!gameStarted) {
    userStartAudio();
    gameStarted = true;
    
  }
}

function update() {

}

function draw() {
  if (!gameStarted) {
    background(0);
    textAlign(CENTER, CENTER);
    textSize(16);
    fill(255);
    text("Click to play", width / 2, height / 2);
    return;
  }
  background(250);
}