class Ghost {
    constructor(scaledTileSize, mazeArray, pacman, name, level, characterUtil, blinky) {
        this.scaledTileSize = scaledTileSize;
        this.mazeArray = mazeArray;
        this.pacman = pacman;
        this.name = name;
        this.level = level;
        this.characterUtil = characterUtil;
        this.blinky = blinky;
        this.animationTarget = document.getElementById(name);

        this.reset();
    }
    reset(fullGameReset) {
        if (fullGameReset) {
            delete this.defaultSpeed;
            delete this.cruiseElroy;
        }

        this.setDefaultMode();
        this.setMovementStats(this.pacman, this.name, this.level);
        this.setSpriteAnimationStats();
        this.setStyleMeasurements(this.scaledTileSize, this.spriteFrames);
        this.setDefaultPosition(this.scaledTileSize, this.name);
        this.setSpriteSheet(this.name, this.direction, this.mode);
    }

    setDefaultMode() {
        this.allowCollision = true;
        this.defaultMode = 'scatter';
        this.mode = 'scatter';
        if (this.name !== 'blinky') {
            this.idleMode = 'idle';
        }
    }

    setMovementStats(pacman, name, level) {
        const pacmanSpeed = pacman.velocityPerMs;
        const levelAdjustment = level / 100;

        this.slowSpeed = pacmanSpeed * (0.75 + levelAdjustment);
        this.mediumSpeed = pacmanSpeed * (0.875 + levelAdjustment);
        this.fastSpeed = pacmanSpeed * (1 + levelAdjustment);

        if (!this.defaultSpeed) {
            this.defaultSpeed = this.slowSpeed;
        }

        this.scaredSpeed = pacmanSpeed * 0.5;
        this.transitionSpeed = pacmanSpeed * 0.4;
        this.eyeSpeed = pacmanSpeed * 2;

        this.velocityPerMs = this.defaultSpeed;
        this.moving = false;

        switch (name) {
            case 'blinky':
                this.defaultDirection = this.characterUtil.directions.left;
                break;
            case 'pinky':
                this.defaultDirection = this.characterUtil.directions.down;
                break;
            case 'inky':
                this.defaultDirection = this.characterUtil.directions.up;
                break;
            case 'clyde':
                this.defaultDirection = this.characterUtil.directions.up;
                break;
            default:
                this.defaultDirection = this.characterUtil.directions.left;
                break;
        }
        this.direction = this.defaultDirection;
    }

    setSpriteAnimationStats() {
        this.display = true;
        this.loopAnimation = true;
        this.animate = true;
        this.msBetweenSprites = 250;
        this.msSinceLastSprite = 0;
        this.spriteFrames = 2;
        this.backgroundOffsetPixels = 0;
        this.animationTarget.style.backgroundPosition = '0px 0px';
    }

    setStyleMeasurements(scaledTileSize, spriteFrames) {
        // The ghosts are the size of 2x2 game tiles.
        this.measurement = scaledTileSize * 2;

        this.animationTarget.style.height = `${this.measurement}px`;
        this.animationTarget.style.width = `${this.measurement}px`;
        const bgSize = this.measurement * spriteFrames;
        this.animationTarget.style.backgroundSize = `${bgSize}px`;
    }

    setDefaultPosition(scaledTileSize, name) {
        switch (name) {
            case 'blinky':
                this.defaultPosition = {
                    top: scaledTileSize * 10.5,
                    left: scaledTileSize * 13,
                };
                break;
            case 'pinky':
                this.defaultPosition = {
                    top: scaledTileSize * 13.5,
                    left: scaledTileSize * 13,
                };
                break;
            case 'inky':
                this.defaultPosition = {
                    top: scaledTileSize * 13.5,
                    left: scaledTileSize * 11,
                };
                break;
            case 'clyde':
                this.defaultPosition = {
                    top: scaledTileSize * 13.5,
                    left: scaledTileSize * 15,
                };
                break;
            default:
                this.defaultPosition = {
                    top: 0,
                    left: 0,
                };
                break;
        }
        this.position = Object.assign({}, this.defaultPosition);
        this.oldPosition = Object.assign({}, this.position);
        this.animationTarget.style.top = `${this.position.top}px`;
        this.animationTarget.style.left = `${this.position.left}px`;
    }

    setSpriteSheet(name, direction, mode) {
        let emotion = '';
        if (this.defaultSpeed !== this.slowSpeed) {
            emotion = (this.defaultSpeed === this.mediumSpeed) ?
                '_annoyed' : '_angry';
        }

        if (mode === 'scared') {
            this.animationTarget.style.backgroundImage = 'url(app/style/graphics/' +
                `spriteSheets/characters/ghosts/scared_${this.scaredColor}.svg)`;
        } else if (mode === 'eyes') {
            this.animationTarget.style.backgroundImage = 'url(app/style/graphics/' +
                `spriteSheets/characters/ghosts/eyes_${direction}.svg)`;
        } else {
            this.animationTarget.style.backgroundImage = 'url(app/style/graphics/' +
                `spriteSheets/characters/ghosts/${name}/${name}_${direction}` +
                `${emotion}.svg)`;
        }
    }

    isInTunnel(gridPosition) {
        return (
            gridPosition.y === 14 &&
            (gridPosition.x < 6 || gridPosition.x > 21)
        );
    }

    isInGhostHouse(gridPosition) {
        return (
            (gridPosition.x > 9 && gridPosition.x < 18) &&
            (gridPosition.y > 11 && gridPosition.y < 17)
        );
    }

    getTile(mazeArray, y, x) {
        let tile = false;

        if (mazeArray[y] && mazeArray[y][x] && mazeArray[y][x] !== 'X') {
            tile = {
                x,
                y,
            };
        }

        return tile;
    }

    determinePossibleMoves(gridPosition, direction, mazeArray) {
        const { x, y } = gridPosition;

        const possibleMoves = {
            up: this.getTile(mazeArray, y - 1, x),
            down: this.getTile(mazeArray, y + 1, x),
            left: this.getTile(mazeArray, y, x - 1),
            right: this.getTile(mazeArray, y, x + 1),
        };

        // Ghosts are not allowed to turn around at crossroads
        possibleMoves[this.characterUtil.getOppositeDirection(direction)] = false;

        Object.keys(possibleMoves).forEach((tile) => {
            if (possibleMoves[tile] === false) {
                delete possibleMoves[tile];
            }
        });

        return possibleMoves;
    }

    calculateDistance(position, pacman) {
        return Math.sqrt(
            ((position.x - pacman.x) ** 2) + ((position.y - pacman.y) ** 2),
        );
    }

    getPositionInFrontOfPacman(pacmanGridPosition, spaces) {
        const target = Object.assign({}, pacmanGridPosition);
        const pacDirection = this.pacman.direction;
        const propToChange = (pacDirection === 'up' || pacDirection === 'down') ?
            'y' : 'x';
        const tileOffset = (pacDirection === 'up' || pacDirection === 'left') ?
            (spaces * -1) : spaces;
        target[propToChange] += tileOffset;

        return target;
    }

    determinePinkyTarget(pacmanGridPosition) {
        return this.getPositionInFrontOfPacman(
            pacmanGridPosition, 4,
        );
    }

    determineInkyTarget(pacmanGridPosition) {
        const blinkyGridPosition = this.characterUtil.determineGridPosition(
            this.blinky.position, this.scaledTileSize,
        );
        const pivotPoint = this.getPositionInFrontOfPacman(
            pacmanGridPosition, 2,
        );
        return {
            x: pivotPoint.x + (pivotPoint.x - blinkyGridPosition.x),
            y: pivotPoint.y + (pivotPoint.y - blinkyGridPosition.y),
        };
    }


    determineClydeTarget(gridPosition, pacmanGridPosition) {
        const distance = this.calculateDistance(gridPosition, pacmanGridPosition);
        return (distance > 8) ? pacmanGridPosition : { x: 0, y: 30 };
    }


    getTarget(name, gridPosition, pacmanGridPosition, mode) {
        // Ghosts return to the ghost-house after eaten
        if (mode === 'eyes') {
            return { x: 13.5, y: 10 };
        }

        // Ghosts run from Pacman if scared
        if (mode === 'scared') {
            return pacmanGridPosition;
        }

        // Ghosts seek out corners in Scatter mode
        if (mode === 'scatter') {
            switch (name) {
                case 'blinky':
                    // Blinky will chase Pacman, even in Scatter mode, if he's in Cruise Elroy form
                    return (this.cruiseElroy ? pacmanGridPosition : { x: 27, y: 0 });
                case 'pinky':
                    return { x: 0, y: 0 };
                case 'inky':
                    return { x: 27, y: 30 };
                case 'clyde':
                    return { x: 0, y: 30 };
                default:
                    return { x: 0, y: 0 };
            }
        }

        switch (name) {
            // Blinky goes after Pacman's position
            case 'blinky':
                return pacmanGridPosition;
            case 'pinky':
                return this.determinePinkyTarget(pacmanGridPosition);
            case 'inky':
                return this.determineInkyTarget(pacmanGridPosition);
            case 'clyde':
                return this.determineClydeTarget(gridPosition, pacmanGridPosition);
            default:
                // TODO: Other ghosts
                return pacmanGridPosition;
        }
    }

    determineBestMove(
        name, possibleMoves, gridPosition, pacmanGridPosition, mode,
    ) {
        let bestDistance = (mode === 'scared') ? 0 : Infinity;
        let bestMove;
        const target = this.getTarget(name, gridPosition, pacmanGridPosition, mode);

        Object.keys(possibleMoves).forEach((move) => {
            const distance = this.calculateDistance(
                possibleMoves[move], target,
            );
            const betterMove = (mode === 'scared') ?
                (distance > bestDistance) :
                (distance < bestDistance);

            if (betterMove) {
                bestDistance = distance;
                bestMove = move;
            }
        });

        return bestMove;
    }

    determineDirection(
        name, gridPosition, pacmanGridPosition, direction, mazeArray, mode,
    ) {
        let newDirection = direction;
        const possibleMoves = this.determinePossibleMoves(
            gridPosition, direction, mazeArray,
        );

        if (Object.keys(possibleMoves).length === 1) {
            [newDirection] = Object.keys(possibleMoves);
        } else if (Object.keys(possibleMoves).length > 1) {
            newDirection = this.determineBestMove(
                name, possibleMoves, gridPosition, pacmanGridPosition, mode,
            );
        }

        return newDirection;
    }


    handleIdleMovement(elapsedMs, position, velocity) {
        const newPosition = Object.assign({}, this.position);

        if (position.y <= 13.5) {
            this.direction = this.characterUtil.directions.down;
        } else if (position.y >= 14.5) {
            this.direction = this.characterUtil.directions.up;
        }

        if (this.idleMode === 'leaving') {
            if (position.x === 13.5 && (position.y > 10.8 && position.y < 11)) {
                this.idleMode = undefined;
                newPosition.top = this.scaledTileSize * 10.5;
                this.direction = this.characterUtil.directions.left;
                window.dispatchEvent(new Event('releaseGhost'));
            } else if (position.x > 13.4 && position.x < 13.6) {
                newPosition.left = this.scaledTileSize * 13;
                this.direction = this.characterUtil.directions.up;
            } else if (position.y > 13.9 && position.y < 14.1) {
                newPosition.top = this.scaledTileSize * 13.5;
                this.direction = (position.x < 13.5) ?
                    this.characterUtil.directions.right :
                    this.characterUtil.directions.left;
            }
        }

        newPosition[this.characterUtil.getPropertyToChange(this.direction)] += this.characterUtil.getVelocity(this.direction, velocity) * elapsedMs;

        return newPosition;
    }

    endIdleMode() {
        this.idleMode = 'leaving';
    }

    handleSnappedMovement(elapsedMs, gridPosition, velocity, pacmanGridPosition) {
        const newPosition = Object.assign({}, this.position);

        this.direction = this.determineDirection(
            this.name, gridPosition, pacmanGridPosition, this.direction,
            this.mazeArray, this.mode,
        );
        newPosition[this.characterUtil.getPropertyToChange(this.direction)] += this.characterUtil.getVelocity(this.direction, velocity) * elapsedMs;

        return newPosition;
    }

    enteringGhostHouse(mode, position) {
        return (
            mode === 'eyes' &&
            position.y === 11 &&
            (position.x > 13.4 && position.x < 13.6)
        );
    }

    enteredGhostHouse(mode, position) {
        return (
            mode === 'eyes' &&
            position.x === 13.5 &&
            (position.y > 13.8 && position.y < 14.2)
        );
    }

    leavingGhostHouse(mode, position) {
        return (
            mode !== 'eyes' &&
            position.x === 13.5 &&
            (position.y > 10.8 && position.y < 11)
        );
    }


    handleGhostHouse(gridPosition) {
        const gridPositionCopy = Object.assign({}, gridPosition);

        if (this.enteringGhostHouse(this.mode, gridPosition)) {
            this.direction = this.characterUtil.directions.down;
            gridPositionCopy.x = 13.5;
            this.position = this.characterUtil.snapToGrid(
                gridPositionCopy, this.direction, this.scaledTileSize,
            );
        }

        if (this.enteredGhostHouse(this.mode, gridPosition)) {
            this.direction = this.characterUtil.directions.up;
            gridPositionCopy.y = 14;
            this.position = this.characterUtil.snapToGrid(
                gridPositionCopy, this.direction, this.scaledTileSize,
            );
            this.mode = this.defaultMode;
            window.dispatchEvent(new Event('restoreGhost'));
        }

        if (this.leavingGhostHouse(this.mode, gridPosition)) {
            gridPositionCopy.y = 11;
            this.position = this.characterUtil.snapToGrid(
                gridPositionCopy, this.direction, this.scaledTileSize,
            );
            this.direction = this.characterUtil.directions.left;
        }

        return gridPositionCopy;
    }


    handleUnsnappedMovement(elapsedMs, gridPosition, velocity) {
        const gridPositionCopy = this.handleGhostHouse(gridPosition);

        const desired = this.characterUtil.determineNewPositions(
            this.position, this.direction, velocity, elapsedMs, this.scaledTileSize,
        );

        if (this.characterUtil.changingGridPosition(
                gridPositionCopy, desired.newGridPosition,
            )) {
            return this.characterUtil.snapToGrid(
                gridPositionCopy, this.direction, this.scaledTileSize,
            );
        }

        return desired.newPosition;
    }

    handleMovement(elapsedMs) {
        let newPosition;

        const gridPosition = this.characterUtil.determineGridPosition(
            this.position, this.scaledTileSize,
        );
        const pacmanGridPosition = this.characterUtil.determineGridPosition(
            this.pacman.position, this.scaledTileSize,
        );
        const velocity = this.determineVelocity(
            gridPosition, this.mode,
        );

        if (this.idleMode) {
            newPosition = this.handleIdleMovement(
                elapsedMs, gridPosition, velocity,
            );
        } else if (JSON.stringify(this.position) === JSON.stringify(
                this.characterUtil.snapToGrid(
                    gridPosition, this.direction, this.scaledTileSize,
                ),
            )) {
            newPosition = this.handleSnappedMovement(
                elapsedMs, gridPosition, velocity, pacmanGridPosition,
            );
        } else {
            newPosition = this.handleUnsnappedMovement(
                elapsedMs, gridPosition, velocity,
            );
        }

        newPosition = this.characterUtil.handleWarp(
            newPosition, this.scaledTileSize, this.mazeArray,
        );

        this.checkCollision(gridPosition, pacmanGridPosition);

        return newPosition;
    }

    changeMode(newMode) {
        this.defaultMode = newMode;

        const gridPosition = this.characterUtil.determineGridPosition(
            this.position, this.scaledTileSize,
        );

        if ((this.mode === 'chase' || this.mode === 'scatter') &&
            !this.cruiseElroy) {
            this.mode = newMode;

            if (!this.isInGhostHouse(gridPosition)) {
                this.direction = this.characterUtil.getOppositeDirection(
                    this.direction,
                );
            }
        }
    }

    toggleScaredColor() {
        this.scaredColor = (this.scaredColor === 'blue') ?
            'white' : 'blue';
        this.setSpriteSheet(this.name, this.direction, this.mode);
    }

    becomeScared() {
        const gridPosition = this.characterUtil.determineGridPosition(
            this.position, this.scaledTileSize,
        );

        if (this.mode !== 'eyes') {
            if (!this.isInGhostHouse(gridPosition) && this.mode !== 'scared') {
                this.direction = this.characterUtil.getOppositeDirection(
                    this.direction,
                );
            }
            this.mode = 'scared';
            this.scaredColor = 'blue';
            this.setSpriteSheet(this.name, this.direction, this.mode);
        }
    }

    endScared() {
        this.mode = this.defaultMode;
        this.setSpriteSheet(this.name, this.direction, this.mode);
    }

    speedUp() {
        this.cruiseElroy = true;

        if (this.defaultSpeed === this.slowSpeed) {
            this.defaultSpeed = this.mediumSpeed;
        } else if (this.defaultSpeed === this.mediumSpeed) {
            this.defaultSpeed = this.fastSpeed;
        }
    }


    resetDefaultSpeed() {
        this.defaultSpeed = this.slowSpeed;
        this.cruiseElroy = false;
        this.setSpriteSheet(this.name, this.direction, this.mode);
    }

    pause(newValue) {
        this.paused = newValue;
    }


    checkCollision(position, pacman) {
        if (this.calculateDistance(position, pacman) < 1 &&
            this.mode !== 'eyes' &&
            this.allowCollision) {
            if (this.mode === 'scared') {
                window.dispatchEvent(new CustomEvent('eatGhost', {
                    detail: {
                        ghost: this,
                    },
                }));
                this.mode = 'eyes';
            } else {
                window.dispatchEvent(new Event('deathSequence'));
            }
        }
    }


    determineVelocity(position, mode) {
        if (mode === 'eyes') {
            return this.eyeSpeed;
        }

        if (this.paused) {
            return 0;
        }

        if (this.isInTunnel(position) || this.isInGhostHouse(position)) {
            return this.transitionSpeed;
        }

        if (mode === 'scared') {
            return this.scaredSpeed;
        }

        return this.defaultSpeed;
    }


    draw(interp) {
        const newTop = this.characterUtil.calculateNewDrawValue(
            interp, 'top', this.oldPosition, this.position,
        );
        const newLeft = this.characterUtil.calculateNewDrawValue(
            interp, 'left', this.oldPosition, this.position,
        );
        this.animationTarget.style.top = `${newTop}px`;
        this.animationTarget.style.left = `${newLeft}px`;

        this.animationTarget.style.visibility = this.display ?
            this.characterUtil.checkForStutter(this.position, this.oldPosition) :
            'hidden';

        const updatedProperties = this.characterUtil.advanceSpriteSheet(this);
        this.msSinceLastSprite = updatedProperties.msSinceLastSprite;
        this.animationTarget = updatedProperties.animationTarget;
        this.backgroundOffsetPixels = updatedProperties.backgroundOffsetPixels;
    }

    update(elapsedMs) {
        this.oldPosition = Object.assign({}, this.position);

        if (this.moving) {
            this.position = this.handleMovement(elapsedMs);
            this.setSpriteSheet(this.name, this.direction, this.mode);
            this.msSinceLastSprite += elapsedMs;
        }
    }
}
module.exports = Ghost;