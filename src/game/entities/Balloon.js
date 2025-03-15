import Phaser from 'phaser';

class Balloon extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'balloon');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setInteractive({ draggable: true });
        this.setScale(2);
        this.on('drag', (pointer, dragX, dragY) => {
            this.x = dragX;
            this.y = dragY;
        }, this);
        const balloonFadeTweenCallback = () =>
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
        const balloonFadeConfig = {
            delay: 5000,
            callback: balloonFadeTweenCallback,
            callbackScope: this
        }
        this.on('dragend', () => {
            this.scene.events.emit('balloon-dropped', this);
            this.startWobble();
            this.timeoutTimer = this.scene.time.addEvent(balloonFadeConfig);
        });

    }

    startWobble() {
        this.scene.tweens.add({
            targets: this,
            angle: { from: -10, to: 10 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
}

export default Balloon;