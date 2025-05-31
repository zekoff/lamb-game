import Phaser from 'phaser';

export default class Pill extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture = 'pill') {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setInteractive({ draggable: true });
        this.setScale(2);
        this.on('drag', (pointer, dragX, dragY) => {
            this.x = dragX;
            this.y = dragY;
        }, this);
        const pillFadeTweenCallback = () =>
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
        const pillFadeConfig = {
            delay: 5000,
            callback: pillFadeTweenCallback,
            callbackScope: this
        }
        this.on('dragend', () => {
            this.scene.events.emit('pill-dropped', this);
            this.scene.tweens.add({
                targets: this,
                scale: 1,
                duration: 500,
                ease: 'Bounce.easeOut'
            });
            this.timeoutTimer = this.scene.time.addEvent(pillFadeConfig);
        });

    }

    // Add any custom methods for Pill here
}