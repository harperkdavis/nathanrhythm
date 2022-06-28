const MINIGAME_BOTTLE_DROP = new Minigame("Bottle Drop", 90, 
{song: 'bottle_drop', hit: 'bottle_drop_hit', super_hit: 'bottle_drop_super_hit', 
length: 106, 
devhighscore: 986867,
beats: [20, 30, 35, 38, 45, 46, 47, 53, 55, 58, 59.5, 61, 63, 66, 67, 69, 74, 76, 78, 80, 84, 85.5, 87, 93, 94, 95, 96, 100, 104]
},
() => { // Setup
    const self = MINIGAME_BOTTLE_DROP;

    self.upDownAnim = 0;
    self.inOutAnim = 0;

    self.ballHeight = 0;

    self.ballInHands = true;
    self.fallingBalls = {};

    self.expression = 0;
},
() => { // Update
    const self = MINIGAME_BOTTLE_DROP;

    let upDownTarget = 0;
    let inOutTarget = 0;
    for (let beat of self.data.beats) {
        if (self.beat() > beat - 1 && self.beat() < beat + 1) {
            upDownTarget = 1;
        }
        if (self.beat() > beat - 1 && self.beat() <= beat) {
            let x = self.beat() - (beat - 1);
            if (self.fallingBalls[beat] == undefined) {
                self.fallingBalls[beat] = {
                    killBeat: 9999999,
                    caught: false,
                    y: 0,
                    x: 0,
                    yv: 0,
                    xv: 0,
                };
            }
        }
        if (self.beat() > beat - 1 && self.beat() < beat - 0.75) {
            if (self.ballInHands) {
                self.fallingBall = true;
                self.ballInHands = false;
            }
        }
        if (self.beat() > beat + 0.25 && self.beat() < beat + 0.5) {
            inOutTarget = 1;
            if (self.beat() > beat + 0.4) {
                self.ballInHands = true;
            }
        }
        
    }

    self.expression = 0;

    let ballsToRemove = [];
    for (let b of Object.keys(self.fallingBalls)) {
        let ball = self.fallingBalls[b];
        let beat = parseFloat(b);
        if (beat == self.lastInputBeat) {
            ball.caught = true;   
            ball.delay = self.lastInputDelay;
            ball.caughtBeat = self.lastInputBeatDelay;
            if (abs(ball.delay) > BARELY_RANGE) {
                if (ball.xv == 0) {
                    ball.yv = random(-0.01, -0.02);
                    ball.xv = random(-10, 10);
                }
            }
            
        }
        if (!ball.caught) {
            ball.y = pow(self.beat() - (beat - 1), 2);
            if (self.beat() > beat + BEAT_RANGE_MS * self.bpms) {
                self.expression = 4;
            }
        } else {
            if (abs(ball.delay) > BARELY_RANGE) {
                ball.yv += 0.002;
                ball.y += ball.yv;
                ball.x += ball.xv;
                self.expression = 4;
            } else {
                if (abs(ball.delay) > PERFECT_RANGE) {
                    self.expression = 3;
                } else if (abs(ball.delay) > SUPER_PERFECT_RANGE) {
                    self.expression = 2;
                } else {
                    self.expression = 1;
                }
                console.log(self.expression);
                if (self.beat() < beat + 0.5) {
                    ball.y = 1;
                } else {
                    ball.y = 1 + pow(self.beat() - (beat + 0.5), 2);
                }
            }
            
        }

        if (self.beat() > beat + 2) {
            ballsToRemove.push(b);
        }
        
    }

    for (let rem of ballsToRemove) {
        delete self.fallingBalls[rem];
    }

    self.upDownAnim = lerp(self.upDownAnim, upDownTarget, 0.5);
    self.inOutAnim = lerp(self.inOutAnim, inOutTarget, 0.5);
},
(draw) => { // Draw

    const self = MINIGAME_BOTTLE_DROP;

    draw.background(250);

    draw.stroke(0);
    let redDown = self.upDownAnim * 300;
    
    // Hands
    draw.strokeWeight(2);

    // Blue back
    draw.fill(170, 170, 200);
    draw.rect(380 + self.inOutAnim * 250, 120 + self.beatLerp * 5, 50, 50);

    // Red back
    draw.fill(210, 180, 180);
    draw.rect(280 + self.inputLerp * 15 + self.upDownAnim * 100, 60 + self.beatLerp * 5 + self.inputLerp * 15 + redDown, 50, 50);

    // Ball in hands
    draw.fill(230, 230, 100);
    if (self.ballInHands) {
        draw.ellipse(420 + self.inOutAnim * 250, 160 + self.beatLerp * 5, 60, 60);
    }

    for (let b of Object.keys(self.fallingBalls)) {
        let ball = self.fallingBalls[b];
        draw.ellipse(420 + ball.x, 165 + 235 * ball.y, 60, 60);
    }
    

    // Blue front
    draw.fill(200, 200, 230);
    draw.rect(420 + self.inOutAnim * 250, 160 + self.beatLerp * 5, 50, 50);

    // Red front
    draw.fill(230, 200, 200);
    draw.rect(320 - self.inputLerp * 15 + self.upDownAnim * 100, 100 + self.beatLerp * 5 - self.inputLerp * 15 + redDown, 50, 50);

    // Blue guy

    draw.strokeWeight(2);

    draw.fill(200, 200, 230);
    draw.rect(600, 100 + self.beatLerp * 5, 200, 100);
    draw.rect(550, 50 + self.beatLerp * 10, 100, 100);

    
    
    // Blue face
    draw.fill(0);
    draw.ellipse(530 + 40, 50 + 40 + self.beatLerp * 12, 10, 10);
    draw.ellipse(530 + 80, 50 + 40 + self.beatLerp * 12, 10, 10);

    draw.noFill();
    draw.strokeWeight(3);
    draw.arc(530 + 60, 50 + 40 + self.beatLerp * 12, 50, 50, QUARTER_PI, HALF_PI + QUARTER_PI);
    
    draw.line(530 + 30, 50 + 20 + self.beatLerp * 12, 530 + 50, 50 + 30 + self.beatLerp * 12);
    draw.line(530 + 90, 50 + 20 + self.beatLerp * 12, 530 + 70, 50 + 30 + self.beatLerp * 12);
    
    // Red guy

    draw.strokeWeight(2);

    draw.fill(230, 200, 200);
    draw.rect(0, 100 + self.beatLerp * 5 + redDown, 200, 100);
    draw.rect(150, 50 + self.beatLerp * 10 + redDown, 100, 100);  

    draw.fill(0);
    draw.ellipse(150 + 40, 50 + 40 + self.beatLerp * 12 + redDown, 10, 10);
    draw.ellipse(150 + 80, 50 + 40 + self.beatLerp * 12 + redDown, 10, 10);

    draw.noFill();
    draw.strokeWeight(3);
    if (self.expression == 0 || self.expression == 2) { // normal
        draw.arc(150 + 60, 50 + 40 + self.beatLerp * 12 + redDown, 50, 50, QUARTER_PI, HALF_PI + QUARTER_PI);
        draw.line(150 + 30, 50 + 20 + self.beatLerp * 12 + redDown, 150 + 50, 50 + 30 + self.beatLerp * 12 + redDown);
        draw.line(150 + 90, 50 + 20 + self.beatLerp * 12 + redDown, 150 + 70, 50 + 30 + self.beatLerp * 12 + redDown);
    } else if (self.expression == 4) { // frown
        draw.line(150 + 50, 50 + 20 + self.beatLerp * 12 + redDown, 150 + 30, 50 + 30 + self.beatLerp * 12 + redDown);
        draw.line(150 + 70, 50 + 20 + self.beatLerp * 12 + redDown, 150 + 90, 50 + 30 + self.beatLerp * 12 + redDown);
        draw.arc(150 + 60, 100 + 40 + self.beatLerp * 12 + redDown, 50, 50, PI + QUARTER_PI, PI + HALF_PI + QUARTER_PI);
    } else if (self.expression == 3) { // meh
        draw.line(150 + 50, 50 + 20 + self.beatLerp * 12 + redDown, 150 + 30, 50 + 30 + self.beatLerp * 12 + redDown);
        draw.line(150 + 70, 50 + 20 + self.beatLerp * 12 + redDown, 150 + 90, 50 + 30 + self.beatLerp * 12 + redDown);
        draw.line(150 + 30, 50 + 60 + self.beatLerp * 12 + redDown, 150 + 60, 50 + 70 + self.beatLerp * 12 + redDown);
    } else { // really happy
        draw.fill(0);
        draw.arc(150 + 60, 50 + 60 + self.beatLerp * 12 + redDown, 50, 50, 0, PI, CHORD);
        draw.line(150 + 30, 50 + 10 + self.beatLerp * 12 + redDown, 150 + 50, 50 + 20 + self.beatLerp * 12 + redDown);
        draw.line(150 + 90, 50 + 10 + self.beatLerp * 12 + redDown, 150 + 70, 50 + 20 + self.beatLerp * 12 + redDown);
    }
    
    

    draw.strokeWeight(5);
    draw.textSize(32);
    draw.textAlign(CENTER, CENTER);
    draw.textStyle(BOLD);
    draw.fill(255);
    draw.text("YOU", 80, 50 + redDown + self.beatLerp * 2);

    // Overlayed hands

    

}
);