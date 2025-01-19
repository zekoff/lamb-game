import Phaser from 'phaser';
import Emote from './Emote';
import Coin from './Coin';

class Lamb extends Phaser.Physics.Arcade.Sprite {

    static STATE_WANDER = 'wander';
    static SPEED = 100;
    static CONDITION_HUNGRY = 'hungry';
    static CONDITION_BORED = 'bored';

    target = null;
    childObjects = null;
    conditions = [];
    timeSinceActivity = 0;
    timeSinceEmote = 0;
    timeTillNextEmote = 0;
    happiness = 100;
    hunger = 0;

    constructor(scene, x, y, debugConfig = {}) {
        super(scene, x, y, 'lamb');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.play({ key: 'lamb-idle' });
        this.setScale(2);
        this.setCollideWorldBounds(true);
        this.state = Lamb.STATE_WANDER;

        this.setInteractive();
        this.on('pointerup', this.pet, this);

        this.setMovementMode(Lamb.STATE_WANDER);

        this.on('lamb-reached-target', () => {
        });

        this.childObjects = this.scene.add.group({ runChildUpdate: true });

        if (debugConfig.hungry) {
            this.conditions.push(Lamb.CONDITION_HUNGRY);
        }

        this.timeTillNextEmote = Phaser.Math.RND.between(4000, 8000)
    }

    setMovementMode(mode) {
        if (mode === Lamb.STATE_WANDER) {
            this.state = Lamb.STATE_WANDER;
            if (!this.target) {
                const newTarget = this.getRandomLocationInSceneBounds();
                this.sendToLocation(newTarget.x, newTarget.y);
            }
            return;
        }
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

        if (this.target) {
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
            } else {
                this.emote(Emote.MUSIC);
            }
        }

        if (this.conditions.includes(Lamb.CONDITION_BORED)) {
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
            this.setVelocity(0);
            this.target = null;
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
        Array.from({ length: 5 }).forEach(() => {
            let newCoin = new Coin(this.scene, this.x, this.y);
            newCoin.setVisible(false);
            this.scene.tweens.add({
                onStart: () => {
                    newCoin.setVisible(true);
                },
                delay: Phaser.Math.RND.between(0, 1000),
                targets: newCoin,
                x: this.x + Phaser.Math.Between(-64, 64),
                y: this.y + Phaser.Math.Between(-64, 64),
                duration: 1000,
                ease: 'Power1',
                onComplete: () => {
                    newCoin.collect();
                }
            });
        });
    }

    pet() {
        console.log(`Petting ${this.name}`);
        this.disableInteractive();
        this.emote(Emote.HEART);
        this.scene.tweens.add({
            targets: this,
            scaleY: this.scaleY * .9,
            scaleX: this.scaleX * 1.1,
            duration: 250,
            ease: 'Power2',
            yoyo: true,
            onComplete: () => this.setInteractive(),
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