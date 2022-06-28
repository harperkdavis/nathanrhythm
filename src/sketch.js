let gameStarted = false;

let render;

const MINIGAMES = [MINIGAME_BOTTLE_DROP];

let activeMinigame = MINIGAMES[0];

let audio = {}

function preload() {
  soundFormats('mp3', 'wav', 'ogg');
  audio = {
    input_miss: loadSound('./audio/miss.mp3'),
    input_barely: loadSound('./audio/barely.mp3'),
    input_hit: loadSound('./audio/hit.mp3'),
    input_super_hit: loadSound('./audio/super_hit.mp3'),
    songs: {
      test: loadSound('./audio/games/test/test.mp3'),
      bottle_drop: loadSound('./audio/games/bottle_drop/bottle_drop_cues.wav'),
    },
    sfx: {
      bottle_drop_hit: loadSound('./audio/games/bottle_drop/bottle_drop_hit.wav'),
      bottle_drop_super_hit: loadSound('./audio/games/bottle_drop/bottle_drop_super_hit.wav')
    }
  }
}

function setup() {
  getAudioContext().suspend();
  createCanvas(1, 1);
  windowResized();

  for (let minigame of MINIGAMES) {
    minigame.scoreDisplay = createGraphics(50, 500);
    minigame.scoreDisplay.background(0);
  }

  render = createGraphics(800, 600);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
  if (key == 'r') {
    activeMinigame.reset();
    activeMinigame.start();
  }

  if (key == 'z') {
    activeMinigame.input();
  }
}

function mousePressed() {
  if (!gameStarted) {
    userStartAudio();
    gameStarted = true;
  }
}

function update() {
  activeMinigame.update();
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

  update();
  background(250);

  activeMinigame.draw(render);
  
  image(render, width / 2 - 400, height / 2 - 300);
  noFill();
  stroke(0);
  rect(width / 2 - 400, height / 2 - 300, 800, 600);

  

}