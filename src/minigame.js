const BEAT_RANGE_MS = 200;
const BARELY_RANGE = 0.35;
const PERFECT_RANGE = 0.25;
const SUPER_PERFECT_RANGE = 0.05;

const MAX_SCORE = 1000000;
const PERFECT_SCORE = 900000;
const BARELY_SCORE = 600000;

const F_RANK_MINIMUM = 0;
const D_RANK_MINIMUM = 500000;
const C_RANK_MINIMUM = 600000;
const B_RANK_MINIMUM = 700000;
const A_RANK_MINIMUM = 800000;
const S_RANK_MINIMUM = 900000;
const P_RANK_MINIMUM = 1000000;

class Minigame {
    
    constructor(name, bpm, data, setupGame, updateGame, drawGame) {
        this.name = name;

        this.bpm = bpm;
        this.bpms = this.bpm / 60000;
        this.mspb = 1 / this.bpms;

        this.running = false;
        this.startTime = 0;

        this.data = data;

        for (let i = 0; i < this.data.beats.length; i++) {
            this.data.beats[i] -= 4; // Ableton starts at 1
        }

        this.setupGame = setupGame;
        this.updateGame = updateGame;
        this.drawGame = drawGame;

        this.scores = [];
        this.misses = 0;

        this.scoreSum = 0;
        this.onEndScreen = false;

        this.beatLerp = 0;
        this.inputLerp = 0;
        this.lastBeat = -1;

        this.scoreOsc = new p5.Oscillator('sawtooth');
        
    }

    reset() {
        this.startTime = 0;
        this.running = false;

        this.beats = [...this.data.beats];

        this.lastInputDelay = 0;
        
        this.scores = [];
        this.misses = 0;

        this.scoreSum = 0;
        this.onEndScreen = false;

        this.beatLerp = 0;
        this.inputLerp = 0;
        this.lastBeat = -1;

        audio.songs[this.data.song].stop();
        this.scoreOsc.stop();

        this.scoreDisplay.background(0);
    }

    start() {
        this.startTime = Date.now();
        this.endTime = this.startTime + (this.data.length + 2) * this.mspb;
        this.running = true;

        audio.songs[this.data.song].play();

        this.setupGame();
    }

    currentTime() {
        return Date.now() - this.startTime;
    }

    beat() {
        return this.currentTime() / this.mspb;
    }

    beatOffset() {
        const current = this.currentBeat();
        if (current != -1) {
            return ((this.beats[current] - this.beat()) * this.mspb) / BEAT_RANGE_MS;
        }
        return undefined;
    }

    currentBeat() {
        for (let i = 0; i < this.beats.length; i++) {
            if (abs((this.beats[i] - this.beat()) * this.mspb) <= BEAT_RANGE_MS) {
                return i;
            }
        }
        return -1;
    }

    invlerp(a, b, c) {
        return (c - a) / (b - a);
    }

    score() {
        let avg = 0;
        for (let sc of this.scores) {
            avg += sc;
        }
        avg /= max(1, this.scores.length);
        avg *= pow(0.9, sqrt(this.misses));
        return Math.floor(avg);
    }
    
    getrank(score) {
        const an = score % (100000);
        const addition = an < 30000 ? "-" : (an < 70000 ? "" : "+"); 

        if (score >= P_RANK_MINIMUM) {
            return "P";
        } else if (score >= S_RANK_MINIMUM) {
            return "S" + addition;
        } else if (score >= A_RANK_MINIMUM) {
            return "A" + addition;
        } else if (score >= B_RANK_MINIMUM) {
            return "B" + addition;
        } else if (score >= C_RANK_MINIMUM) {
            return "C" + addition;
        } else if (score >= D_RANK_MINIMUM) {
            return "D" + addition;
        } else if (score >= F_RANK_MINIMUM) {
            return "F";
        }
        return "?";
    } 

    input() {
        if (this.running) {
            
            if (this.currentBeat() != -1) {
                let beat = this.beats[this.currentBeat()];

                this.lastInputBeat = beat;
                this.lastInputBeatDelay = this.beat();
                this.lastInputDelay = this.beatOffset();

                this.beats = this.beats.filter((b) => {
                    return beat < b;
                });
                const delay = abs(this.lastInputDelay);

                if (delay <= SUPER_PERFECT_RANGE) {
                    this.scores.push(MAX_SCORE);
                    (audio.sfx[this.data.super_hit] || audio.input_super_hit).play();
                } else if (delay <= PERFECT_RANGE) {
                    this.scores.push(map(delay, PERFECT_RANGE, SUPER_PERFECT_RANGE, PERFECT_SCORE, MAX_SCORE));
                    (audio.sfx[this.data.hit] || audio.hit).play();
                } else if (delay <= BARELY_RANGE) {
                    this.scores.push(map(delay, BARELY_RANGE, PERFECT_RANGE, BARELY_SCORE, PERFECT_SCORE));
                    this.misses += 1;
                    audio.input_barely.play();
                } else {
                    this.scores.push(map(delay, 1, BARELY_RANGE, 0, BARELY_SCORE));
                    this.misses += 1;
                    audio.input_miss.play();
                }
            } else {
                audio.input_miss.play();
            }

            this.inputLerp = 1;

            
        }
    }

    update() {

        if (this.running) {

            if (Math.floor(this.beat()) > this.lastBeat) {
                this.beatLerp = 1;
                this.lastBeat = Math.floor(this.beat());
            } 

            this.beatLerp = lerp(this.beatLerp, 0, 0.1);
            this.inputLerp = lerp(this.inputLerp, 0, 0.2);
            
            if (this.currentBeat() == -1) {
                let beat = this.beat();
                this.beats = this.beats.filter((b) => {
                    if (beat > b) {
                        this.scores.push(0);
                        this.misses += 1;
                        audio.input_miss.play();
                    }
                    return beat <= b;
                });
            }
            

            this.updateGame();
        }
    }

    draw(draw) {
        if (this.running) {
            if (this.beat() < this.data.length) {
                this.drawGame(draw);
            }
            
            if (this.beat() > this.data.length - 1) {
                if (this.beat() < this.data.length) {
                    draw.fill(0, map(this.beat(), this.data.length - 1, this.data.length, 0, 255));
                    draw.rect(0, 0, 800, 600);
                } else {
                    draw.background(0);

                    if (this.beat() > this.data.length + 2) {
                        if (!this.onEndScreen) {
                            this.scoreOsc.start();
                            this.scoreOsc.amp(0.0);
                            this.scoreOsc.amp(0.2, 0.5);
                            this.onEndScreen = true;
                        }

                        if (this.scoreSum < this.score() / MAX_SCORE) {
                            this.scoreSum += 0.004;
                            
                            this.scoreSum = min(this.scoreSum, this.score() / MAX_SCORE);
                            this.scoreOsc.freq(this.scoreSum * 900 + 100, 1 / 60);

                            this.scoreDisplay.stroke(255 * pow(1 - this.scoreSum, 2), 255 * pow(this.scoreSum, 2), 0);
                            this.scoreDisplay.line(0, 500 - this.scoreSum * 500, 50, 500 -this.scoreSum * 500);

                            if (this.scoreSum == this.score() / MAX_SCORE) {
                                setTimeout(() => {this.scoreOsc.amp(0.0, 0.5)}, 1000);
                                setTimeout(() => {this.scoreOsc.stop()}, 1500);
                            }
                        }

                        

                        draw.fill(255);
                        draw.textSize(100);
                        draw.textAlign(LEFT, TOP);
                        draw.textStyle(BOLD);
                        draw.text("Finish!", 40, 40);

                        draw.image(this.scoreDisplay, 700, 50);
                        draw.stroke(255);
                        draw.noFill();
                        draw.rect(700, 50, 50, 500);

                        draw.noStroke();
                        draw.fill(255);
                        draw.triangle(695, 550 - this.scoreSum * 500, 685, 545 - this.scoreSum * 500, 685, 555 - this.scoreSum * 500);

                        draw.textSize(32);
                        draw.textAlign(RIGHT, CENTER);
                        draw.text(floor(this.scoreSum * MAX_SCORE).toLocaleString("en-US"), 680, 550 - this.scoreSum * 500);

                        draw.textAlign(LEFT, BOTTOM);
                        draw.textStyle(NORMAL);
                        draw.text("Rank:", 50, 400);

                        draw.textStyle(BOLD);
                        draw.textSize(200);
                        draw.textAlign(LEFT, TOP);
                        draw.text(this.getrank(this.scoreSum * MAX_SCORE), 40, 400);
                    }
                    
                    
                }
            }
        } else {
            draw.background(0);
        }
    }

}