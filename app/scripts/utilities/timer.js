class Timer {
    constructor(callback, delay) {
        this.callback = callback;
        this.remaining = delay;;
        this.resume();
    }

    pause(SystemPause) {
        window.clearTimeout(this.timerId);
        this.remaining -= new Date() - this.start;
        this.oldTimerId = this.timerId;

        if (SystemPause) {
            this.pauseBySystem = true;
        }
    }

    resume(systemResume) {
        if (systemResume || this.pauseBySystem) {
            this.pauseBySystem = false;

            this.start = new Date();
            this.timerId = window.setTimeout(() => {
                this.callback();
                window.dispatchEvent(new CustomEvent('removeTimer', {
                    detail: {
                        timer: this,
                    },
                }));
            }, this.remaining);

            if (!this.oldTimerId) {
                window.dispatchEvent(new CustomEvent('addTimer', {
                    detail: {
                        timer: this,
                    },
                }));
            }
        }
    }
}
module.exports = Timer;