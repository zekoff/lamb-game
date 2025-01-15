import Phaser from 'phaser';

class Food extends Phaser.GameObjects.Sprite {
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
        this.on('dragend', () => {
            this.scene.events.emit('food-dropped', this);
            this.scene.tweens.add({
                targets: this,
                // x: this.x,
                // y: this.y,
                scale: 1,
                duration: 500,
                ease: 'Bounce.easeOut'
            });
        });
    }

    // Add any additional methods or properties here

}

export default Food;