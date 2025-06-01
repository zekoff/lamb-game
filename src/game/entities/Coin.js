import Phaser from 'phaser';

class Coin extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, pinataEffect) {
        super(scene, x, y, 'coin');
        scene.add.existing(this);
        this.play('coin-spin');
        this.disableInteractive();
        this.on('pointerup', this.collect, this);
        if (pinataEffect) {
            this.setVisible(false);
            this.scene.tweens.add({
                onStart: () => {
                    this.setVisible(true);
                    this.scene.sound.play('coin-pickup');
                },
                delay: Phaser.Math.RND.between(0, 1000),
                targets: this,
                x: this.x + Phaser.Math.Between(-64, 64),
                y: this.y + Phaser.Math.Between(-64, 64),
                duration: 1000,
                ease: 'Power1',
                onComplete: () => {
                    this.collect();
                }
            });
        }
    }

    collect() {
        this.scene.tweens.add({
            targets: this,
            x: this.scene.coinsText.x,
            y: this.scene.coinsText.y,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 1500,
            ease: 'Quad.easeIn',
            onComplete: () => {
                this.scene.events.emit('coin-collected', this);
            }
        });
    }
}

export default Coin;