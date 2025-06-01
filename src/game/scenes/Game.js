import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import Lamb from '../entities/Lamb';
import Food from '../entities/Food';
import Balloon from '../entities/Balloon';
import { getDatabase, child, ref, get, onValue, increment, update } from 'firebase/database';
import Pill from '../entities/Pill';
import Guitar from '../entities/Guitar';

export class Game extends Scene {

    lambs = null;
    fences = null;
    background = null;
    pastureObjects = null; // Physics group to test collision
    draggableFood = null;
    draggableBalloon = null;
    draggablePill = null;
    draggableGuitar = null;
    coins = 0;
    coinsText = null;
    uiLayer = null;
    gameLayer = null;

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
        this.load.image('balloon', 'balloon.png');
        this.load.spritesheet('balloon_sheet', 'balloon_sheet.png', { frameWidth: 32, frameHeight: 32 });
        this.load.image('pill', 'pill.png');
        this.load.image('guitar', 'guitar.png');
        this.load.image('acc_bow', 'bow.png');
        this.load.spritesheet('accessories', 'accessory.png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {

        this.gameLayer = this.add.layer();
        this.uiLayer = this.add.layer();
        this.pastureObjects = this.add.group({
            runChildUpdate: true,
        });

        this.background = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'background');
        this.background.setOrigin(0, 0);
        this.gameLayer.add(this.background);

        const fencesNeeded = Math.ceil(this.scale.width / 64);
        this.fences = this.physics.add.staticGroup({ key: 'fence', frame: 0, repeat: fencesNeeded, setXY: { x: 0, y: 32, stepX: 64 } });
        this.fences.getChildren().forEach(fence => {
            fence.setFrame(Phaser.Math.Between(0, 3));
        });
        this.gameLayer.add(this.fences.getChildren());

        this.createAnimations();

        // create lambs from Firebase
        this.lambs = this.add.group({ runChildUpdate: true });
        const dbRef = ref(getDatabase());
        get(child(dbRef, 'lambs')).then((snapshot) => {
            if (snapshot.exists()) {
                console.log(snapshot.val());
                this.createLambs(snapshot.val(), this.gameLayer);
            } else {
                console.log('No data available');
            }
        }).catch((error) => {
            console.error(error);
        });

        // create coins from Firebase and listen for changes
        onValue(child(dbRef, 'inventory'), (snapshot) => {
            console.log(snapshot.val());
            this.coins = snapshot.val().coins;
        });
        this.events.on('coin-collected', (coin) => {
            coin.destroy();
            const fbUpdates = {};
            fbUpdates[`/inventory/coins`] = increment(1);
            update(ref(getDatabase()), fbUpdates);
        });

        this.createUi();

        this.setupPhysics();

        EventBus.emit('current-scene-ready', this);

    }

    createLambs(lambObject, gameLayer) {
        console.log('creating lambs');
        Object.keys(lambObject).forEach(key => {
            const lambData = lambObject[key];
            const newLamb = new Lamb(
                this,
                Phaser.Math.Between(128, this.scale.width - 128),
                Phaser.Math.Between(128, this.scale.height - 128),
                {
                    [Lamb.CONDITION_HUNGRY]: true,
                    [Lamb.CONDITION_UNLOVED]: true,
                    // [Lamb.CONDITION_SICK]: lambData.sick || false,
                    [Lamb.CONDITION_SICK]: true,
                    [Lamb.CONDITION_NOMUSIC]: true,
                    [Lamb.CONDITION_SAD]: true,
                }
            );
            newLamb.name = key;
            newLamb.setTint(`0x${lambData.tint}`);
            this.lambs.add(newLamb);
            gameLayer.add(newLamb);
        }, this);
    }

    createUi() {
        // create UI
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
        this.uiLayer.add(bottomShelf);
        this.coinsText = this.add.text(128, 128, `Coins: ${this.coins}`, { color: 'black', fontSize: '24px', backgroundColor: 'white' });
        this.uiLayer.add(this.coinsText);
        this.addDraggableFoodToUi();
        this.events.on('food-dropped', (food) => {
            food.disableInteractive();
            this.pastureObjects.add(food);
            this.gameLayer.add(food);
            const hungryLambs = this.lambs.getChildren().filter(lamb => lamb.conditions.includes(Lamb.CONDITION_HUNGRY));
            if (hungryLambs.length > 0)
                hungryLambs[0].sendToLocation(food.x, food.y);
            this.addDraggableFoodToUi()
        });
        this.addDraggableBalloonToUi();
        this.events.on('balloon-dropped', (balloon) => {
            balloon.disableInteractive();
            this.pastureObjects.add(balloon);
            this.gameLayer.add(balloon);
            const sadLambs = this.lambs.getChildren().filter(lamb => lamb.conditions.includes(Lamb.CONDITION_SAD));
            if (sadLambs.length > 0)
                sadLambs[0].sendToLocation(balloon.x, balloon.y);
            this.addDraggableBalloonToUi();
        });
        this.addDraggablePillToUi();
        this.events.on('pill-dropped', (pill) => {
            pill.disableInteractive();
            this.pastureObjects.add(pill);
            this.gameLayer.add(pill);
            const sickLambs = this.lambs.getChildren().filter(lamb => lamb.conditions.includes(Lamb.CONDITION_SICK));
            if (sickLambs.length > 0)
                sickLambs[0].sendToLocation(pill.x, pill.y);
            this.addDraggablePillToUi();
        });
        this.addDraggableGuitarToUi();
        this.events.on('guitar-dropped', (guitar) => {
            guitar.disableInteractive();
            this.pastureObjects.add(guitar);
            this.gameLayer.add(guitar);
            const nomusicLambs = this.lambs.getChildren().filter(lamb => lamb.conditions.includes(Lamb.CONDITION_NOMUSIC));
            if (nomusicLambs.length > 0)
                nomusicLambs[0].sendToLocation(guitar.x, guitar.y);
            this.addDraggableGuitarToUi();
        });
    }

    setupPhysics() {
        this.physics.add.collider(this.lambs, this.fences);
        this.physics.add.overlap(this.lambs, this.pastureObjects, (lamb, pastureObject) => {
            console.log('lamb overlaps pastureObject');
            if (pastureObject instanceof Food && lamb.conditions.includes(Lamb.CONDITION_HUNGRY)) {
                const food = pastureObject;
                lamb.eat(food);
                food.timeoutTimer.remove();
                food.destroy();
            }
            if (pastureObject instanceof Balloon && lamb.conditions.includes(Lamb.CONDITION_SAD)) {
                this.physics.world.disable(pastureObject);
                console.log('lamb popped balloon');
                lamb.playWithBalloon();
                pastureObject.play('balloon-pop');
                pastureObject.timeoutTimer.remove();
                // pastureObject.destroy();
                pastureObject.on('animationcomplete', () => {
                    // Call your function here
                    pastureObject.destroy();
                });
            }
            if (pastureObject instanceof Pill && lamb.conditions.includes(Lamb.CONDITION_SICK)) {
                this.physics.world.disable(pastureObject);
                console.log('lamb took medicine');
                lamb.heal();
                pastureObject.timeoutTimer.remove();
                pastureObject.destroy();
            }
            if (pastureObject instanceof Guitar && lamb.conditions.includes(Lamb.CONDITION_NOMUSIC)) {
                this.physics.world.disable(pastureObject);
                console.log('lamb listened to music');
                lamb.listenToMusic();
                pastureObject.timeoutTimer.remove();
                pastureObject.destroy();
            }
        });
    }

    createAnimations() {
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
            key: 'lamb-scurry',
            frames: this.anims.generateFrameNumbers('lamb', { start: 0, end: 1 }),
            frameRate: 8,
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
        this.anims.create({
            key: 'balloon-pop',
            frames: this.anims.generateFrameNumbers('balloon_sheet', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: 0,
        })
    }

    update() {
        this.coinsText.setText(`Coins: ${this.coins}`);
    }

    addDraggableFoodToUi() {
        this.draggableFood = new Food(this, 256, this.scale.height - 64);
        this.tweens.add({
            targets: this.draggableFood,
            scale: { from: 0, to: 2 },
            duration: 500,
            ease: 'Power2'
        });
    }

    addDraggableBalloonToUi() {
        this.draggableBalloon = new Balloon(this, 512, this.scale.height - 64);
        this.tweens.add({
            targets: this.draggableBalloon,
            scale: { from: 0, to: 2 },
            duration: 500,
            ease: 'Power2'
        });
    }

    addDraggablePillToUi() {
        this.draggablePill = new Pill(this, 768, this.scale.height - 64);
        this.tweens.add({
            targets: this.draggablePill,
            scale: { from: 0, to: 2 },
            duration: 500,
            ease: 'Power2'
        });
    }

    addDraggableGuitarToUi() {
        this.draggableGuitar = new Guitar(this, 1024, this.scale.height - 64);
        this.tweens.add({
            targets: this.draggableGuitar,
            scale: { from: 0, to: 2 },
            duration: 500,
            ease: 'Power2'
        });
    }

}
