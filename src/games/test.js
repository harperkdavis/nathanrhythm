const MINIGAME_TEST = new Minigame("Test", 120, 
{song: 'test', length: 35, beats: genBeats(1, 34)},
() => { // Setup

},
() => { // Update

},
(draw) => { // Draw

    const self = MINIGAME_TEST;

    draw.background(250);

    draw.stroke(0);

    draw.fill(255, 0, 0);
    draw.rect(100, 100, 600, 50);

    draw.fill(255, 255, 0);
    draw.rect(400 - 300 * BARELY_RANGE, 100, 600 * BARELY_RANGE, 50);

    draw.fill(0, 255, 0);
    draw.rect(400 - 300 * PERFECT_RANGE, 100, 600 * PERFECT_RANGE, 50);

    draw.fill(0, 0, 255);
    draw.rect(400 - 300 * SUPER_PERFECT_RANGE, 100, 600 * SUPER_PERFECT_RANGE, 50);

    if (self.beatOffset() != undefined) {
        draw.fill(250);
        draw.rect(395 - 300 * self.beatOffset(), 90, 10, 70);
    }

    if (self.lastInputDelay != undefined) {
        draw.noFill();
        draw.stroke(0);
        draw.rect(395 - 300 * self.lastInputDelay, 90, 10, 70);
    }

    draw.fill(0);
    draw.noStroke();
    draw.textSize(32);
    draw.text("current beat: " + self.beats[self.currentBeat()], 40, 40);
    draw.text("beat: " + self.beat(), 40, 80);
    draw.text("score: " + self.score(), 40, 200);
}
);

function genBeats(difference, count) {
    let b = [];
    for (let i = 1; i < count; i++) {
        b.push(i * difference);
    }
    return b;
}