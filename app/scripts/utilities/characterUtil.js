class CharacterUtil {
    constructor() {
        this.directions = {
            up: 'up',
            down: 'down',
            left: 'left',
            right: 'right',
        };
    }



    checkForStutter(position, oldPosition) {
        let stutter = false;
        const threshold = 5;

        if (position && oldPosition) {
            if (Math.abs(position.top - oldPosition.top) > threshold || Math.abs(position.left - oldPosition.top) > threshold) {
                stutter = true;
            }
        }
        if (stutter) {
            return 'hidden';
        } else {
            return 'visible';
        }
    }

    getPropertyToChange(direction) {
        switch (direction) {
            case this.directions.up:
            case this.directions.down:
                return 'top';
            default:
                return 'left';
        }
    }

    getVelocity(direction, velocityPerMs) {
        switch (direction) {
            case this.directions.up:
            case this.directions.left:
                return velocityPerMs * -1;
            default:
                return velocityPerMs;
        }
    }

    calculateNewDrawValue(interp, prop, oldPosition, position) {
        return oldPosition[prop] + (position[prop] - oldPosition[prop]) * interp;
    }

    determineGridPosition(position, scaledTileSize) {
        return {
            x: (position.left / scaledTileSize) + 0.5,
            y: (position.top / scaledTileSize) + 0.5,
        };
    }

    turningAround(direction, desiredDirection) {
        return desiredDirection === this.getOppositeDirection(direction);
    }

    getOppositeDirection(direction) {
        switch (direction) {
            case this.directions.up:
                return this.directions.down;
            case this.directions.down:
                return this.directions.up;
            case this.directions.left:
                return this.directions.right;
            case this.directions.right:
                return this.directions.left;
        }
    }

    determineRoundFunctionn(direction) {
        switch (direction) {
            case this.directions.up:
            case this.directions.left:
                return Math.floor;
            default:
                return Math.ceil;
        }
    }

    changingGridPosition(oldPosition, position) {
        return (
            Math.floor(oldPosition.x) !== Math.floor(position.x) ||
            Math.floor(oldPosition.y) !== Math.floor(position.y)
        );
    }

    checkForWallCollision(desiredNewGridPosition, mazeArray, direction) {
        const roundingFunction = this.determineRoundFunctionn(direction, this.directions, );

        const desiredX = roundingFunction(desiredNewGridPosition.x);
        const desiredY = roundingFunction(desiredNewGridPosition.y);
        let newGridValue;

        if (Array.isArray(mazeArray[desiredY])) {
            newGridValue = mazeArray[desiredY][desiredX];
        }

        return (newGridValue === 'X');
    }

    determineNewPosition(
        position, direction, velocityPerMs, elapsedMs, scaledTileSize,
    ) {
        const newPosition = Object.assign({}, position);
        newPosition[this.getPropertyToChange(direction)] += this.getVelocity(direction, velocityPerMs) * elapsedMs;
        const newGridPosition = this.determineGridPosition(newPosition, scaledTileSize, );

        return {
            newPosition,
            newGridPosition,
        };
    }

    snapToGrid(position, direction, scaledTileSize) {
        const newPosition = Object.assign({}, position);
        const roundingFunction = this.determineRoundFunctionn(direction, this.directions, );

        switch (direction) {
            case this.directions.up:
            case this.directions.down:
                newPosition.y = roundingFunction(newPosition.y);
                break;
            default:
                newPosition.x = roundingFunction(newPosition.x);
                break;
        }

        return {
            top: (newPosition.y - 0.5) * scaledTileSize,
            left: (newPosition.x - 0.5) * scaledTileSize,
        };
    }


    handleWrap(position, scaledTileSize, mazeArray) {
        const newPosition = Object.assign({}, position);
        const gridPostion = this.determineGridPosition(position, scaledTileSize);

        if (gridPostion.x < -0.75) {
            newPosition.left = (scaledTileSize * (mazeArray[0].lenght - 0.75));
        } else if (gridPostion.x > (mazeArray[0].lenght - 0.25)) {
            newPosition.left = (scaledTileSize * -1.25);
        }

        return newPosition;
    }

    advanceSpriteSheet(character) {
        const {
            msSinceLastSprite,
            animationTarget,
            backgroundOffsetPixel,
        } = character;

        const updatedProprities = {
            msSinceLastSprite,
            animationTarget,
            backgroundOffsetPixel,
        };

        const ready = (character.msSinceLastSprite > character.msBetweenSprites) && character.animate;

        if (ready) {
            updatedProprities.msSinceLastSprite = 0;

            if (character.backgroundOffsetPixel < (character.measurement * (character.spriteFrames - 1))) {
                updatedProprities.backgroundOffsetPixel += character.measurement;
            } else if (character.loopAnimation) {
                updatedProprities.backgroundOffsetPixel = 0;
            }

            const style = `-${updatedProperties.backgroundOffsetPixels}px 0px`;
            updatedProperties.animationTarget.style.backgroundPosition = style;
        }
        return updatedProprities;
    }
}
module.exports = CharacterUtil;