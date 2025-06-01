import Phaser from 'phaser';

export default class ShopButton extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'store');

        // Add to scene
        scene.add.existing(this);
        // Set scale
        this.setScale(2);
        // Enable input
        this.setInteractive({ useHandCursor: true });

        // Optional: Add a click event
        this.on('pointerdown', () => {
            this.onClick();
        });
    }

    onClick() {
        // Override this method in subclasses or instances
        console.log('ShopButton clicked!');
    }
}