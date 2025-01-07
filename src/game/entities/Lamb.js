import Phaser from 'phaser';
import Emote from './Emote';

class Lamb extends Phaser.Physics.Arcade.Sprite {

    static LAMB_STATE_WANDER = 'wander';
    static LAMB_STATE_DIRECT_CONTROL = 'direct-control';
    static LAMB_SPEED = 200;

    cursorKeys = null;
    target = null;
    childObjects = null;
    wants = [];

    constructor(scene, x, y, debugConfig = {}) {
        super(scene, x, y, 'lamb');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.anims.play('lamb-walk');
        this.setScale(2);
        this.setCollideWorldBounds(true);
        this.body.setOffset(0, 40);
        this.body.setSize(64, 24, false);
        this.state = Lamb.LAMB_STATE_WANDER;

        this.cursorKeys = scene.input.keyboard.createCursorKeys();

        this.setMovementMode(Lamb.LAMB_STATE_WANDER);

        this.on('lamb-reached-target', () => {
            this.childObjects.add(new Emote(this, Phaser.Math.RND.pick([Emote.HEART, Emote.ANGRY, Emote.MUSIC])));
            this.scene.time.delayedCall(2000, () => {
                // BUG: if this fires when a lamb is on its way to feed itself, it will set the new location and no longer seek the food
                const newTarget = this.getRandomLocationInSceneBounds();
                this.sendToLocation(newTarget.x, newTarget.y);
            }, [], this);
        });

        this.childObjects = this.scene.add.group({ runChildUpdate: true });

        if (debugConfig.hungry) {
            this.wants.push('hungry');
        }
    }

    setMovementMode(mode) {
        if (mode === Lamb.LAMB_STATE_WANDER) {
            this.state = Lamb.LAMB_STATE_WANDER;
            if (!this.target) {
                const newTarget = this.getRandomLocationInSceneBounds();
                this.sendToLocation(newTarget.x, newTarget.y);
            }
            return;
        }
        if (mode === Lamb.LAMB_STATE_DIRECT_CONTROL) {
            this.state = Lamb.LAMB_STATE_DIRECT_CONTROL;
            this.target = null;
            this.setVelocity(0);
            return;
        }
    }

    sendToLocation(x, y) {
        this.scene.physics.moveTo(this, x, y, Lamb.LAMB_SPEED);
        this.target = new Phaser.Math.Vector2(x, y);
    }

    update(time, delta) {
        if (this.body.x != this.body.prev.x) {
            this.body.velocity.x > 0 ? this.setFlipX(false) : this.setFlipX(true);
        }

        if (this.state === Lamb.LAMB_STATE_DIRECT_CONTROL) {
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
        const hungryIndex = this.wants.indexOf('hungry');
        if (hungryIndex !== -1) {
            this.wants.splice(hungryIndex, 1);
        }
    }

}

export default Lamb;