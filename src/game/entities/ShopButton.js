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
        this.scene.shopLayer.setVisible(true);
        this.scene.shopLayer.bringToTop();
        this.scene.shopOpen = true;
        this.scene.updateShopPage();
        // this.scene.leftArrow.clearTint();
        // this.scene.rightArrow.clearTint();
        // if (this.scene.shopPageDisplayed == 0) this.scene.leftArrow.setTint(0x000000);
        // if (this.scene.shopPageDisplayed == this.scene.maxShopPages - 1) this.scene.rightArrow.setTint(0x000000);
        this.scene.uiLayer.setVisible(false);
    }
}