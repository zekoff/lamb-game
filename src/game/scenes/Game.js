import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import Lamb from '../entities/Lamb';
import Food from '../entities/Food';

const NUMBER_OF_LAMBS = 2;

export class Game extends Scene {

    lambs = null;
    fences = null;
    background = null;
    pastureObjects = null;
    draggableFood = null;
    coins = 0;
    coinsText = null;

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
        this.load.image('nine-slice', 'test_nine_slice.png');
    }

    create() {

        const gameLayer = this.add.layer();
        const uiLayer = this.add.layer();
        this.pastureObjects = this.add.group({
            runChildUpdate: true,
        });

        this.background = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'background');
        this.background.setOrigin(0, 0);
        gameLayer.add(this.background);

        const fencesNeeded = Math.ceil(this.scale.width / 64);
        this.fences = this.physics.add.staticGroup({ key: 'fence', frame: 0, repeat: fencesNeeded, setXY: { x: 0, y: 32, stepX: 64 } });
        this.fences.getChildren().forEach(fence => {
            fence.setFrame(Phaser.Math.Between(0, 3));
        });
        gameLayer.add(this.fences.getChildren());

        this.anims.create({
            key: 'lamb-idle',
            frames: this.anims.generateFrameNumbers('lamb', { start: 0, end: 0 }),
            frameRate: 1,
            repeat: -1
        });
        this.anims.create({
            key: 'lamb-walk',
            frames: this.anims.generateFrameNumbers('lamb', { start: 0, end: 1 }),
            frameRate: 2,
            repeat: -1
        });
        this.anims.create({
            key: 'lamb-eat',
            frames: this.anims.generateFrameNumbers('lamb', { start: 2, end: 2 }),
            duration: 1000
        });
        this.anims.create({
            key: 'coin-spin',
            frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1,
            yoyo: true
        });

        this.lambs = this.add.group({ runChildUpdate: true });
        const lambie = {name: "Lambie", tint: 0xcccccc};
        const mambie = {name: "Mambie", tint: 0xffffff};
        [lambie, mambie].forEach((config, index) => {
            const newLamb = new Lamb(
                this,
                Phaser.Math.Between(128, this.scale.width - 128),
                Phaser.Math.Between(128, this.scale.height - 128),
                { hungry: true }
            );
            newLamb.name = config.name;
            newLamb.setTint(config.tint);
            this.lambs.add(newLamb);
            gameLayer.add(newLamb);
        });

        this.physics.add.collider(this.lambs, this.fences);

        const bottomShelf = this.make.nineslice({
            x: 128,
            y: this.scale.height - 128,
            key: 'nine-slice',
            width: this.scale.width / 2 - 128,
            height: 64,
            leftWidth: 16,
            rightWidth: 16,
            topHeight: 16,
            bottomHeight: 16,
            scale: {
                x: 2,
                y: 2
            },
            origin: {
                x: 0,
                y: 0
            },
            add: true
        });
        uiLayer.add(bottomShelf);
        this.coinsText = this.add.text(128, 128, `Coins: ${this.coins}`, { color: 'black', fontSize: '24px', backgroundColor: 'white' });
        uiLayer.add(this.coinsText);
        this.events.on('coin-collected', (coin) => {
        });

        this.populateDraggableFood();
        this.events.on('food-dropped', (food) => {
            this.pastureObjects.add(food);
            gameLayer.add(food);
            const hungryLambs = this.lambs.getChildren().filter(lamb => lamb.conditions.includes(Lamb.CONDITION_HUNGRY));
            if (hungryLambs.length > 0)
                hungryLambs[0].sendToLocation(food.x, food.y);
            this.populateDraggableFood()
        });

        this.physics.add.overlap(this.lambs, this.pastureObjects, (lamb, food) => {
            if (lamb.conditions.includes(Lamb.CONDITION_HUNGRY)) {
                lamb.eat(food);
                food.timeoutTimer.remove();
                food.destroy();
            }
        });

        EventBus.emit('current-scene-ready', this);

    }

    update() {
    }

    populateDraggableFood() {
        this.draggableFood = new Food(this, 256, this.scale.height - 64);
    }

}
