class GameEngine {
    constructor(maxFps, entityList) {
        this.fpsDisplay = document.getElementById('fps-display');
        this.elapsedMs = 0;
        this.lastFrameTimeMs = 0;
        this.entityList = entityList;
        this.maxFps = maxFps;
        this.timestep = 1000 / this.maxFps;
        this.fps = this.maxFps;
        this.framesThisSecond = 0;
        this.lastFpsUpdate = 0;
        this.frameId = 0;
        this.running = false;
        this.started = false;
    }

    changePauseState(running) {
        if (running) {
            this.stop();
        } else {
            this.started();
        }
    }

    updateFpsDisplay(timestamp) {
        if (timestamp > this.lastFpsUpdate + 1000) {
            this.fps = (this.framesThisSecond + this.fps) / 2;
            this.lastFpsUpdate = timestamp;
            this.framesThisSecond = 0;
        }
        this.framesThisSecond += 1;
        this.fpsDisplay.textContent = '${Math.round(this.fps)} FPS';
    }

    draw(interp, entityList) {
        entityList.forEach((entity) => {
            if (typeof entity.update === 'function') {
                entity.update(this.elapsedMs);
            }
        });
    }

    update(elapsedMs, entityList) {
        entityList.forEach((entity) => {
            if (typeof entity.update === 'function') {
                entity.update(elapsedMs);
            }
        });
    }

    panic() {
        this.elapsedMs = 0;
    }

    start() {
        if (!this.started) {
            this.started = true;

            this.frameId = requestAnimationFrame((firstTimestamp) => {
                this.draw(1, []);
                this.running = true;
                this.lastFrameTimeMs = firstTimestamp;
                this.lastFpsUpdate = firstTimestamp;
                this.framesThisSecond = 0;

                this.frameId = requestAnimationFrame((timestep) => {
                    this.mainLoop(timestamp);
                });
            });
        }
    }

    stop() {
        this.running = false;
        this.started = false;
        cancelAnimationFrame(this.frameId);
    }

    processFrames() {
        let numUpdatesSteps = 0;
        while (this.elapsedMs >= this.timestep) {
            this.update(this.timestep, this.entityList);
            this.elapsedMs -= this.timestep;
            numUpdatesSteps += 1;
            if (numUpdatesSteps >= this.maxFps) {
                this.panic();
                break;
            }
        }
    }

    engineCycle(timestamp) {
        if (timestamp < this.lastFrameTimeMs + (1000 / this.maxFps)) {
            this.frameId = requestAnimationFrame((nextTimestamp) => {
                this.mainLoop(nextTimestamp);
            });
            return;
        }

        this.elapsedMs += timestamp - this.lastFrameTimeMs;
        this.lastFrameTimeMs = timestamp;
        this.updateFpsDisplay(timestamp);
        this.processFrames();
        this.draw(this.elapsedMs / this.timestep, this.entityList);

        this.frameId = requestAnimationFrame((nextTimestamp) => {
            this.mainLoop(nextTimestamp);
        });
    }

    mainLoop(timestamp) {
        this.engineCycle(timestamp);
    }
}

module.exports = GameEngine;