import Phaser from 'phaser';

class Food extends Phaser.GameObjects.Sprite {
    timeoutTimer = null;
    constructor(scene, x, y) {
        super(scene, x, y, 'apple');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setInteractive({ draggable: true });
        this.setScale(2);
        this.on('drag', (pointer, dragX, dragY) => {
            this.x = dragX;
            this.y = dragY;
        });
        // TODO this is chaos
        const foodFadeTweenCallback = () =>
            this.scene.tweens.add({
                targets: this,
                scale: 0,
                duration: 500,
                ease: 'Bounce.easeIn',
                onComplete: () => {
                    this.destroy();
                },
                callbackScope: this
            });
        const foodFadeConfig = {
            delay: 5000,
            callback: foodFadeTweenCallback,
            callbackScope: this
        }
        this.on('dragend', () => {
            this.scene.events.emit('food-dropped', this);
            this.scene.tweens.add({
                targets: this,
                scale: 1,
                duration: 500,
                ease: 'Bounce.easeOut'
            });

            this.timeoutTimer = this.scene.time.addEvent(foodFadeConfig);
        });
    }

}

export default Food;