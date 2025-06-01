import Phaser from 'phaser';

export default class XButton extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'x-button');

        // Enable input
        this.setInteractive({ useHandCursor: true });
        this.setScale(2); // Set scale for the button

        // Optional: Add a click event
        this.on('pointerdown', () => {
            this.onClick();
        });

        this.scene.shopLayer.add(this);

        // Add to scene
        // scene.add.existing(this);
        console.log('XButton created at', x, y);
    }

    onClick() {
        // Override this method in subclasses or instances
        this.scene.shopLayer.setVisible(false);
        this.scene.shopLayer.sendToBack();
        this.scene.shopOpen = false;
        this.scene.shopPageDisplayed = 0;
        if (this.scene.currentlyListedItems) {
            this.scene.currentlyListedItems.forEach(item => {
                item.destroy();
            });
        };
        this.scene.currentlyListedItems = [];

    }
}