import Phaser from 'phaser';

export default class AccessoryBase extends Phaser.GameObjects.Sprite {

    static DEBUG = 0;
    static EARRINGS = 1;
    static HAIR = 2;
    static PINK_BOW = 3;
    static COWBOY_HAT = 4;
    static PARTY_HAT_BLUE = 5;
    static BLUE_BOW = 6;
    static GREEN_BOW = 7;
    static YELLOW_BOW = 8;
    static ORANGE_BOW = 9;
    static PURPLE_BOW = 10;
    static WHITE_BOW = 11;
    static BLOND_HAIR = 12;
    static RED_HAIR = 13;
    static RAINBOW_BOW = 14;
    static COWBOY_HAT2 = 15;
    static PARTY_HAT_RED = 16;
    static PARTY_HAT_GREEN = 17;
    static BONNET_BLUE = 18;
    static BONNET_GREEN = 19;
    static BONNET_PINK = 20;
    
    lamb = null;

    constructor(scene, x, y, texture, accType = AccessoryBase.BOW, lamb = null) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        this.scale = 2;
        // this.setOrigin(0.5, 0.5);
        if (lamb) {
            this.lamb = lamb;
            this.lamb.childObjects.add(this);
        this.setFrame(accType);
        }
    }

    update() {
        if (this.lamb) {
            const offsetX = this.lamb.flipX ? -32 : 32; // Adjust based on flipX
            const offsetY = -48; // Adjust Y position as needed
            this.setX(this.lamb.x + offsetX);
            this.setY(this.lamb.y + offsetY);
            this.setFlipX(this.lamb.flipX);
            this.depth = this.lamb.depth + 1;
        }
    }
}