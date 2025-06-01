import Phaser from 'phaser';

export default class UiArrows extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, leftFacing = true) {
        super(scene, x, y, 'ui-arrows', leftFacing ? 0 : 1);
        scene.add.existing(this);
        this.setScale(2); // Set scale for UI arrows
        // Custom initialization for UI arrows
        this.setInteractive();
        this.setOrigin(0.5);

        // Example: add a simple animation or effect
        this.on('pointerover', () => {
            this.setTint(0xffff00);
        });
        this.on('pointerout', () => {
            this.clearTint();
        });

        this.scene.shopLayer.add(this);

        this.on('pointerdown', leftFacing ? this.onLeftPage : this.onRightPage, this);
    }

    onLeftPage() {
        if (this.scene.shopPageDisplayed > 0) {
            this.scene.shopPageDisplayed--;
            this.scene.updateShopPage();
        }
    }

    onRightPage() {
        if (this.scene.shopPageDisplayed < this.scene.maxShopPages - 1) {
            this.scene.shopPageDisplayed++;
            this.scene.updateShopPage();
        }
    }

    // Example custom method
    highlight() {
        this.setAlpha(0.7);
    }

    resetHighlight() {
        this.setAlpha(1);
    }
}