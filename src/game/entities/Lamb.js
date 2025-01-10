import Phaser from 'phaser';
import Emote from './Emote';

class Lamb extends Phaser.Physics.Arcade.Sprite {

    static STATE_WANDER = 'wander';
    static STATE_DIRECT_CONTROL = 'direct-control';
    static SPEED = 100;
    static CONDITION_HUNGRY = 'hungry';
    static CONDITION_BORED = 'bored';

    cursorKeys = null;
    target = null;
    childObjects = null;
    conditions = [];
    timeSinceActivity = 0;

    constructor(scene, x, y, debugConfig = {}) {
        super(scene, x, y, 'lamb');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.play({ key: 'lamb-walk', delay: Phaser.Math.RND.between(0, 1000) });
        this.setScale(2);
        this.setCollideWorldBounds(true);
        this.body.setOffset(0, 40);
        this.body.setSize(64, 24, false);
        this.state = Lamb.STATE_WANDER;

        this.cursorKeys = scene.input.keyboard.createCursorKeys();

        this.setMovementMode(Lamb.STATE_WANDER);

        this.on('lamb-reached-target', () => {
            this.emote(Phaser.Math.RND.pick([Emote.HEART, Emote.ANGRY, Emote.MUSIC]));
        });

        this.childObjects = this.scene.add.group({ runChildUpdate: true });

        if (debugConfig.hungry) {
            this.conditions.push(Lamb.CONDITION_HUNGRY);
        }
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
        if (mode === Lamb.STATE_DIRECT_CONTROL) {
            this.state = Lamb.STATE_DIRECT_CONTROL;
            this.target = null;
            this.setVelocity(0);
            return;
        }
    }

    sendToLocation(x, y) {
        this.scene.physics.moveTo(this, x, y, Lamb.SPEED);
        this.target = new Phaser.Math.Vector2(x, y);
    }

    update(time, delta) {
        this.timeSinceActivity += delta;
        if (this.target) {
            this.timeSinceActivity = 0;
        }
        if (this.timeSinceActivity > 5000) {
            this.addCondition(Lamb.CONDITION_BORED);
        }

        if (this.conditions.includes(Lamb.CONDITION_BORED)) {
            const newTarget = this.getRandomLocationInSceneBounds();
            this.sendToLocation(newTarget.x, newTarget.y);
            this.removeCondition(Lamb.CONDITION_BORED);
        }

        if (this.body.x != this.body.prev.x) {
            this.body.velocity.x > 0 ? this.setFlipX(false) : this.setFlipX(true);
        }

        if (this.state === Lamb.STATE_DIRECT_CONTROL) {
            if (this.cursorKeys.left.isDown) {
                this.setVelocityX(-240);
            } else if (this.cursorKeys.right.isDown) {
                this.setVelocityX(240);
            } else {
                this.setVelocityX(0);
            }

            if (this.cursorKeys.up.isDown) {
                this.setVelocityY(-240);
            } else if (this.cursorKeys.down.isDown) {
                this.setVelocityY(240);
            } else {
                this.setVelocityY(0);
            }

            this.scene.input.on('pointerup', (pointer) => {
                this.lamb.sendToLocation(pointer.x, pointer.y);
            });

        }

        this.checkArrivedAtTarget();

        this.depth = this.y;
    }

    checkArrivedAtTarget() {
        if (!this.target) return;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
        if (distance < 10) { // Arbitrary threshold for "close enough"
            this.setVelocity(0);
            this.target = null;
            this.emit('lamb-reached-target');
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
        this.removeCondition(Lamb.CONDITION_HUNGRY);
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