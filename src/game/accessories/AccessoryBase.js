import Phaser from 'phaser';

export default class AccessoryBase extends Phaser.GameObjects.Sprite {

    // attach names to frame indicies
    static DEBUG = 0;
    static EARRINGS = 1;
    static BROWN_HAIR = 2;
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

    static ACCESSORY_LIST = [
        { id: AccessoryBase.PINK_BOW, name: 'Pink Bow', price: 10, frame: AccessoryBase.PINK_BOW },
        { id: AccessoryBase.WHITE_BOW, name: 'White Bow', price: 10, frame: AccessoryBase.WHITE_BOW },
        { id: AccessoryBase.BLUE_BOW, name: 'Blue Bow', price: 25, frame: AccessoryBase.BLUE_BOW },
        { id: AccessoryBase.GREEN_BOW, name: 'Green Bow', price: 25, frame: AccessoryBase.GREEN_BOW },
        { id: AccessoryBase.YELLOW_BOW, name: 'Yellow Bow', price: 20, frame: AccessoryBase.YELLOW_BOW },
        { id: AccessoryBase.ORANGE_BOW, name: 'Orange Bow', price: 20, frame: AccessoryBase.ORANGE_BOW },
        { id: AccessoryBase.PURPLE_BOW, name: 'Purple Bow', price: 25, frame: AccessoryBase.PURPLE_BOW },
        { id: AccessoryBase.EARRINGS, name: 'Earrings', price: 25, frame: AccessoryBase.EARRINGS },
        { id: AccessoryBase.BROWN_HAIR, name: 'Brown Hair', price: 25, frame: AccessoryBase.BROWN_HAIR },
        { id: AccessoryBase.BLOND_HAIR, name: 'Blond Hair', price: 25, frame: AccessoryBase.BLOND_HAIR },
        { id: AccessoryBase.RED_HAIR, name: 'Red Hair', price: 25, frame: AccessoryBase.RED_HAIR },
        { id: AccessoryBase.COWBOY_HAT, name: 'Cowboy Hat', price: 20, frame: AccessoryBase.COWBOY_HAT },
        { id: AccessoryBase.COWBOY_HAT2, name: 'Fancy Cowboy Hat', price: 30, frame: AccessoryBase.COWBOY_HAT2 },
        { id: AccessoryBase.PARTY_HAT_BLUE, name: 'Blue Party Hat', price: 25, frame: AccessoryBase.PARTY_HAT_BLUE },
        { id: AccessoryBase.PARTY_HAT_RED, name: 'Red Party Hat', price: 40, frame: AccessoryBase.PARTY_HAT_RED },
        { id: AccessoryBase.PARTY_HAT_GREEN, name: 'Green Party Hat', price: 35, frame: AccessoryBase.PARTY_HAT_GREEN },
        { id: AccessoryBase.BONNET_BLUE, name: 'Blue Bonnet', price: 50, frame: AccessoryBase.BONNET_BLUE },
        { id: AccessoryBase.BONNET_GREEN, name: 'Green Bonnet', price: 50, frame: AccessoryBase.BONNET_GREEN },
        { id: AccessoryBase.BONNET_PINK, name: 'Pink Bonnet', price: 75, frame: AccessoryBase.BONNET_PINK },
        { id: AccessoryBase.RAINBOW_BOW, name: 'Rainbow Bow', price: 100, frame: AccessoryBase.RAINBOW_BOW },
    ]

    lamb = null;

    constructor(scene, x, y, texture, accType = AccessoryBase.BOW, lamb = null) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        // scene.physics.add.existing(this);
        this.scale = 2;
        // this.setOrigin(0.5, 0.5);
        this.setFrame(accType);
        if (lamb) {
            this.lamb = lamb;
            this.lamb.childObjects.add(this);
            this.scene.gameLayer.add(this);
        };
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