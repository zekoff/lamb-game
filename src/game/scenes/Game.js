import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import Lamb from '../entities/Lamb';

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

        this.lamb = new Lamb(this, this.scale.width / 2, this.scale.height / 2);

        this.physics.add.collider(this.lamb, this.fences);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.time.addEvent({
            delay: 1000,
            callback: this.toggleEmote,
            callbackScope: this,
            loop: true
        });

        this.events.on('resize', (width, height) => {
        });

        this.events.on('postupdate', (time, delta) => {
            if (this.emote) {
                this.emote.setFlipX(this.lamb.flipX);
                this.emote.setX(this.lamb.flipX ? this.lamb.x + 72 : this.lamb.x - 72);
                this.emote.y = this.lamb.y - 64;
            }
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
        this.input.on('pointerup', (pointer) => {
            this.lamb.sendToLocation(pointer.x, pointer.y);
        });
        this.lamb.update()
    }
}
