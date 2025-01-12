import Phaser from 'phaser';

class Coin extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'coin');
        scene.add.existing(this);
        this.play('coin-spin');
        this.setInteractive();
        this.on('pointerup', this.collect, this);
    }

    collect() {
        this.destroy();
        // Add any additional logic for when the coin is collected
    }
}

export default Coin;