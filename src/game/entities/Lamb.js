import Phaser from 'phaser';
import Emote from './Emote';
import Coin from './Coin';

class Lamb extends Phaser.Physics.Arcade.Sprite {

    static SPEED = 100;
    static CONDITION_HUNGRY = 'hungry';
    static CONDITION_BORED = 'bored';
    static CONDITION_UNLOVED = 'unloved';
    static CONDITION_SICK = 'sick';
    static CONDITION_SAD = 'sad';
    static CONDITION_NOMUSIC = 'noMusic';

    target = null;
    childObjects = null;
    conditions = [];
    timeSinceActivity = 0;
    timeSinceEmote = 0;
    timeTillNextEmote = 0;
    beingDragged = false;

    constructor(scene, x, y, debugConfig) {
        super(scene, x, y, 'lamb');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.play({ key: 'lamb-idle' });
        this.setScale(2);
        this.setCollideWorldBounds(true);
        this.isDragging = false;
        this.dragThreshold = 10; // Pixels
        this.startPointerPosition = new Phaser.Math.Vector2();
        this.timeTillNextEmote = Phaser.Math.RND.between(4000, 8000);
        this.childObjects = this.scene.add.group({ runChildUpdate: true });
        if (debugConfig) this.setDebugConditions(debugConfig);

        // set up events and interactivity
        // this.setInteractive({ draggable: true });
        this.setInteractive();
        this.on('dragstart', this.onDragStart, this);
        this.on('drag', this.onDrag, this);
        this.on('dragend', this.onDragEnd, this);
        this.on('pointerdown', this.onPointerDown, this);
        this.on('pointerup', this.onPointerUp, this);
        this.on('lamb-reached-target', this.onReachedTarget, this);

        // give lambs initial movement
        const newTarget = this.getRandomLocationInSceneBounds();
        this.sendToLocation(newTarget.x, newTarget.y);

    }

    setDebugConditions(debugConfig) {
        if (debugConfig.hungry) {
            this.conditions.push(Lamb.CONDITION_HUNGRY);
        }
        if (debugConfig.bored) {
            this.conditions.push(Lamb.CONDITION_BORED);
        }
        if (debugConfig.unloved) {
            this.conditions.push(Lamb.CONDITION_UNLOVED);
        }
        if (debugConfig.sick) {
            this.conditions.push(Lamb.CONDITION_SICK);
        }
        if (debugConfig.sad) {
            this.conditions.push(Lamb.CONDITION_SAD);
        }
        if (debugConfig.noMusic) {
            this.conditions.push(Lamb.CONDITION_NOMUSIC);
        }
    }

    onReachedTarget() {
        this.setVelocity(0);
        this.target = null;
    }

    onPointerDown(pointer) {
        this.startPointerPosition.set(pointer.x, pointer.y);
        this.isDragging = false;
    }

    onPointerUp(pointer) {
        console.log('lamb pointerup');
        if (!this.isDragging) {
            console.log(`Tapped ${this.name} at (${pointer.x}, ${pointer.y})`);
            this.pet();
        }
    }

    onDragStart() {
        console.log('lamb dragstart');
        this.anims.play('lamb-scurry');
        this.emit('lamb-reached-target');
        this.beingDragged = true;
    }

    onDrag(pointer, dragX, dragY) {
        this.x = dragX;
        this.y = dragY;
        const distance = Phaser.Math.Distance.Between(this.startPointerPosition.x, this.startPointerPosition.y, pointer.x, pointer.y);
        if (distance > this.dragThreshold) {
            this.isDragging = true;
        }
    }

    onDragEnd() {
        console.log('lamb dragend');
        this.anims.play('lamb-idle');
        this.scene.tweens.add({
            targets: this,
            y: this.y + 20,
            duration: 200,
            ease: 'Cubic.easeIn'
        });
        this.beingDragged = false;
    }

    sendToLocation(x, y) {
        this.play('lamb-walk');
        this.scene.physics.moveTo(this, x, y, Lamb.SPEED);
        this.target = new Phaser.Math.Vector2(x, y);
    }

    update(time, delta) {
        this.timeSinceActivity += delta;
        this.timeSinceEmote += delta;
        this.depth = this.y;

        if (this.target || this.beingDragged) {
            this.timeSinceActivity = 0;
        }
        if (this.timeSinceActivity > 5000) {
            this.addCondition(Lamb.CONDITION_BORED);
        }
        if (this.timeSinceEmote > this.timeTillNextEmote) {
            this.timeSinceEmote = 0;
            this.timeTillNextEmote = Phaser.Math.RND.between(4000, 8000);
            if (this.conditions.includes(Lamb.CONDITION_HUNGRY)) {
                this.emote(Emote.FOOD);
            } else if (this.conditions.includes(Lamb.CONDITION_SICK)) {
                this.emote(Emote.SICK);
            } else {
                this.emote(Emote.MUSIC);
            }
        }

        if (this.conditions.includes(Lamb.CONDITION_BORED) && !this.beingDragged) {
            console.log('sending bored lamb to new location');
            const newTarget = this.getRandomLocationInSceneBounds();
            this.sendToLocation(newTarget.x, newTarget.y);
            this.removeCondition(Lamb.CONDITION_BORED);
        }

        if (this.body.x != this.body.prev.x) {
            if (this.body.velocity.x > 0) {
                this.setFlipX(false);
            } else if (this.body.velocity.x < 0) {
                this.setFlipX(true);
            }
        }

        this.checkArrivedAtTarget();
    }

    checkArrivedAtTarget() {
        if (!this.target) return;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
        if (distance < 10) { // Arbitrary threshold for "close enough"
            this.emit('lamb-reached-target');
            this.anims.play('lamb-idle');
        }
    }

    getRandomLocationInSceneBounds() {
        const EDGE_BUFFER = 128;
        return new Phaser.Math.Vector2(
            Phaser.Math.Between(EDGE_BUFFER, this.scene.scale.width - EDGE_BUFFER),
            Phaser.Math.Between(EDGE_BUFFER, this.scene.scale.height - EDGE_BUFFER)
        );
    }

    eat() {
        console.log(`${this.name} is eating`);
        this.target = null;
        this.setVelocity(0);
        this.play('lamb-eat').chain('lamb-idle');
        this.removeCondition(Lamb.CONDITION_HUNGRY);
        this.emote(Emote.HAPPY);
        Array.from({ length: 5 }).forEach(() => {
            new Coin(this.scene, this.x, this.y, true);
        });
    }

    pet() {
        this.disableInteractive();
        this.scene.tweens.add({
            targets: this,
            scaleY: this.scaleY * .9,
            scaleX: this.scaleX * 1.1,
            duration: 250,
            ease: 'Power2',
            yoyo: true,
            onComplete: () => this.setInteractive(),
        });
        if (!this.conditions.includes(Lamb.CONDITION_UNLOVED)) {
            console.log(`${this.name} is already loved`);
            return;
        }
        console.log(`Petting ${this.name}`);
        this.removeCondition(Lamb.CONDITION_UNLOVED);
        this.emote(Emote.HAPPY);
        Array.from({ length: 5 }).forEach(() => {
            new Coin(this.scene, this.x, this.y, true);
        });
    }

    heal() {
        if (!this.conditions.includes(Lamb.CONDITION_SICK)) {
            console.log(`${this.name} is not sick`);
            return;
        }
        console.log(`Healing ${this.name}`);
        this.removeCondition(Lamb.CONDITION_SICK);
        this.emote(Emote.HAPPY);
        Array.from({ length: 5 }).forEach(() => {
            new Coin(this.scene, this.x, this.y, true);
        });
    }

    listenToMusic() {
        if (!this.conditions.includes(Lamb.CONDITION_NOMUSIC)) {
            console.log(`${this.name} is already has music needs met`);
            return;
        }
        console.log(`${this.name} is listening to music`);
        this.removeCondition(Lamb.CONDITION_NOMUSIC);
        this.emote(Emote.HAPPY);
        Array.from({ length: 5 }).forEach(() => {
            new Coin(this.scene, this.x, this.y, true);
        });
    }

    addCondition(condition) {
        this.conditions.push(condition);
    }

    removeCondition(condition) {
        const index = this.conditions.indexOf(condition);
        if (index !== -1) {
            this.conditions.splice(index, 1);
        }
    }

    emote(emoteType) {
        this.childObjects.add(new Emote(this, emoteType));
    }

}

export default Lamb;