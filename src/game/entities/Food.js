import Phaser from 'phaser';

class Food extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'apple');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        // this.setScale(2);
        // this.setInteractive();
    }

    // Add any additional methods or properties here
}

export default Food;