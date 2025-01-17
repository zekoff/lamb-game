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
        this.scene.events.emit('coin-collected');
        this.destroy();
    }
}

export default Coin;