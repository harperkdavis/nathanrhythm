class Minigame {
    
    constructor(bpm) {
        this.bpm = bpm;
        this.mspb = 60000 / this.bpm;
        this.running = false;
        this.startTime = 0;
    }

    reset() {
        this.startTime = 0;
        this.running = false;
    }

    start() {
        this.startTime = Date.now();
        this.running = true;
    }

    beat() {
        
    }

    activeBeat() {

    }

}