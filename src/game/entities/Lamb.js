import Phaser from 'phaser';

const LAMB_STATE_WANDER = 'wander';
const LAMB_STATE_DIRECT_CONTROL = 'direct-control';

const LAMB_SPEED = 200;

class Lamb extends Phaser.Physics.Arcade.Sprite {

    cursorKeys = null;
    target = null;
    emote = null;

    constructor(scene, x, y) {
        super(scene, x, y, 'lamb');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('lamb', { start: 0, end: 1 }),
            frameRate: 2,
            repeat: -1
        });
        this.anims.play('walk');
        this.setScale(2);
        this.setCollideWorldBounds(true);
        this.body.setOffset(0, 40);
        this.body.setSize(64, 24, false);
        this.state = LAMB_STATE_WANDER;

        this.cursorKeys = scene.input.keyboard.createCursorKeys();

        this.setMovementMode(LAMB_STATE_WANDER);

        this.on('lamb-reached-target', () => {
            this.scene.time.delayedCall(2000, () => {
                const newTarget = this.getRandomLocationInSceneBounds();
                this.sendToLocation(newTarget.x, newTarget.y);
            }, [], this);
        });

        this.scene.events.on('postupdate', (time, delta) => {
            if (this.emote) {
                this.emote.setFlipX(this.flipX);
                this.emote.setX(this.flipX ? this.x - 72 : this.x + 72);
                this.emote.y = this.y - 60;
            }
        });

        this.scene.time.delayedCall(Phaser.Math.Between(2000, 5000), this.toggleEmote, [], this);

    }

    setMovementMode(mode) {
        if (mode === LAMB_STATE_WANDER) {
            this.state = LAMB_STATE_WANDER;
            if (!this.target) {
                const newTarget = this.getRandomLocationInSceneBounds();
                this.sendToLocation(newTarget.x, newTarget.y);
            }
            return;
        }
        if (mode === LAMB_STATE_DIRECT_CONTROL) {
            this.state = LAMB_STATE_DIRECT_CONTROL;
            this.target = null;
            this.setVelocity(0);
            return;
        }
    }

    sendToLocation(x, y) {
        this.scene.physics.moveTo(this, x, y, LAMB_SPEED);
        this.target = new Phaser.Math.Vector2(x, y);
    }

    update(time, delta) {
        if (this.body.x != this.body.prev.x) {
            this.body.velocity.x > 0 ? this.setFlipX(false) : this.setFlipX(true);
        }

        if (this.state === LAMB_STATE_DIRECT_CONTROL) {
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
        if (this.emote) this.emote.depth = this.depth + 1;
    }

    checkArrivedAtTarget() {
        if (!this.target) return;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
        if (distance < 10) { // Adjust the threshold as needed
            this.setVelocity(0);
            this.target = null;
            this.emit('lamb-reached-target'); // Emit a custom event
        }
    }

    getRandomLocationInSceneBounds() {
        const EDGE_BUFFER = 128;
        return new Phaser.Math.Vector2(
            Phaser.Math.Between(EDGE_BUFFER, this.scene.scale.width - EDGE_BUFFER),
            Phaser.Math.Between(EDGE_BUFFER, this.scene.scale.height - EDGE_BUFFER)
        );
    }

    toggleEmote() {
        if (this.emote) {
            this.emote.destroy();
            this.emote = null;
            this.scene.time.delayedCall(Phaser.Math.Between(2000, 5000), this.toggleEmote, [], this);
        } else {
            this.emote = this.scene.add.sprite(this.x, this.y, 'emote_bubbles');
            this.emote.setScale(2);
            this.emote.setFrame(Phaser.Math.Between(1, 3));
            this.scene.time.delayedCall(Phaser.Math.Between(2000, 5000), this.toggleEmote, [], this);
        }
    }

}

export default Lamb;