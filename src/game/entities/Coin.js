import Phaser from 'phaser';

class Coin extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'coin');
        scene.add.existing(this);
        this.play('coin-spin');
        // this.setInteractive();
        this.on('pointerup', this.collect, this);
    }

    collect() {
        this.scene.events.emit('coin-collected', this);
        this.scene.tweens.add({
            targets: this,
            x: this.scene.coinsText.x,
            y: this.scene.coinsText.y,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 1500,
            ease: 'Quad.easeIn',
            onComplete: () => {
                this.destroy();
            }
        });
    }
}

export default Coin;