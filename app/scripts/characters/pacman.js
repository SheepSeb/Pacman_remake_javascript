class Pacman {
    constructor(scaledTileSize, mazeArray, characterUtil) {
        this.scaledTileSize = scaledTileSize;
        this.mazeArray = mazeArray;
        this.characterUtil = characterUtil;
        this.animationTarget = document.getElementById('pacman');
        this.pacmanArrow = document.getElementById('pacman-arrow');

        this.reset();
    }

    reset() {
        this.setMovementStats(this.scaledTileSize);
        this.setSpriteAnimationStats();
        this.setStyleMeasurements(this.scaledTileSize, this.spriteFrames);
        this.setDeafaultPosition(this.scaledTileSize);
        this.setSpriteSheet(this.direction);
        this.pacmanArrow.style.backgroundImage = 'url(app/style/graphics/' +
            `spriteSheets/characters/pacman/arrow_${this.direction}.svg)`;
    }

    setMovementStats(scaledTileSize) {
        this.velocityPerMs = this.calculateVelocityPerMs(scaledTileSize);
        this.desiredDirection = this.characterUtil.directions.left;
        this.direction = this.characterUtil.directions.left;
        this.moving = false;
    }

    setSpriteAnimationStats() {
        this.specialAnimation = false;
        this.display = true;
        this.animate = true;
        this.loopAnimation = true;
        this.msBetweenSprites = 50;
        this.msSinceLastSprite = 0;
        this.spriteFrames = 4;
        this.backgroundOffsetPixels = 0;
        this.animationTarget.style.backgroundPosition = '0px 0px';
    }

    setStyleMeasurements(scaledTileSize, spriteFrames) {
        this.measurements = scaledTileSize * 2;

        this.animationTarget.style.height = `${this.measurement}px`;
        this.animationTarget.style.width = `${this.measurement}px`;
        this.animationTarget.style.backgroundSize = `${
          this.measurement * spriteFrames
        }px`;

        this.pacmanArrow.style.height = `${this.measurement * 2}px`;
        this.pacmanArrow.style.width = `${this.measurement * 2}px`;
        this.pacmanArrow.style.backgroundSize = `${this.measurement * 2}px`;
    }

    setDefaultPosition(scaledTileSize) {
        this.defaultPosition = {
            top: scaledTileSize * 22.5,
            left: scaledTileSize * 13,
        };
        this.position = Object.assign({}, this.defaultPosition);
        this.oldPosition = Object.assign({}, this.position);
        this.animationTarget.style.top = `${this.position.top}px`;
        this.animationTarget.style.left = `${this.position.left}px`;
    }
    setSpriteSheet(direction) {
        this.animationTarget.style.backgroundImage = 'url(app/style/graphics/' +
            `spriteSheets/characters/pacman/pacman_${direction}.svg)`;
    }

    calculateVelocityPerMs(scaledTileSize) {
        const velocityPerSecond = scaledTileSize * 11;
        return velocityPerSecond / 1000;
    }


    prepDeathAnimation() {
        this.loopAnimation = false;
        this.msBetweenSprites = 125;
        this.spriteFrames = 12;
        this.specialAnimation = true;
        this.backgroundOffsetPixels = 0;
        const bgSize = this.measurement * this.spriteFrames;
        this.animationTarget.style.backgroundSize = `${bgSize}px`;
        this.animationTarget.style.backgroundImage = 'url(app/style/' +
            'graphics/spriteSheets/characters/pacman/pacman_death.svg)';
        this.animationTarget.style.backgroundPosition = '0px 0px';
        this.pacmanArrow.style.backgroundImage = '';
    }


    changeDirection(newDirection, startMoving) {
        this.desiredDirection = newDirection;
        this.pacmanArrow.style.backgroundImage = 'url(app/style/graphics/' +
            `spriteSheets/characters/pacman/arrow_${this.desiredDirection}.svg)`;

        if (startMoving) {
            this.moving = true;
        }
    }

    updatePacmanArrowPosition(position, scaledTileSize) {
        this.pacmanArrow.style.top = `${position.top - scaledTileSize}px`;
        this.pacmanArrow.style.left = `${position.left - scaledTileSize}px`;
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
        this.pacmanArrow.style.visibility = this.animationTarget.style.visibility;

        this.updatePacmanArrowPosition(this.position, this.scaledTileSize);

        const updatedProperties = this.characterUtil.advanceSpriteSheet(this);
        this.msSinceLastSprite = updatedProperties.msSinceLastSprite;
        this.animationTarget = updatedProperties.animationTarget;
        this.backgroundOffsetPixels = updatedProperties.backgroundOffsetPixels;
    }

    handleUnsnappedMovement(gridPosition, elapsedMs) {
        const desired = this.characterUtil.determineNewPositions(
            this.position, this.desiredDirection, this.velocityPerMs,
            elapsedMs, this.scaledTileSize,
        );
        const alternate = this.characterUtil.determineNewPositions(
            this.position, this.direction, this.velocityPerMs,
            elapsedMs, this.scaledTileSize,
        );

        if (this.characterUtil.turningAround(
                this.direction, this.desiredDirection,
            )) {
            this.direction = this.desiredDirection;
            this.setSpriteSheet(this.direction);
            return desired.newPosition;
        }
        if (this.characterUtil.changingGridPosition(
                gridPosition, alternate.newGridPosition,
            )) {
            return this.characterUtil.snapToGrid(
                gridPosition, this.direction, this.scaledTileSize,
            );
        }
        return alternate.newPosition;
    }

    handleSnappedMovement(elapsedMs) {
        const desired = this.characterUtil.determineNewPositions(
            this.position, this.desiredDirection, this.velocityPerMs,
            elapsedMs, this.scaledTileSize,
        );
        const alternate = this.characterUtil.determineNewPositions(
            this.position, this.direction, this.velocityPerMs,
            elapsedMs, this.scaledTileSize,
        );

        if (this.characterUtil.checkForWallCollision(
                desired.newGridPosition, this.mazeArray, this.desiredDirection,
            )) {
            if (this.characterUtil.checkForWallCollision(
                    alternate.newGridPosition, this.mazeArray, this.direction,
                )) {
                this.moving = false;
                return this.position;
            }
            return alternate.newPosition;
        }
        this.direction = this.desiredDirection;
        this.setSpriteSheet(this.direction);
        return desired.newPosition;
    }

    update(elapsedMs) {
        this.oldPosition = Object.assign({}, this.position);

        if (this.moving) {
            const gridPosition = this.characterUtil.determineGridPosition(
                this.position, this.scaledTileSize,
            );

            if (JSON.stringify(this.position) === JSON.stringify(
                    this.characterUtil.snapToGrid(
                        gridPosition, this.direction, this.scaledTileSize,
                    ),
                )) {
                this.position = this.handleSnappedMovement(elapsedMs);
            } else {
                this.position = this.handleUnsnappedMovement(gridPosition, elapsedMs);
            }

            this.position = this.characterUtil.handleWarp(
                this.position, this.scaledTileSize, this.mazeArray,
            );
        }

        if (this.moving || this.specialAnimation) {
            this.msSinceLastSprite += elapsedMs;
        }
    }
}
module.exports = Pacman;