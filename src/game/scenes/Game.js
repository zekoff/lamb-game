import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import Lamb from '../entities/Lamb';
import Food from '../entities/Food';
import Coin from '../entities/Coin';

const NUMBER_OF_LAMBS = 2;

export class Game extends Scene {

    lambs = null;
    fences = null;
    background = null;
    pastureObjects = null;

    constructor() {
        super('Game');
    }

    preload() {
        this.load.setPath('assets');
        this.load.spritesheet('lamb', 'lamb.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('background', 'background.png');
        this.load.spritesheet('fence', 'fence_sheet.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('emote_bubbles', 'emote_bubble.png', { frameWidth: 32, frameHeight: 32 });
        this.load.image('apple', 'apple.png');
        this.load.spritesheet('coin', 'coin.png', { frameWidth: 32, frameHeight: 32 });
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
        this.anims.create({
            key: 'coin-spin',
            frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1,
            yoyo: true
        });

        for (let i = 0; i < 5; i++) {
            new Coin(this, Phaser.Math.RND.between(200, 600), Phaser.Math.RND.between(200, 600));
        }

        this.lambs = this.add.group({ runChildUpdate: true });
        Array.from({ length: NUMBER_OF_LAMBS }).forEach((_, index) => {
            const newLamb = new Lamb(
                this,
                Phaser.Math.Between(128, this.scale.width - 128),
                Phaser.Math.Between(128, this.scale.height - 128),
                { hungry: true }
            );
            newLamb.name = `Lamb ${index}`;
            this.lambs.add(newLamb);
        });

        this.physics.add.collider(this.lambs, this.fences);

        this.pastureObjects = this.add.group({ runChildUpdate: true });
        this.input.on('pointerup', (pointer) => {
            this.pastureObjects.add(new Food(this, pointer.x, pointer.y));
            const hungryLambs = this.lambs.getChildren().filter(lamb => lamb.conditions.includes(Lamb.CONDITION_HUNGRY));
            if (hungryLambs.length > 0)
                hungryLambs[0].sendToLocation(pointer.x, pointer.y);
        });

        this.physics.add.overlap(this.lambs, this.pastureObjects, (lamb, food) => {
            if (lamb.conditions.includes(Lamb.CONDITION_HUNGRY)) {
                console.log(`Lamb ${lamb.name} is eating`);
                lamb.eat(food);
                food.destroy();
            }
        });

        EventBus.emit('current-scene-ready', this);

    }

    update() {
    }

}
