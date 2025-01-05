import Phaser from 'phaser';

class Lamb extends Phaser.Physics.Arcade.Sprite {

    cursorKeys = null;
    manualMovementActive = true;
    scene = null;
    target = null;

    constructor(scene, x, y) {
        super(scene, x, y, 'lamb');
        this.scene = scene;
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

        this.cursorKeys = scene.input.keyboard.createCursorKeys();
    }

    sendToLocation(x, y) {
        this.manualMovementActive = false;
        this.scene.physics.moveTo(this, x, y, 200);
        this.target = new Phaser.Math.Vector2(x, y);
    }

    update(time, delta) {

        if (this.manualMovementActive) {
            if (this.cursorKeys.left.isDown) {
                this.setVelocityX(-240);
                this.setFlipX(false);
            } else if (this.cursorKeys.right.isDown) {
                this.setFlipX(true);
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
        } else if (this.target) {
            const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
            if (distance < 10) { // Adjust the threshold as needed
                this.setVelocity(0);
                this.manualMovementActive = true;
                this.target = null;
                this.emit('reachtarget'); // Emit a custom event
            }
        }

    }
}

export default Lamb;