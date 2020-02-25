class GameCoordinator {
    constructor() {
        this.gameUi = document.getElementById("game-ui");
        this.rowTop = document.getElementById("row-top");
        this.mazeDiv = document.getElementById("maze");
        this.mazeImg = document.getElementById("maze-img");
        this.mazeCover = document.getElementById("maze-cover");
        this.pointsDisplay = document.getElementById("points-display");
        this.highScoreDisplay = document.getElementById("high-score-display");
        this.extraLivesDisplay = document.getElementById("extra-lives");
        this.fruitDisplay = document.getElementById("fruit-display");
        this.mainMenu = document.getElementById("main-menu-container");
        this.gameStartButton = document.getElementById("game-start");
        this.pauseButton = document.getElementById("paused-button");
        this.soundButton = document.getElementById("sound-button");
        this.leftCover = document.getElementById("left-cover");
        this.rightCover = document.getElementById("right-cover");
        this.pauseText = document.getElementById("paused-text");
        this.bottomRow = document.getElementById("bottom-row");
        this.movementButtons = document.getElementById("movement-buttons");

        this.maxFps = 120;
        this.tileSize = 8;
        this.scale = this.determineScale(1);
        this.scaledTileSize = this.tileSize * this.scale;
        this.firstGame = true;

        this.movementKeys = {
            //WASD
            87: 'up',
            83: 'down',
            65: 'left',
            68: 'right',

            //Sagetile
            38: 'up',
            40: 'down',
            37: 'left',
            39: 'right',
        };

        this.fruitPoints = {
            1: 100,
            2: 200,
            3: 500,
            4: 700,
            5: 1000,
            6: 2000,
            7: 3000,
            8: 5000,
        };

        this.mazeArray = [
            ['XXXXXXXXXXXXXXXXXXXXXXXXXXXX'],
            ['XooooooooooooXXooooooooooooX'],
            ['XoXXXXoXXXXXoXXoXXXXXoXXXXoX'],
            ['XOXXXXoXXXXXoXXoXXXXXoXXXXOX'],
            ['XoXXXXoXXXXXoXXoXXXXXoXXXXoX'],
            ['XooooooooooooooooooooooooooX'],
            ['XoXXXXoXXoXXXXXXXXoXXoXXXXoX'],
            ['XoXXXXoXXoXXXXXXXXoXXoXXXXoX'],
            ['XooooooXXooooXXooooXXooooooX'],
            ['XXXXXXoXXXXX XX XXXXXoXXXXXX'],
            ['XXXXXXoXXXXX XX XXXXXoXXXXXX'],
            ['XXXXXXoXX          XXoXXXXXX'],
            ['XXXXXXoXX XXXXXXXX XXoXXXXXX'],
            ['XXXXXXoXX X      X XXoXXXXXX'],
            ['      o   X      X   o      '],
            ['XXXXXXoXX X      X XXoXXXXXX'],
            ['XXXXXXoXX XXXXXXXX XXoXXXXXX'],
            ['XXXXXXoXX          XXoXXXXXX'],
            ['XXXXXXoXX XXXXXXXX XXoXXXXXX'],
            ['XXXXXXoXX XXXXXXXX XXoXXXXXX'],
            ['XooooooooooooXXooooooooooooX'],
            ['XoXXXXoXXXXXoXXoXXXXXoXXXXoX'],
            ['XoXXXXoXXXXXoXXoXXXXXoXXXXoX'],
            ['XOooXXooooooo  oooooooXXooOX'],
            ['XXXoXXoXXoXXXXXXXXoXXoXXoXXX'],
            ['XXXoXXoXXoXXXXXXXXoXXoXXoXXX'],
            ['XooooooXXooooXXooooXXooooooX'],
            ['XoXXXXXXXXXXoXXoXXXXXXXXXXoX'],
            ['XoXXXXXXXXXXoXXoXXXXXXXXXXoX'],
            ['XooooooooooooooooooooooooooX'],
            ['XXXXXXXXXXXXXXXXXXXXXXXXXXXX'],
        ];

        this.mazeArray.forEach((row, rowIndex) => {
            this.mazeArray[rowIndex] = row[0].split('');
        });

        this.gameStartButton.addEventListener(
            'click', this.startButtonClick.bind(this),
        );

        this.pauseButton.addEventListener(
            'click', this.handlePauseKey.bind(this),
        );

        this.soundButton.addEventListener(
            'click', this.soundButtonClick.bind(this),
        );

        const head = document.getElementsByTagName('head')[0];
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'build/app.css';

        link.onload = this.preloadAssets.bind(this);

        head.appendChild(link);
    }



    determineScale(scale) {
        const height = Math.min(
            document.documentElement.clientHeight, window.innerHeight || 0,
        );

        const width = Math.min(
            document.documentElement.clientWidth, window.innerWidth || 0,
        );

        const scaledTileSize = this.tileSize * scale;

        if ((scaledTileSize * 36) < height && (scaledTileSize * 28) < width) {
            return this.determineScale(scale + 1);
        }

        return scale - 1;
    }

    startButtonClick() {
        this.leftCover.style.left = '-50%';
        this.rightCover.style.right = '-50%';
        this.mainMenu.style.opacity = 0;
        this.gameStartButton.disabled = true;

        setTimeout(() => {
            this.mainMenu.style.visibility = 'hidden';
        }, 1000);

        this.reset();
        if (this.firstGame) {
            this.firstGame = false;
            this.init();
        }
        this.startGameplay(true);
    }

    soundButtonClick() {
        const newVolume = this.soundManager.masterVolume === 1 ? 0 : 1;
        this.soundManager.setMasterVolume(newVolume);
        localStorage.setItem('volumePreference', newVolume);
        this.setSoundButtonIcon(newVolume);
    }

    setSoundButtonIcon(newVolume) {
        this.soundButton.innerHTML = newVolume === 0 ?
            'volume_off' :
            'volume_on';
    }

    displayErrorMessage() {
        const loadingContainer = document.getElementById('loading-container');
        const errorMessage = document.getElementById('error-message');
        loadingContainer.style.opacity = 0;
        setTimeout(() => {
            loadingContainer.remove();
            errorMessage.style.opacity = 1;
            errorMessage.style.visibility = 'visible';
        }, 1500);
    }

    preloadAssets() {
        return new Promise((resolve) => {
            const loadingContainer = document.getElementById('loading-container');
            const loadingPacman = document.getElementById('loading-pacman');
            const loadingDotMask = document.getElementById('loading-dot-mask');

            const imgBase = 'app/style/graphics/spriteSheets/';
            const imgSources = [
                //Pacman
                `${imgBase}characters/pacman/arrow_down.svg`,
                `${imgBase}characters/pacman/arrow_left.svg`,
                `${imgBase}characters/pacman/arrow_right.svg`,
                `${imgBase}characters/pacman/arrow_up.svg`,
                `${imgBase}characters/pacman/pacman_death.svg`,
                `${imgBase}characters/pacman/pacman_error.svg`,
                `${imgBase}characters/pacman/pacman_down.svg`,
                `${imgBase}characters/pacman/pacman_left.svg`,
                `${imgBase}characters/pacman/pacman_right.svg`,
                `${imgBase}characters/pacman/pacman_up.svg`,

                // Blinky
                `${imgBase}characters/ghosts/blinky/blinky_down_angry.svg`,
                `${imgBase}characters/ghosts/blinky/blinky_down_annoyed.svg`,
                `${imgBase}characters/ghosts/blinky/blinky_down.svg`,
                `${imgBase}characters/ghosts/blinky/blinky_left_angry.svg`,
                `${imgBase}characters/ghosts/blinky/blinky_left_annoyed.svg`,
                `${imgBase}characters/ghosts/blinky/blinky_left.svg`,
                `${imgBase}characters/ghosts/blinky/blinky_right_angry.svg`,
                `${imgBase}characters/ghosts/blinky/blinky_right_annoyed.svg`,
                `${imgBase}characters/ghosts/blinky/blinky_right.svg`,
                `${imgBase}characters/ghosts/blinky/blinky_up_angry.svg`,
                `${imgBase}characters/ghosts/blinky/blinky_up_annoyed.svg`,
                `${imgBase}characters/ghosts/blinky/blinky_up.svg`,

                // Clyde
                `${imgBase}characters/ghosts/clyde/clyde_down.svg`,
                `${imgBase}characters/ghosts/clyde/clyde_left.svg`,
                `${imgBase}characters/ghosts/clyde/clyde_right.svg`,
                `${imgBase}characters/ghosts/clyde/clyde_up.svg`,

                // Inky
                `${imgBase}characters/ghosts/inky/inky_down.svg`,
                `${imgBase}characters/ghosts/inky/inky_left.svg`,
                `${imgBase}characters/ghosts/inky/inky_right.svg`,
                `${imgBase}characters/ghosts/inky/inky_up.svg`,

                // Pinky
                `${imgBase}characters/ghosts/pinky/pinky_down.svg`,
                `${imgBase}characters/ghosts/pinky/pinky_left.svg`,
                `${imgBase}characters/ghosts/pinky/pinky_right.svg`,
                `${imgBase}characters/ghosts/pinky/pinky_up.svg`,

                // Ghosts Common
                `${imgBase}characters/ghosts/eyes_down.svg`,
                `${imgBase}characters/ghosts/eyes_left.svg`,
                `${imgBase}characters/ghosts/eyes_right.svg`,
                `${imgBase}characters/ghosts/eyes_up.svg`,
                `${imgBase}characters/ghosts/scared_blue.svg`,
                `${imgBase}characters/ghosts/scared_white.svg`,

                // Dots
                `${imgBase}pickups/pacdot.svg`,
                `${imgBase}pickups/powerPellet.svg`,

                // Fruit
                `${imgBase}pickups/apple.svg`,
                `${imgBase}pickups/bell.svg`,
                `${imgBase}pickups/cherry.svg`,
                `${imgBase}pickups/galaxian.svg`,
                `${imgBase}pickups/key.svg`,
                `${imgBase}pickups/melon.svg`,
                `${imgBase}pickups/orange.svg`,
                `${imgBase}pickups/strawberry.svg`,

                // Text
                `${imgBase}text/ready.svg`,

                // Points
                `${imgBase}text/100.svg`,
                `${imgBase}text/200.svg`,
                `${imgBase}text/300.svg`,
                `${imgBase}text/400.svg`,
                `${imgBase}text/500.svg`,
                `${imgBase}text/700.svg`,
                `${imgBase}text/800.svg`,
                `${imgBase}text/1000.svg`,
                `${imgBase}text/1600.svg`,
                `${imgBase}text/2000.svg`,
                `${imgBase}text/3000.svg`,
                `${imgBase}text/5000.svg`,

                // Maze
                `${imgBase}maze/maze_blue.svg`,

                // Misc
                'app/style/graphics/extra_life.png',
            ];

            const audioBase = 'app/style/audio/';
            const audioSources = [
                `${audioBase}game_start.mp3`,
                `${audioBase}pause.mp3`,
                `${audioBase}pause_beat.mp3`,
                `${audioBase}siren_1.mp3`,
                `${audioBase}siren_2.mp3`,
                `${audioBase}siren_3.mp3`,
                `${audioBase}power_up.mp3`,
                `${audioBase}extra_life.mp3`,
                `${audioBase}eyes.mp3`,
                `${audioBase}eat_ghost.mp3`,
                `${audioBase}death.mp3`,
                `${audioBase}fruit.mp3`,
                `${audioBase}dot_1.mp3`,
                `${audioBase}dot_2.mp3`,
            ];

            const totalSources = imgSources.length + audioSources.length;
            this.remainingScources = totalSources;

            loadingPacman.style.left = '0';
            loadingDotMask.style.width = '0';

            Promise.all([
                this.createElements(
                    imgSources, 'img', totalSources, this,
                ),
                this.createElements(
                    audioSources, 'audio', totalSources, this,
                ),
            ]).then(() => {
                loadingContainer.style.opacity = 0;
                resolve();

                setTimeout(() => {
                    loadingContainer.remove();
                    this.mainMenu.style.opacity = 1;
                    this.mainMenu.style.visibility = 'visible';
                }, 1500);
            }).catch(this.displayErrorMessage);
        });
    }


    createElements(sources, type, totalSources, gameCoord) {
        const loadingContainer = document.getElementById('loading-container');
        const preloadDiv = document.getElementById('preload-div');
        const loadingPacman = document.getElementById('loading-pacman');
        const containerWidth = loadingContainer.scrollWidth - loadingPacman.scrollWidth;
        const loadingDotMask = document.getElementById('loading-dot-mask');

        const gameCoordRef = gameCoord;

        return new Promise((resolve, reject) => {
            let loadedSources = 0;

            sources.forEach((sources) => {
                const element = (type === 'img') ?
                    new Image() : new Audio();
                preloadDiv.appendChild(element);

                const elementReady = () => {
                    gameCoordRef.remainingScources -= 1;
                    loadedSources += 1;
                    const percent = 1 - (gameCoordRef.remainingScources / totalSources);
                    loadingPacman.style.left = `${percent * containerWidth}px`;
                    loadingDotMask.style.width = loadingPacman.style.left;

                    if (loadedSources === sources.length) {
                        resolve();
                    }
                };

                if (type === 'img') {
                    element.onload = elementReady;
                    element.onerror = reject;
                } else {
                    element.addEventListener('canplaythrough', elementReady);
                    element.onerror = reject;
                }

                element.src = source;

                if (type === 'audio') {
                    element.load();
                }
            });
        });
    }


    reset() {
        this.activeTimers = [];
        this.points = 0;
        this.level = 1;
        this.lives = 2;
        this.extraLivesGiven = false;
        this.remainingDots = 0;
        this.allowKeyPresses = true;
        this.allowPacmanMovement = false;
        this.allowPause = false;
        this.cutscene = true;
        this.highScore = localStorage.getItem('highScore');

        if (this.firstGame) {
            setInterval(() => {
                this.collisionDetectionLoop();
            }, 500);

            this.pacman = new Pacman(
                this.scaledTileSize, this.mazeArray, new CharacterUtil(),
            )
        }
    }

}