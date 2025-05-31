import Phaser from 'phaser';

class Guitar extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'guitar');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setInteractive({ draggable: true });
        this.setScale(2);
        this.on('drag', (pointer, dragX, dragY) => {
            this.x = dragX;
            this.y = dragY;
        }, this);
        const guitarFadeTweenCallback = () =>
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
        const guitarFadeConfig = {
            delay: 5000,
            callback: guitarFadeTweenCallback,
            callbackScope: this
        }
        this.on('dragend', () => {
            this.scene.events.emit('guitar-dropped', this);
            this.startWobble();
            this.timeoutTimer = this.scene.time.addEvent(guitarFadeConfig);
        });

    }

    startWobble() {
        this.scene.tweens.add({
            targets: this,
            scale: { from: 2.1, to: 1.9 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
}

export default Guitar;