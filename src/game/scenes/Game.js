import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import Lamb from '../entities/Lamb';

const NUMBER_OF_LAMBS = 5;

export class Game extends Scene {

    constructor() {
        super('Game');
        this.lambs = null;
        this.fences = null;
        this.background = null;
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

        this.anims.create({
            key: 'lamb-walk',
            frames: this.anims.generateFrameNumbers('lamb', { start: 0, end: 1 }),
            frameRate: 2,
            repeat: -1
        });

        this.lambs = this.add.group({ runChildUpdate: true });
        repeat(NUMBER_OF_LAMBS, () => {
            const newLamb = new Lamb(this, Phaser.Math.Between(128, this.scale.width - 128), Phaser.Math.Between(128, this.scale.height - 128))
            this.lambs.add(newLamb);
        })

        this.physics.add.collider(this.lambs, this.fences);

        EventBus.emit('current-scene-ready', this);

    }

    update() {
    }

}

function repeat(count, callback) {
    for (let i = 0; i < count; i++) {
        callback(i);
    }
}
