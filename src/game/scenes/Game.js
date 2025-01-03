import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class Game extends Scene {
    constructor() {
        super('Game');
        this.lamb = null;
        this.cursors = null;
        this.fences = null;
        this.background = null;
        this.emote = null;
    }

    preload() {
        this.load.setPath('assets');

        this.load.spritesheet('lamb', 'lamb.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('background', 'background.png');
        this.load.spritesheet('fence', 'fence_sheet.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('emote_bubbles', 'emote_bubble.png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {

        this.background = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'background');
        this.background.setOrigin(0, 0);

        const fencesNeeded = Math.ceil(this.scale.width / 64);
        this.fences = this.physics.add.staticGroup({ key: 'fence', frame: 0, repeat: fencesNeeded, setXY: { x: 0, y: 32, stepX: 64 } });
        this.fences.getChildren().forEach(fence => {
            fence.setFrame(Phaser.Math.Between(0, 3));
        });

        this.lamb = this.physics.add.sprite(this.scale.width / 2, this.scale.height / 2, 'lamb');
        this.lamb.anims.create({
            key: 'walk',
            frames: this.lamb.anims.generateFrameNumbers('lamb', { start: 0, end: 1 }),
            frameRate: 2,
            repeat: -1
        });
        this.lamb.anims.play('walk');
        this.lamb.setScale(2);
        this.lamb.setCollideWorldBounds(true);
        this.lamb.body.setOffset(0, 40);
        this.lamb.body.setSize(64, 24, false);

        this.physics.add.collider(this.lamb, this.fences);
        // this.physics.collide(this.lamb, this.fences);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.time.addEvent({
            delay: 1000,
            callback: this.toggleEmote,
            callbackScope: this,
            loop: true
        });

        EventBus.emit('current-scene-ready', this);

    }

    toggleEmote() {
        if (this.emote) {
            this.emote.destroy();
            this.emote = null;
        } else {
            this.emote = this.add.sprite(this.lamb.x, this.lamb.y, 'emote_bubbles');
            this.emote.setScale(2);
            this.emote.setFrame(Phaser.Math.Between(1, 3));
        }
    }

    update() {
        if (this.cursors.left.isDown) {
            this.lamb.setVelocityX(-240);
            this.lamb.setFlipX(false);
        } else if (this.cursors.right.isDown) {
            this.lamb.setFlipX(true);
            this.lamb.setVelocityX(240);
        } else {
            this.lamb.setVelocityX(0);
        }

        if (this.cursors.up.isDown) {
            this.lamb.setVelocityY(-240);
        } else if (this.cursors.down.isDown) {
            this.lamb.setVelocityY(240);
        } else {
            this.lamb.setVelocityY(0);
        }

        if (this.emote) {
            this.emote.setFlipX(this.lamb.flipX);
            this.emote.setX(this.lamb.flipX ? this.lamb.x + 72 : this.lamb.x - 72);
            this.emote.y = this.lamb.y - 64;
        }
    }
}
